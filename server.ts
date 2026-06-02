import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dns from "dns";

// Fix Node.js resolving localhost with IPv6 sometimes causing issue
dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Special debugging route to find the uploaded image and its exact filename
  app.get("/api/debug-files", (req, res) => {
    try {
      const getFiles = (dir: string): string[] => {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return results;
        const list = fs.readdirSync(dir);
        list.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat && stat.isDirectory()) {
            // skip node_modules and .git
            if (file !== "node_modules" && file !== ".git") {
              results = results.concat(getFiles(filePath));
            }
          } else {
            results.push(path.relative(process.cwd(), filePath));
          }
        });
        return results;
      };
      
      const files = getFiles(process.cwd());
      res.json({ files });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Support logo uploads in the root structure (since dragging into workspace root directory is easiest for the user)
  app.get(["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.webp", "/logo.svg"], (req, res, next) => {
    const filename = path.basename(req.path);
    const rootPath = path.join(process.cwd(), filename);
    const publicPath = path.join(process.cwd(), "public", filename);
    
    if (fs.existsSync(rootPath)) {
      return res.sendFile(rootPath);
    } else if (fs.existsSync(publicPath)) {
      return res.sendFile(publicPath);
    }
    next();
  });

  // Dynamic manifest.json to only serve the logo matching the user's custom photo (hiding standard SVG if photo is present)
  app.get("/manifest.json", (req, res) => {
    const possibleLogos = ["logo.png", "logo.jpg", "logo.jpeg", "logo.webp"];
    let activeLogo = "/logo.svg";
    let type = "image/svg+xml";

    for (const logo of possibleLogos) {
      const rootPath = path.join(process.cwd(), logo);
      const publicPath = path.join(process.cwd(), "public", logo);
      
      const fileExists = (p: string) => {
        try {
          return fs.existsSync(p) && fs.statSync(p).size > 250;
        } catch {
          return false;
        }
      };

      if (fileExists(rootPath) || fileExists(publicPath)) {
        activeLogo = `/${logo}`;
        type = `image/${logo.split(".").pop() === "jpg" ? "jpeg" : logo.split(".").pop()}`;
        break;
      }
    }

    const manifest = {
      name: "Eu Sou Capaz",
      short_name: "Eu Sou Capaz",
      description: "Painel de Consistência e Desafio de Hábitos",
      start_url: "/",
      display: "standalone",
      background_color: "#09090b",
      theme_color: "#09090b",
      orientation: "portrait",
      icons: activeLogo.endsWith(".svg")
        ? [
            {
              src: "/logo.svg",
              sizes: "192x192",
              type: "image/svg+xml",
              purpose: "any"
            },
            {
              src: "/logo.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any"
            },
            {
              src: "/logo.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable"
            },
            {
              src: "/logo.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/logo.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ]
        : [
            {
              src: activeLogo,
              sizes: "192x192",
              type: type,
              purpose: "any"
            },
            {
              src: activeLogo,
              sizes: "192x192",
              type: type,
              purpose: "maskable"
            },
            {
              src: activeLogo,
              sizes: "512x512",
              type: type,
              purpose: "any"
            },
            {
              src: activeLogo,
              sizes: "512x512",
              type: type,
              purpose: "maskable"
            },
            {
              src: activeLogo,
              sizes: "180x180",
              type: type,
              purpose: "any"
            }
          ]
    };

    res.json(manifest);
  });

  // API Route: Build Strava OAuth authorization URL
  app.get("/api/strava/auth-url", (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "Parâmetro userId é obrigatório." });
      }

      const clientId = process.env.STRAVA_CLIENT_ID;
      
      // Fallback if environment credentials are not present
      if (!clientId) {
        // Return a demo configuration mode flag
        return res.json({ 
          url: "DEMO_MODE", 
          message: "Chaves do Strava não configuradas. Usando modo de simulação/playground." 
        });
      }

      // Dynamic redirect URI depending on incoming request headers or fallback to runtime URLs
      // By standard guidelines, we can use req.headers.host but since we are behind proxy, 
      // let's construct using the current host of request
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers.host || "localhost:3000";
      const redirectUri = `${protocol}://${host}/auth/callback`;

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "activity:read_all,read",
        state: String(userId),
      });

      const authUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;
      res.json({ url: authUrl });
    } catch (e: any) {
      console.error("Error creating Strava auth url:", e);
      res.status(500).json({ error: e.message || "Erro interno ao gerar URL do Strava." });
    }
  });

  // API/OAuth Route: Strava redirect callback page
  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code, state: userId, error } = req.query;

    if (error) {
      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0b0f19; color: #f1f5f9;">
            <h1 style="color: #ef4444;">Erro na Autenticação</h1>
            <p>Ocorreu um erro ao autorizar com o Strava: ${error}</p>
            <button onclick="window.close()" style="margin-top: 15px; padding: 10px 20px; background: #1e293b; color: white; border: none; border-radius: 6px; cursor: pointer;">Fechar Janela</button>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send("Código de autorização não recebido.");
    }

    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).send("Chaves de configuração da API Strava não encontradas nos logs do servidor.");
    }

    try {
      // Exchange code for token
      const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Falha do Strava: ${errText}`);
      }

      const tokenData = await tokenResponse.json();

      // Return a light web page that will send message back to parent React window and close itself
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 100px 20px; background: #0b0f19; color: #f1f5f9;">
            <div style="max-width: 450px; margin: 0 auto; background: #111827; padding: 40px; border-radius: 12px; border: 1px solid #1f2937; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
              <div style="background: #10b981; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg style="width: 28px; height: 28px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 style="margin: 0 0 10px; color: #f8fafc;">Conexão Bem-Sucedida!</h2>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">O Strava foi vinculado ao seu Desafio com sucesso. Esta tela fechará sozinha.</p>
              <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #10b981; border-radius: 50%; animation: spin 1s infinite linear;"></div>
            </div>
            
            <style>
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>

            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: "STRAVA_AUTH_SUCCESS",
                  userId: ${JSON.stringify(userId)},
                  stravaData: {
                    access_token: ${JSON.stringify(tokenData.access_token)},
                    refresh_token: ${JSON.stringify(tokenData.refresh_token)},
                    expires_at: ${Number(tokenData.expires_at)},
                    athlete: ${JSON.stringify(tokenData.athlete || null)},
                    connectedAt: new Date().toISOString()
                  }
                }, "*");
                setTimeout(() => {
                  window.close();
                }, 1200);
              } else {
                setTimeout(() => {
                  window.location.href = "/";
                }, 2000);
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Token exchange failed:", err);
      res.status(500).send(`Erro ao concluir vinculação do Strava: ${err.message}`);
    }
  });

  // API Route: Sync activities from Strava
  app.post("/api/strava/sync", async (req, res) => {
    const { stravaIntegration, lastSyncDate } = req.body;

    if (!stravaIntegration) {
      return res.status(400).json({ error: "Integração do Strava não enviada." });
    }

    // 1. DEMO MODE Fallback Handler
    if (stravaIntegration.isDemo) {
      // Simulate 2 running tasks for demonstration
      const todayString = new Date().toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split("T")[0];

      const simulatedActivities = [
        {
          id: `strava_demo_run_${Date.now()}`,
          date: todayString,
          type: "Corrida",
          distance: 7.25,
          checkInCode: `Integrado com Strava (ID Demo: ${Math.floor(Math.random() * 900000 + 100000)})`,
          isGymWorkout: false,
          timestamp: new Date().toISOString(),
        },
        {
          id: `strava_demo_ride_${Date.now() - 3600000}`,
          date: yesterdayString,
          type: "Pedalada",
          distance: 18.4,
          checkInCode: `Integrado com Strava (ID Demo: ${Math.floor(Math.random() * 900000 + 100000)})`,
          isGymWorkout: false,
          timestamp: new Date().toISOString(),
        }
      ];

      return res.json({
        activities: simulatedActivities,
        newTokens: null, // No token refresh needed for demo mode
        message: "Simulação realizada com sucesso. Atividades de teste importadas!"
      });
    }

    // 2. REAL STRAVA SYNC
    let currentAccessToken = stravaIntegration.access_token;
    let currentRefreshToken = stravaIntegration.refresh_token;
    let expiresAt = stravaIntegration.expires_at;
    let newTokens = null;

    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: "Chaves de API do Strava ausentes no servidor." });
    }

    // Determine current Unix timestamp
    const nowSecs = Math.floor(Date.now() / 1000);

    // Refresh token if expired (or within 5 minutes of expiration)
    if (expiresAt && nowSecs > (expiresAt - 300)) {
      try {
        console.log("Refreshing Strava access token...");
        const refreshResp = await fetch("https://www.strava.com/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
            refresh_token: currentRefreshToken,
          }),
        });

        if (!refreshResp.ok) {
          const errText = await refreshResp.text();
          throw new Error(`Falha ao renovar token: ${errText}`);
        }

        const refreshData = await refreshResp.json();
        currentAccessToken = refreshData.access_token;
        currentRefreshToken = refreshData.refresh_token;
        expiresAt = refreshData.expires_at;

        newTokens = {
          access_token: currentAccessToken,
          refresh_token: currentRefreshToken,
          expires_at: expiresAt,
        };
        console.log("Strava token refreshed successfully");
      } catch (err: any) {
        return res.status(500).json({ error: `Erro ao atualizar credenciais do Strava: ${err.message}` });
      }
    }

    try {
      // Fetch recent athlete activities from Strava
      // Pull last 15 activities to ensure we don't miss any recent runs
      const stravaUrl = `https://www.strava.com/api/v3/athlete/activities?per_page=15`;
      const activitiesResponse = await fetch(stravaUrl, {
        headers: {
          Authorization: `Bearer ${currentAccessToken}`,
        },
      });

      if (!activitiesResponse.ok) {
        const errText = await activitiesResponse.text();
        throw new Error(`Estouro de limite ou erro do Strava: ${errText}`);
      }

      const rawStravaActs = await activitiesResponse.json();
      
      if (!Array.isArray(rawStravaActs)) {
        throw new Error("Formato inválido retornado pela API do Strava.");
      }

      // Map Strava activities to our app model
      const mappedActivities = rawStravaActs.map((item: any) => {
        // Map sport types: Run -> Corrida, Ride/VirtualRide -> Pedalada, Walk/Hike -> Caminhada, Swim -> Natação
        let mappedType = "Outra";
        const typeStr = (item.sport_type || item.type || "").toLowerCase();

        if (typeStr.includes("run")) {
          mappedType = "Corrida";
        } else if (typeStr.includes("ride") || typeStr.includes("cycling") || typeStr.includes("bike")) {
          mappedType = "Pedalada";
        } else if (typeStr.includes("walk") || typeStr.includes("hike") || typeStr.includes("caminh")) {
          mappedType = "Caminhada";
        } else if (typeStr.includes("swim") || typeStr.includes("natac")) {
          mappedType = "Natação";
        }

        // Distance is in meters in Strava
        const distanceKm = (item.distance || 0) / 1000;

        // Date extraction
        const localDate = item.start_date_local ? item.start_date_local.split("T")[0] : new Date().toISOString().split("T")[0];

        return {
          id: `strava_${item.id}`,
          date: localDate,
          type: mappedType,
          distance: Number(distanceKm.toFixed(2)),
          checkInCode: `Integrado com Strava (ID Atividade: ${item.id})`,
          isGymWorkout: false,
          timestamp: new Date().toISOString(), // Submission timestamp
        };
      });

      res.json({
        activities: mappedActivities,
        newTokens: newTokens,
      });
    } catch (err: any) {
      console.error("Error fetching activities from Strava:", err);
      res.status(500).json({ error: `Erro ao puxar treinos do Strava: ${err.message}` });
    }
  });


  // Connect Vite as middleware in development, and serve index.html in production
  const isProd = process.env.NODE_ENV === "production" || 
                 process.env.NODE_ENV === "prod" || 
                 (!fs.existsSync(path.join(process.cwd(), "server.ts")) && fs.existsSync(path.join(process.cwd(), "dist/index.html")));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
