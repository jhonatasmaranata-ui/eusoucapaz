# SECURITY SPECIFICATION: EU SOU CAPAZ MULTI-TENANT GROUP CHALLENGES

This document specifies the security rules, invariants, and threat vectors for the multi-tenant, zero-trust group fitness challenge architecture.

## 1. Data Invariants

1. **User Identity Invariant**: A user's profile (`/users/{userId}`) can only be created or modified by the authenticated user whose `request.auth.uid` matches the document path `{userId}`.
2. **Group Ownership Invariant**: A Group (`/groups/{groupId}`) can only be created by an authenticated user, who is automatically marked as the `creatorId`. Only the `creatorId` can modify group definitions or dynamic scoring rules.
3. **Membership Invariant**: A user cannot register someone else as a member under `/groups/{groupId}/members/{userId}`. The document ID must match `request.auth.uid`.
4. **Group Roster Containment Invariant**: An activity can only be logged inside a group if the logging user is registered as an active member of that group (`/groups/{groupId}/members/{userId}` exists).
5. **Activity Ownership Invariant**: An activity logged under `/groups/{groupId}/activities/{activityId}` must have its `userId` field matching `request.auth.uid`. Once logged, ownership cannot be transferred.

---

## 2. The Dirty Dozen Payloads

### 1. Rogue Profile Creation (Attempting to impersonate someone else's profile)
* Path: `/users/other_uid`
* Actor: `attacker_uid`
* Action: `create`
* **Expected: PERMISSION_DENIED**

### 2. Unauthorized Group Rule Customization
* Path: `/groups/target_group_id`
* Actor: `attacker_uid` (not creator of this group)
* Action: `update` (altering rules.startDate to a past date to inject historical activities or changing multiplier weights)
* **Expected: PERMISSION_DENIED**

### 3. Rogue Member Insertion (Forcing a victim into a group)
* Path: `/groups/group_abc/members/victim_uid`
* Actor: `attacker_uid`
* Action: `create`
* **Expected: PERMISSION_DENIED**

### 4. Shadow Activity Logging (Logging inside a group the user hasn't joined)
* Path: `/groups/private_group_xyz/activities/act_111`
* Actor: `attacker_uid` (not a member of `private_group_xyz`)
* Action: `create`
* **Expected: PERMISSION_DENIED (Must be a registered group member)**

### 5. Hijacking Sibling Activity Entry
* Path: `/groups/active_group/activities/act_222`
* Actor: `attacker_uid` (is a member, but trying to log an activity under `victim_uid`'s athlete name/identity)
* Action: `create` (with `userId: "victim_uid"`)
* **Expected: PERMISSION_DENIED (userId must match request.auth.uid)**

### 6. Infinite Distance Injection (Extreme boundaries breach)
* Path: `/groups/active_group/activities/act_333`
* Actor: `attacker_uid`
* Action: `create`
* Payload: `{"distance": 999999.0}`
* **Expected: PERMISSION_DENIED (distance must be <= 1000.0 km)**

### 7. Activity Type Poisoning
* Path: `/groups/active_group/activities/act_444`
* Actor: `attacker_uid`
* Action: `create`
* Payload: `{"type": ""}` or very long string (1MB) to crash standard storage.
* **Expected: PERMISSION_DENIED (type must be a string between 2 and 100 chars)**

### 8. Remote Delete of Sibling Workouts
* Path: `/groups/active_group/activities/member_act_99`
* Actor: `attacker_uid` (different member trying to delete someone else's entry)
* Action: `delete`
* **Expected: PERMISSION_DENIED**

### 9. Mutating Historical Workout Ownership
* Path: `/groups/active_group/activities/act_555`
* Actor: `attacker_uid`
* Action: `update` (attempting to change `userId` or `name` of a logged activity)
* **Expected: PERMISSION_DENIED (cannot change ownership properties)**

### 10. Blank Gym Check-In Overflow
* Path: `/groups/active_group/activities/act_666`
* Actor: `attacker_uid`
* Action: `create` with checkInCode exceeding 100 chars.
* **Expected: PERMISSION_DENIED**

### 11. Custom Challenge Goal Spoofing (Setting goal for another athlete)
* Path: `/groups/active_group/challenges/victim_uid`
* Actor: `attacker_uid`
* Action: `create` / `update`
* **Expected: PERMISSION_DENIED**

### 12. Public Standings Reading
* Path: `/groups/any_group/activities`
* Actor: Public guest visiting the challenge invite page
* Action: `read` / `list`
* **Expected: ALLOW (Read access remains open dynamically so invited athletes can view the global scoreboard prior to logging in/joining)**
