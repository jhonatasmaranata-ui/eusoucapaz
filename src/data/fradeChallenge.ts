/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity } from '../types';

export const RAW_FRADE_DATA = `11/05/2026 19:41:42	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	11/05/2026	Treino, Corrida	2.52
11/05/2026 20:49:34	dtfc95@gmail.com	Diego Tavares	10 treinos + 10 caminhadas (mín. 2,5 km)	11/05/2026	Treino, Corrida	4
11/05/2026 23:16:32	jhonatasmaranata@gmail.com	Quintanilha	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	11/05/2026	Treino	0
11/05/2026 23:30:56	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	11/05/2026	Treino	0
12/05/2026 13:43:57	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	12/05/2026	Treino, Corrida	4.70
13/05/2026 00:02:40	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	12/05/2026	Treino, Corrida	4.35
13/05/2026 11:06:14	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	12/05/2026	Treino	0
13/05/2026 15:56:44	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	11/05/2026	Treino, Corrida	2.5
13/05/2026 15:57:02	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	13/05/2026	Treino, Corrida	2.65
13/05/2026 20:38:55	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	13/05/2026	Treino, Corrida	4.02
13/05/2026 20:40:24	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	13/05/2026	Treino, Corrida	4.02
14/05/2026 00:09:11	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	13/05/2026	Treino	0
14/05/2026 00:12:44	dtfc95@gmail.com	Diego Tavares	10 treinos + 10 caminhadas (mín. 2,5 km)	13/05/2026	Treino, Corrida	4.21
14/05/2026 21:58:45	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	14/05/2026	Treino, Corrida	4.1
14/05/2026 23:30:52	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	14/05/2026	Treino	0
14/05/2026 23:36:19	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	14/05/2026	Treino, Corrida	2.52
15/05/2026 00:23:27	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	14/05/2026	Treino, Corrida	3
15/05/2026 01:53:00	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	11/05/2026	Treino, Corrida, Pedalada	13
15/05/2026 01:55:14	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	13/05/2026	Treino, Corrida	6.62
15/05/2026 01:57:04	am.almeida2008@gmail.com	Almeida 	10 treinos + 10 caminhadas (mín. 2,5 km)	14/05/2026	Treino, Caminhada	2.5
15/05/2026 21:17:25	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	15/05/2026	Treino, Corrida	10.36
15/05/2026 21:27:17	jhonatasmaranata@gmail.com	Quintanilha	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	15/05/2026	Treino, Corrida	5.13
15/05/2026 21:55:01	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	15/05/2026	Treino, Corrida	4.01
15/05/2026 21:57:45	am.almeida2008@gmail.com	Almeida 	10 treinos + 10 caminhadas (mín. 2,5 km)	15/05/2026	Treino, Caminhada	2.6
15/05/2026 22:12:18	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	15/05/2026	Treino, Corrida	2.6
15/05/2026 23:10:34	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	15/05/2026	Treino, Corrida	5.17
15/05/2026 23:18:14	elieseronorio75@gmail.com	Elieser	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	11/05/2026	Treino	0.0
15/05/2026 23:18:43	elieseronorio75@gmail.com	Elieser	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	14/05/2026	Treino	0.0
15/05/2026 23:19:12	elieseronorio75@gmail.com	Elieser	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	15/05/2026	Treino	0.0
16/05/2026 19:58:13	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	16/05/2026	Treino, Corrida	8.51
16/05/2026 21:34:22	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	16/05/2026	Treino, Corrida	10.5
17/05/2026 21:21:19	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	17/05/2026	Treino	0
17/05/2026 22:07:03	elieseronorio75@gmail.com	Elieser 	10 treinos + 10 corridas (mín. 2,5 km)	17/05/2026	Treino	0000
18/05/2026 00:55:05	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	17/05/2026	Corrida	3.25
18/05/2026 01:12:15	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	17/05/2026	Treino	0
18/05/2026 01:31:25	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	17/05/2026	Treino, Corrida	3.24
18/05/2026 01:33:29	joao.vmartins9@gmail.com	Martins 	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	17/05/2026	Corrida	3.25
18/05/2026 22:31:38	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	18/05/2026	Treino	0
18/05/2026 22:33:12	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	18/05/2026	Treino, Corrida	5.22
19/05/2026 00:45:32	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	18/05/2026	Treino, Corrida	10.17
19/05/2026 02:32:23	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	18/05/2026	Treino, Corrida	7.15
19/05/2026 02:34:25	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	18/05/2026	Treino, Corrida	7.15
19/05/2026 20:49:07	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	19/05/2026	Treino, Corrida	3.38
19/05/2026 21:47:27	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	19/05/2026	Treino	0
19/05/2026 22:23:18	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	19/05/2026	Treino	0
20/05/2026 00:50:03	am.almeida2008@gmail.com	Almeida 	10 treinos + 10 caminhadas (mín. 2,5 km)	19/05/2026	Treino, Caminhada	3.12
20/05/2026 00:57:28	elieseronorio75@gmail.com	Elieser 	10 treinos + 10 corridas (mín. 2,5 km)	19/05/2026	Treino	0000
20/05/2026 22:43:30	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	20/05/2026	Treino, Corrida	2.5
20/05/2026 23:49:34	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	20/05/2026	Treino, Corrida	6.29
21/05/2026 00:07:28	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	20/05/2026	Treino	0
21/05/2026 22:46:45	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	21/05/2026	Treino	0
21/05/2026 23:19:45	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	21/05/2026	Treino, Corrida	3
22/05/2026 00:53:02	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	21/05/2026	Treino	0
22/05/2026 10:13:32	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	20/05/2026	Treino, Caminhada	2.53
22/05/2026 10:15:32	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	21/05/2026	Treino	0.0
22/05/2026 22:33:32	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	22/05/2026	Treino, Corrida	5.19
22/05/2026 22:58:09	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	22/05/2026	Treino, Corrida	2.7
23/05/2026 21:29:09	alexbispopf@gmail.com	Alex Bispo 	10 treinos + 10 corridas (mín. 2,5 km)	22/05/2026	Treino	0
23/05/2026 21:29:30	alexbispopf@gmail.com	Alex Bispo 	10 treinos + 10 corridas (mín. 2,5 km)	23/05/2026	Treino	0
23/05/2026 21:31:48	elieseronorio75@gmail.com	Elieser	10 treinos + 10 corridas (mín. 2,5 km)	23/05/2026	Treino	00
24/05/2026 03:57:33	victorbraga.vnbm@gmail.com	Braga	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	23/05/2026	Treino, Corrida	2.69
24/05/2026 10:46:28	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	11/05/2026	Treino	0
24/05/2026 10:47:02	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	13/05/2026	Treino	0
24/05/2026 10:47:25	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	14/05/2026	Treino	0
24/05/2026 10:47:52	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	15/05/2026	Treino	0
24/05/2026 10:48:35	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	18/05/2026	Treino	0
24/05/2026 10:49:07	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	19/05/2026	Treino	0
24/05/2026 10:49:29	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	21/05/2026	Treino	0
24/05/2026 10:50:00	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	22/05/2026	Treino	0
24/05/2026 15:55:20	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	24/05/2026	Treino, Corrida	12
24/05/2026 20:15:05	alexbispopf@gmail.com	Alex Bispo 	10 treinos + 10 caminhadas (mín. 2,5 km)	24/05/2026	Treino	0
25/05/2026 20:14:38	alexbispopf@gmail.com	Alex Bispo 	10 treinos + 10 corridas (mín. 2,5 km)	25/05/2026	Treino	0
25/05/2026 20:15:09	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	25/05/2026	Pedalada	3.8
25/05/2026 21:49:52	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	25/05/2026	Treino, Corrida	6.4
25/05/2026 22:19:04	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	25/05/2026	Treino	0
25/05/2026 23:30:04	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	25/05/2026	Treino, Corrida	10.16
26/05/2026 23:33:31	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	26/05/2026	Treino, Corrida	9
27/05/2026 00:27:47	alexbispopf@gmail.com	Alex Bispo	10 treinos + 10 corridas (mín. 2,5 km)	26/05/2026	Treino	0
27/05/2026 02:19:17	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	26/05/2026	Treino, Corrida	9.37
27/05/2026 21:35:28	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	26/05/2026	Treino, Corrida	5.7
27/05/2026 21:35:43	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	27/05/2026	Corrida	0
27/05/2026 22:57:11	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	27/05/2026	Treino, Corrida	4.01
28/05/2026 00:28:53	elieseronorio75@gmail.com	Elieser 	10 treinos + 10 corridas (mín. 2,5 km)	27/05/2026	Treino	00
28/05/2026 20:07:59	am.almeida2008@gmail.com	Almeida 	10 treinos + 10 caminhadas (mín. 2,5 km)	28/05/2026	Treino, Caminhada	5.23
29/05/2026 00:52:35	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 pedaladas (mín. 3 km)	28/05/2026	Treino, Pedalada	10.0
29/05/2026 22:48:47	am.almeida2008@gmail.com	Almeida 	10 treinos + 10 caminhadas (mín. 2,5 km)	29/05/2026	Treino, Caminhada	3.3
29/05/2026 23:05:34	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	29/05/2026	Treino, Corrida	2.9
30/05/2026 04:04:43	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	29/05/2026	Treino, Corrida	3.07
01/06/2026 03:49:59	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	31/05/2026	Treino, Corrida	4.23
02/06/2026 00:13:59	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	01/06/2026	Treino	0
02/06/2026 01:38:25	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	29/05/2026	Treino	0
02/06/2026 01:40:17	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	25/05/2026	Treino	0
02/06/2026 01:40:55	solangerodriguesdasilva77361@gmail.com	Solange 	10 treinos + 5 caminhadas (mín. 2,5 km) + 5 pedaladas (mín 3 km)	26/05/2026	Treino	0
02/06/2026 21:22:05	elieseronorio75@gmail.com	Elieser 	10 treinos + 10 corridas (mín. 2,5 km)	02/06/2026	Treino	00
03/06/2026 01:11:38	dtfc95@gmail.com	Diego Tavares 	10 treinos + 10 caminhadas (mín. 2,5 km)	02/06/2026	Treino, Corrida	2.22
03/06/2026 01:12:53	am.almeida2008@gmail.com	Almeida 	10 treinos + 8 corridas (mín. 5 km) + 2 corrida (10 km)	02/06/2026	Treino	0
03/06/2026 01:39:36	joao.vmartins9@gmail.com	Martins	10 treinos + 8 corridas (mín. 2,5 km) + 2 corrida (10 km)	02/06/2026	Corrida	6.44`;

export function parseFradeActivities(): Activity[] {
  const activities: Activity[] = [];
  const lines = RAW_FRADE_DATA.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split('\t');
    if (parts.length < 7) continue;

    const timestamp = parts[0].trim();
    const email = parts[1].trim();
    const athleteName = parts[2].trim();
    const challengeRules = parts[3].trim();
    const rawDate = parts[4].trim();
    const rawType = parts[5].trim();
    const rawDistance = parts[6].trim();

    // DD/MM/YYYY to YYYY-MM-DD
    let date = rawDate;
    const dateParts = rawDate.split('/');
    if (dateParts.length === 3) {
      date = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
    }

    // Parse distance
    const distanceVal = parseFloat(rawDistance.replace(',', '.')) || 0;

    // Classify as Gym check-in based on activity names containing "Treino" or other workout keywords
    const typeLower = rawType.toLowerCase();
    const isGymWorkout = typeLower.includes('treino') || 
                         typeLower.includes('funcional') || 
                         typeLower.includes('crossfit') || 
                         typeLower.includes('croosfit') || 
                         typeLower.includes('academia') || 
                         typeLower.includes('musculação') || 
                         typeLower.includes('musculacao');

    activities.push({
      id: `frade_act_${i + 1}`,
      timestamp,
      name: athleteName,
      type: rawType,
      distance: distanceVal,
      date,
      checkInCode: `FRADE-IMPORT-${i + 1}`,
      isGymWorkout,
      userId: `frade_user_${athleteName.replace(/\s+/g, '_').toLowerCase()}`
    });
  }

  return activities;
}

export const FRADE_MEMBERS = [
  { userId: 'frade_user_alex_bispo', athleteName: 'Alex Bispo', email: 'alexbispopf@gmail.com', role: 'member' as const, joinedAt: '2026-05-11T19:41:42.000Z' },
  { userId: 'frade_user_diego_tavares', athleteName: 'Diego Tavares', email: 'dtfc95@gmail.com', role: 'member' as const, joinedAt: '2026-05-11T20:49:34.000Z' },
  { userId: 'frade_user_quintanilha', athleteName: 'Quintanilha', email: 'jhonatasmaranata@gmail.com', role: 'member' as const, joinedAt: '2026-05-11T23:16:32.000Z' },
  { userId: 'frade_user_martins', athleteName: 'Martins', email: 'joao.vmartins9@gmail.com', role: 'member' as const, joinedAt: '2026-05-11T23:30:56.000Z' },
  { userId: 'frade_user_braga', athleteName: 'Braga', email: 'victorbraga.vnbm@gmail.com', role: 'member' as const, joinedAt: '2026-05-13T15:56:44.000Z' },
  { userId: 'frade_user_almeida', athleteName: 'Almeida', email: 'am.almeida2008@gmail.com', role: 'member' as const, joinedAt: '2026-05-15T01:53:00.000Z' },
  { userId: 'frade_user_elieser', athleteName: 'Elieser', email: 'elieseronorio75@gmail.com', role: 'member' as const, joinedAt: '2026-05-15T23:18:14.000Z' },
  { userId: 'frade_user_solange', athleteName: 'Solange', email: 'solangerodriguesdasilva77361@gmail.com', role: 'member' as const, joinedAt: '2026-05-24T10:46:28.000Z' },
];

