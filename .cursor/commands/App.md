# MyFitnessLeague V2 – Developer Guide & Architecture

**Last Updated:** December 11, 2025  
**Aligned With:** PRD v1.0

---

## 1. Architecture Overview

### Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, RLS, Edge Functions), Node.js
- **Database:** PostgreSQL (Supabase)
- **Auth:** NextAuth.js with JWT (credentials + Google OAuth)
- **File Storage:** Supabase Storage (proof images/videos)

### High-Level Structure
```
src/
├── app/                    # Next.js App Router (pages, layouts, API routes)
├── components/             # Presentational React components
├── lib/                    # Shared utilities, auth, Supabase clients, validations
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript types and interfaces
├── config/                 # Configuration (site, constants)
├── actions/                # Server Actions (placeholder; prefer API routes for endpoints)
└── middleware.ts           # Next.js middleware (auth checks, redirects)
```

---

## 2. User Roles & Permissions (Implementation Guide)

### Role Hierarchy & Permissions Matrix

| Action | Host | Governor | Captain | Player |
|--------|------|----------|---------|--------|
| Create League | ✅ | ❌ | ❌ | ❌ |
| Edit League (pre-launch) | ✅ | ❌ | ❌ | ❌ |
| Delete League (pre-launch) | ✅ | ❌ | ❌ | ❌ |
| View All Teams/Players | ✅ | ✅ | ❌ | ❌ |
| Validate Any Submission | ✅ | ✅ | ❌ | ❌ |
| Validate Team Submissions | ✅ | ✅ | ✅ | ❌ |
| Override Captain Decision | ✅ | ✅ | ❌ | ❌ |
| Access Oversight Dashboard | ✅ | ✅ | ❌ | ❌ |
| Manage Team (own only) | ✅ | ✅ | ✅ | ❌ |
| Submit Workouts | ✅* | ✅* | ✅ | ✅ |
| View Personal Dashboard | ✅ | ✅ | ✅ | ✅ |

*There is also an Admin Role for System Management

*Only if also assigned as Player in the league.

### Multi-Role Support

**Allowed Combinations:**
- Host + Player (host participates in own league)
- Governor + Player (governor submits workouts)
- Captain + Player (captains are implicitly players; all captains can submit)
- Player only (default)

**Not Allowed:**
- Captain of multiple teams in same league
- Host + Governor simultaneously (Host has full Governor permissions)

**Implementation:**
- Store roles in `league_members` table: `role` enum (host, governor, captain, player)
- A user can have multiple roles per league (one row per role, or composite enum field)
- Middleware checks `token.role` or fetches from session; UI shows role switcher dropdown
- Role switcher updates current session role; determines visible dashboards and menus

---

## 3. Database Schema

### Actual Schema (Current)

Your database implements a comprehensive role-based system with challenges and activity tracking. Below is the actual structure:

#### users
```sql
user_id UUID PRIMARY KEY
username VARCHAR UNIQUE NOT NULL
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR
phone VARCHAR
date_of_birth DATE
gender VARCHAR
is_active BOOLEAN DEFAULT true
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```

#### leagues
```sql
league_id UUID PRIMARY KEY
league_name VARCHAR UNIQUE NOT NULL
start_date DATE NOT NULL
end_date DATE NOT NULL
is_active BOOLEAN DEFAULT true
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```

#### roles
```sql
role_id UUID PRIMARY KEY
role_name VARCHAR UNIQUE NOT NULL (e.g., 'host', 'governor', 'captain', 'player')
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```

#### assignedrolesforleague
```sql
id UUID PRIMARY KEY
league_id UUID FK (leagues)
user_id UUID FK (users)
role_id UUID FK (roles)
assigned_at TIMESTAMP (auto)
created_by UUID FK (users)
```
*Tracks which roles a user has in each league (enables multi-role support).*

#### teams
```sql
team_id UUID PRIMARY KEY
team_name VARCHAR UNIQUE NOT NULL
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```

#### teamleagues
```sql
id UUID PRIMARY KEY
team_id UUID FK (teams)
league_id UUID FK (leagues)
created_at TIMESTAMP (auto)
created_by UUID FK (users)
```
*Junction table linking teams to leagues.*

#### leaguemembers
```sql
league_member_id UUID PRIMARY KEY
league_id UUID FK (leagues)
user_id UUID FK (users)
team_id UUID FK (teams)
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```
*Tracks league membership; user can be member of multiple leagues.*

#### effortentry (Workout Submissions)
```sql
id UUID PRIMARY KEY
league_member_id UUID FK (leaguemembers)
date DATE NOT NULL
type VARCHAR NOT NULL (e.g., 'workout', 'rest')
workout_type VARCHAR (e.g., 'run', 'gym', 'yoga')
duration INT (minutes)
distance DECIMAL (km)
steps INT
holes INT (golf)
rr_value DECIMAL (recovery/strain value)
status USER-DEFINED (enum: 'pending', 'approved', 'rejected')
proof_url VARCHAR (Supabase Storage URL)
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```
*Stores workout submissions; missing validated_by and validated_at for audit trail.*

#### activities
```sql
activity_id UUID PRIMARY KEY
activity_name VARCHAR UNIQUE NOT NULL (e.g., 'Running', 'Cycling')
description TEXT
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```
*Master list of activity types available in the system.*

#### leagueactivities
```sql
id UUID PRIMARY KEY
league_id UUID FK (leagues)
activity_id UUID FK (activities)
created_at TIMESTAMP (auto)
created_by UUID FK (users)
```
*Associates activity types with specific leagues.*

#### specialchallenges
```sql
challenge_id UUID PRIMARY KEY
league_id UUID FK (leagues)
name VARCHAR NOT NULL
start_date DATE NOT NULL
end_date DATE NOT NULL
doc_url VARCHAR (documentation/rules link)
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```

#### leagueschallenges
```sql
id UUID PRIMARY KEY
league_id UUID FK (leagues)
challenge_id UUID FK (specialchallenges)
created_at TIMESTAMP (auto)
created_by UUID FK (users)
```

#### specialchallengeindividualuserscore
```sql
id UUID PRIMARY KEY
challenge_id UUID FK (specialchallenges)
league_member_id UUID FK (leaguemembers)
league_id UUID FK (leagues)
score DECIMAL DEFAULT 0
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```

#### specialchallengeteamscore
```sql
id UUID PRIMARY KEY
challenge_id UUID FK (specialchallenges)
team_id UUID FK (teams)
league_id UUID FK (leagues)
score DECIMAL DEFAULT 0
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```

#### email_otps
```sql
id BIGINT PRIMARY KEY (auto-increment)
email TEXT NOT NULL
otp TEXT NOT NULL
expires_at TIMESTAMP NOT NULL
used BOOLEAN DEFAULT false
created_at TIMESTAMP (auto)
```
*OTP codes for email-based authentication.*

#### leagueinvites
```sql
id UUID PRIMARY KEY
league_id UUID FK (leagues)
user_id UUID FK (users)
invited_at TIMESTAMP (auto)
created_by UUID FK (users)
```
*Tracks invitations sent to users for leagues.*

#### teammembers
```sql
team_member_id UUID PRIMARY KEY
team_id UUID FK (teams)
user_id UUID FK (users)
role_id UUID FK (roles)
created_by UUID FK (users)
created_date TIMESTAMP (auto)
modified_by UUID FK (users)
modified_date TIMESTAMP (auto)
```
*Alternative team membership tracking (may be redundant with leaguemembers).*

---

### Schema Design Notes & Recommendations

#### ✅ What's Working Well
- **Comprehensive role system** — `assignedrolesforleague` table supports multi-role per league
- **Challenge system** — Well-designed with individual and team scoring
- **Activity types** — Master `activities` table enables custom activity selection per league
- **OTP handling** — `email_otps` table properly implements OTP workflow
- **Audit trails** — `created_by`, `created_date`, `modified_by`, `modified_date` on most tables

#### ⚠️ Issues to Fix

**1. CRITICAL: Duplicate FK constraints in leaguemembers**
```sql
-- Current (INVALID - will fail at runtime):
CONSTRAINT fk_lm_team_league FOREIGN KEY (team_id) REFERENCES public.teamleagues(team_id),
CONSTRAINT fk_lm_team_league FOREIGN KEY (league_id) REFERENCES public.teamleagues(team_id),
CONSTRAINT fk_lm_team_league FOREIGN KEY (team_id) REFERENCES public.teamleagues(league_id),
CONSTRAINT fk_lm_team_league FOREIGN KEY (league_id) REFERENCES public.teamleagues(league_id)

-- Correct:
CONSTRAINT fk_lm_team FK (team_id) REFERENCES public.teams(team_id),
CONSTRAINT fk_lm_league FK (league_id) REFERENCES public.leagues(league_id)
```
**Action:** Fix these constraints immediately; they prevent table creation/modification.

**2. Missing audit columns in effortentry**
Add to track who approved submissions and when:
```sql
validated_by UUID FK (users) -- who approved/rejected
validated_at TIMESTAMP -- when approved/rejected
```

**3. Potential redundancy: teamleagues vs. leaguemembers**
- `teamleagues` links teams to leagues
- `leaguemembers` already has `team_id` and `league_id`
- Consider: Do you need both? `teamleagues` could be eliminated if team_id uniquely identifies team per league.
- Current design allows teams to span multiple leagues (good for flexibility).
- Keep both if teams can be reused across leagues; otherwise simplify.

**4. Missing: payments table for Stripe integration**
Add this table:
```sql
CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL FK (users),
  league_id UUID NOT NULL FK (leagues),
  stripe_payment_intent VARCHAR,
  stripe_session_id VARCHAR,
  status VARCHAR (e.g., 'pending', 'completed', 'failed'),
  amount DECIMAL,
  currency VARCHAR DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);
```

**5. Missing: leaderboard_cache table (performance optimization)**
Add this table for cached leaderboard scores (refreshed hourly or on submission):
```sql
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL FK (leagues),
  league_member_id UUID NOT NULL FK (leaguemembers),
  rank INT,
  points INT,
  avg_rr DECIMAL,
  streak INT,
  week_number INT,
  updated_at TIMESTAMP DEFAULT now()
);
```

**6. Missing: leagues table columns for PRD features**
Current `leagues` table is minimal. Add these for PRD support:
```sql
ALTER TABLE leagues ADD COLUMN (
  is_exclusive BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  num_teams INT,
  team_size INT,
  rest_days INT,
  stripe_product_id VARCHAR,
  status VARCHAR DEFAULT 'draft' -- e.g., 'draft', 'launched', 'active', 'completed'
);
```

**7. leagues table: add host_id reference**
```sql
ALTER TABLE leagues ADD COLUMN host_id UUID NOT NULL FK (users);
```
This makes it explicit who created (hosts) the league, simplifying access control queries.

---

### Performance Considerations

1. **Indexes needed:**
   - `leaguemembers(league_id, user_id)` — for fast membership lookup
   - `effortentry(league_member_id, date, status)` — for submission queries
   - `assignedrolesforleague(league_id, user_id)` — for role lookups
   - `specialchallengeindividualuserscore(league_id, challenge_id)` — for challenge leaderboards

2. **Leaderboard cache:**
   - Pre-compute and cache leaderboard scores hourly or on submission approval
   - Avoid computing rank/points on every leaderboard request

3. **RLS policies:**
   - Apply at table level (not rows) for role-based access
   - Users can see only their own leagues and teams
   - Governors can see all data in their leagues

---

## 4. Database to Services Mapping

This section maps actual DB tables to the `src/lib/services/*` layer (future consolidation). Use these functions to centralize DB logic and avoid duplication across API routes and components.

| Table(s) | Service File | Key Functions | Usage |
|----------|--------------|---|---|
| `users` | `lib/services/users.ts` | `getUserById(id)`, `getUsersByIds(ids[])`, `isUsernameTaken(username, excludeId?)`, `updateUserProfile(userId, changes)` | Auth, profile updates, user lookups |
| `leagues` | `lib/services/leagues.ts` | `createLeague(data)`, `getLeagueById(id)`, `getLeaguesForUser(userId)`, `updateLeague(id, data)`, `deleteLeague(id)` | League CRUD, list, details |
| `assignedrolesforleague` | `lib/services/roles.ts` | `assignRoleToUser(userId, leagueId, roleId)`, `getUserRolesInLeague(userId, leagueId)`, `removeRoleFromUser(userId, leagueId, roleId)` | Role assignment, role checks |
| `teams`, `teamleagues` | `lib/services/teams.ts` | `getTeamById(id)`, `getTeamsInLeague(leagueId)`, `createTeam(leagueId, name)`, `updateTeam(id, data)`, `getTeamMembers(teamId)` | Team CRUD, roster, details |
| `leaguemembers` | `lib/services/memberships.ts` | `addLeagueMember(userId, leagueId, teamId?)`, `getLeagueMembersForLeague(leagueId)`, `getLeagueMembersForTeam(teamId)`, `removeMember(memberId)` | Membership queries, joins, leaves |
| `effortentry` | `lib/services/entries.ts` | `submitWorkout(memberId, data)`, `getEntriesForLeague(leagueId, opts?)`, `getEntriesByStatus(status, leagueId)`, `validateEntry(entryId, status, validatedBy)`, `countSubmissionsForMember(memberId, dateRange?)` | Submission CRUD, validation, counting |
| `specialchallenges*` | `lib/services/challenges.ts` | `getChallengesForLeague(leagueId)`, `scoreChallenge(challengeId, memberId, score)`, `getChallengeLeaderboard(challengeId)` | Challenge queries, scoring |
| `activities`, `leagueactivities` | `lib/services/activities.ts` | `getActivitiesForLeague(leagueId)`, `getAvailableActivities()`, `setLeagueActivities(leagueId, activityIds[])` | Activity types per league |
| `payments` | `lib/services/payments.ts` | `createCheckoutSession(userId, leagueId, amount)`, `recordPayment(data)`, `getPaymentStatus(paymentId)` | Stripe integration |
| `leaderboard_cache` | `lib/services/leaderboard.ts` | `refreshLeaderboard(leagueId)`, `getLeaderboard(leagueId)`, `getTeamStats(teamId, leagueId)`, `getIndividualRank(memberId, leagueId)` | Cached leaderboard, stats |
| `email_otps` | `lib/services/auth.ts` | `createOTP(email)`, `verifyOTP(email, otp)`, `expireOTP(email)` | OTP workflow |
| `leagueinvites` | `lib/services/invites.ts` | `sendInvite(userId, leagueId, invitedBy)`, `getInvitesForUser(userId)`, `acceptInvite(inviteId)`, `rejectInvite(inviteId)` | Invitation management |

---

## 5. API Endpoints (By Feature)

### 4.1 Authentication
```
POST   /api/auth/send-otp              # Send OTP to email
POST   /api/auth/verify-otp            # Verify OTP, create user
POST   /api/auth/[...nextauth]         # NextAuth callback route
POST   /api/auth/update-password       # Change password
POST   /api/auth/refresh-profile       # Refresh profile completion flag
POST   /api/auth/complete-profile      # Finalize user profile
GET    /api/auth/signin/google         # Google OAuth sign-in
GET    /api/auth/callback/google       # Google OAuth callback
```

### 4.2 League Management
```
POST   /api/leagues                    # Create league (Host only)
GET    /api/leagues                    # List user's leagues
GET    /api/leagues/[id]               # Get league details
PATCH  /api/leagues/[id]               # Update league (Host pre-launch only)
DELETE /api/leagues/[id]               # Delete league (Host, pre-launch only)
POST   /api/leagues/[id]/join          # Join league via link
GET    /api/leagues/[id]/members       # List league members (Governor/Host/Captain)
```

### 4.3 Team Management
```
GET    /api/teams                      # List user's teams
GET    /api/teams/[id]                 # Get team details + roster
PATCH  /api/teams/[id]                 # Update team (Captain/Host only)
POST   /api/teams/[id]/members         # Manage team roster (Host pre-launch)
```

### 4.4 Submissions (Workouts)
```
POST   /api/submissions                # Submit workout (Player)
GET    /api/submissions/[id]           # Get submission details
PATCH  /api/submissions/[id]/validate  # Approve/reject (Captain/Governor/Host)
GET    /api/submissions                # List pending submissions (Captain/Governor)
```

### 4.5 Payments (Stripe Webhook)
```
POST   /api/webhooks/stripe            # Stripe event handler (webhook)
GET    /api/payments/create-checkout   # Initiate Stripe checkout (Host)
```

### 4.6 Analytics
```
GET    /api/analytics/leaderboard      # Get league leaderboard
GET    /api/analytics/team-stats       # Get team performance
GET    /api/analytics/drain            # Drain/cleanup old data (admin only)
```

---

## 5. Core Features & Implementation Path

### 5.1 Authentication & User Management

**Status:** ✅ Mostly implemented  
**Implemented In:**
- `src/lib/auth/config.ts` — NextAuth configuration
- `src/app/api/auth/*` — Auth endpoints (OTP, password, profile completion)
- `src/middleware.ts` — Session checks, redirects

**Guidance:**
- Keep JWT callback minimal (no DB reads during token refresh)
- Use `/api/auth/refresh-profile` endpoint for profile completion updates
- Client calls `session.update({ name, needsProfileCompletion })` after profile changes
- All auth flows must update the session token immediately for UI consistency

---

### 5.2 League Creation & Management

**Status:** 🟡 Placeholder endpoints exist; logic needed  
**Endpoints:**
- `POST /api/leagues` — Create league
- `GET /api/leagues` — List leagues
- `GET /api/leagues/[id]` — Get league details
- `PATCH /api/leagues/[id]` — Update (Host only, pre-launch)

**Implementation Checklist:**
- [ ] Validate Host role before creation
- [ ] Generate join link (league slug or token)
- [ ] Enforce "rules immutable after launch"
- [ ] Create default teams if `num_teams` specified
- [ ] Assign Host as league_member with role='host'
- [ ] Test multi-role (host can join as player too)

---

### 5.3 Invitations & Team Assignment

**Status:** 🟡 Placeholder; needs logic  
**Endpoints:**
- `POST /api/leagues/[id]/join` — Join via link
- `GET /api/leagues/[id]/members` — List league members

**Implementation Checklist:**
- [ ] Generate shareable join link (slug-based or secret token)
- [ ] New users sign up on join; existing users auto-added
- [ ] Unassigned players go to allocation bucket
- [ ] Host can manually assign players to teams pre-launch
- [ ] Captain can invite team members (with approval)
- [ ] Duplicate invite handling (same email, prevent re-adding)

---

### 5.4 Team Management

**Status:** 🟡 Placeholder endpoints  
**Endpoints:**
- `GET /api/teams` — List user's teams
- `GET /api/teams/[id]` — Get team details
- `PATCH /api/teams/[id]` — Update (Captain/Host)
- `POST /api/teams/[id]/members` — Manage roster

**Implementation Checklist:**
- [ ] Captain can manage own team only
- [ ] Host/Governor can move players between teams (pre-launch)
- [ ] Display team progress (submissions, points, streak)
- [ ] Captain removal triggers escalation to Host/Governor
- [ ] Show team captain in member list

---

### 5.5 Workout Submission & Validation

**Status:** 🟡 Endpoints exist; validation logic needs refinement  
**Endpoints:**
- `POST /api/submissions` — Submit workout
- `GET /api/submissions/[id]` — Get submission details
- `PATCH /api/submissions/[id]/validate` — Approve/reject
- `GET /api/submissions` — List pending (Captain/Governor)

**Implementation Checklist:**
- [ ] Player submits: workout_type, duration, distance, steps, holes, rr_value, proof upload
- [ ] Proof URL stored in Supabase Storage; reference in effortentry
- [ ] Auto-timestamp with user's timezone
- [ ] Duplicate prevention (same date/user/type)
- [ ] Validation hierarchy: Captain (24h) → Governor (override) → Host (final override)
- [ ] Auto-approve after 48h if no Captain validation
- [ ] Flag suspicious entries (e.g., same proof uploaded multiple times)
- [ ] Approved submissions increment points, streak, team score immediately
- [ ] Captain can only validate own team submissions
- [ ] Governor can validate any submission
- [ ] Host can validate any submission and override Captain/Governor

**Client Flows:**
- Player dashboard has "Submit Workout" button → form → upload proof → submit
- Team dashboard shows pending submissions (for Captain)
- Governor/Host dashboard shows all pending submissions across league
- Notification when submission approved/rejected

---

### 5.6 Leaderboards & Scoring

**Status:** 🔴 UI exists; scoring logic needs implementation  
**Endpoints:**
- `GET /api/analytics/leaderboard` — League-wide leaderboard
- `GET /api/analytics/team-stats` — Team performance

**Scoring Rules:**
- 1 point per valid submission
- Team score = sum of all member points
- League score = cumulative (all teams)
- Average RR = avg recovery/strain value across member submissions
- Streak = consecutive days with valid submissions (reset on missed day or rejection)

**Implementation Checklist:**
- [ ] Leaderboard cache table (refresh hourly or on submission approval)
- [ ] Rank calculation (tie-breaking: secondary sort by avg RR)
- [ ] Historical leaderboards (weekly snapshots)
- [ ] Real-time update on submission approval (update cache immediately)
- [ ] Personal dashboard shows individual rank + team rank
- [ ] Weekly leaderboard view

---

### 5.7 Weekly Challenges (Optional for V2.0)

**Status:** 🔴 Not started  
**Challenges:**
- Bingo (complete specific workout types)
- Max Steps Day (highest step count in a week)
- Unique Day (most unique workout types in a week)

**Implementation (if included):**
- [ ] Define challenge rules in league config
- [ ] Auto-score at end of week
- [ ] Challenge leaderboard separate from main score
- [ ] Bonus points for challenge wins

---

### 5.8 Payments (Stripe Integration)

**Status:** 🟡 Webhook endpoint exists; checkout logic needed  
**Endpoints:**
- `POST /api/payments/create-checkout` — Initiate checkout
- `POST /api/webhooks/stripe` — Handle Stripe events

**Implementation Checklist:**
- [ ] Host can mark league as paid during creation
- [ ] Set Stripe product ID and pricing
- [ ] Create Stripe Checkout Session (product + quantity)
- [ ] Webhook listens to `checkout.session.completed`
- [ ] On payment success, mark league_members as "paid"
- [ ] Failed payments logged; user can retry
- [ ] Subscription renewals (if applicable)

---

## 6. Middleware & Security

### 6.1 Middleware Rules (`src/middleware.ts`)

**Current Implementation:**
- Redirect unauthenticated users to `/login`
- Redirect incomplete profiles to `/complete-profile`
- Redirect complete profiles away from `/complete-profile`
- Protect routes: `/dashboard`, `/team`, `/leaderboards`, `/rules`, `/my-challenges`, `/governor`, `/profile`

**Future Enhancements:**
- [ ] Role-based route protection (e.g., `/governor` → Governor role required)
- [ ] League-specific route guards (e.g., user must be member of league being accessed)

### 6.2 RLS Policies (Supabase)

**Principle:** Users can only see/modify data they own or are authorized for.

**Key Policies:**
- `users` → Users see only their own profile; Admins see all
- `leagues` → Public leagues visible to all; exclusive/private filtered by membership
- `league_members` → Users see only their own memberships; Host/Governor see all in their league
- `effortentry` → Players see own; Captains see team's; Governors/Host see all
- `teams` → Players see own team; Captains see own; Governors/Host see all

---

## 7. File Organization & Coding Standards

### 7.1 Folder Structure

```
src/
├── app/
│   ├── (auth)/                  # Auth pages: login, signup
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/             # Main app routes (protected)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── team/page.tsx
│   │   ├── leagues/
│   │   │   ├── page.tsx         # List leagues
│   │   │   ├── [id]/page.tsx    # League details
│   │   │   ├── new/page.tsx     # Create league
│   │   │   └── [id]/edit/page.tsx
│   │   ├── submissions/page.tsx
│   │   ├── leaderboards/page.tsx
│   │   ├── my-challenges/page.tsx
│   │   ├── governor/page.tsx    # Governor dashboard
│   │   └── captain/page.tsx     # Captain dashboard
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   ├── send-otp/route.ts
│   │   │   ├── verify-otp/route.ts
│   │   │   ├── update-password/route.ts
│   │   │   ├── refresh-profile/route.ts
│   │   │   ├── complete-profile/route.ts
│   │   │   └── create-user/route.ts
│   │   ├── leagues/
│   │   │   ├── route.ts         # POST (create), GET (list)
│   │   │   ├── [id]/route.ts    # GET, PATCH, DELETE
│   │   │   ├── [id]/join/route.ts
│   │   │   └── [id]/members/route.ts
│   │   ├── teams/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── submissions/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/validate/route.ts
│   │   ├── payments/
│   │   │   └── create-checkout/route.ts
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts
│   │   └── analytics/
│   │       ├── leaderboard/route.ts
│   │       ├── team-stats/route.ts
│   │       └── drain/route.ts
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── globals.css
│   └── offline/page.tsx
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx    # SessionProvider wrapper
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── leagues/
│   │   ├── league-form.tsx
│   │   ├── league-card.tsx
│   │   ├── league-list.tsx
│   │   ├── leaderboard.tsx
│   │   └── invite-dialog.tsx
│   ├── teams/
│   │   ├── team-card.tsx
│   │   ├── team-list.tsx
│   │   └── member-list.tsx
│   ├── submissions/
│   │   ├── submission-form.tsx
│   │   ├── submission-card.tsx
│   │   ├── proof-upload.tsx
│   │   └── validation-queue.tsx
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── navigation.tsx
│   └── ui/
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── auth/
│   │   ├── config.ts            # NextAuth configuration
│   │   ├── utils.ts             # Auth helpers (re-exports)
│   │   └── client.ts            # Client-side auth helpers (e.g., refreshAuthSession)
│   ├── supabase/
│   │   ├── client.ts            # Supabase client (browser/SSR anon key)
│   │   ├── server.ts            # Supabase server client (service key)
│   │   ├── serverClient.ts      # Alias for middleware (was middleware.ts)
│   │   ├── types.ts             # Supabase generated types
│   │   └── index.ts             # Re-export barrel
│   ├── services/                # (Future) Consolidated DB/business logic
│   │   ├── users.ts             # User queries & updates
│   │   ├── leagues.ts           # League CRUD & queries
│   │   ├── teams.ts             # Team CRUD & queries
│   │   ├── entries.ts           # Submission/effort entry logic
│   │   ├── memberships.ts       # League member queries
│   │   ├── payments.ts          # Stripe integration
│   │   └── index.ts             # Re-export barrel
│   ├── validations/
│   │   ├── auth.ts              # Auth validation schemas
│   │   ├── league.ts            # League validation
│   │   ├── team.ts              # Team validation
│   │   └── submission.ts        # Submission validation
│   ├── membership.ts            # (Existing) Membership queries
│   ├── mailer.ts                # Email/Nodemailer integration
│   ├── rateLimiter.ts           # Rate limiting for OTP, etc.
│   ├── env.ts                   # Environment variable validation
│   ├── utils.ts                 # General utilities (cn, etc.)
│   └── supabase.ts              # (Legacy; use lib/supabase/client.ts)
├── hooks/
│   ├── use-auth.ts              # Auth state & session
│   ├── use-league.ts            # League queries & mutations
│   ├── use-team.ts              # Team queries & mutations
│   ├── use-submission.ts        # Submission queries & mutations
│   ├── use-toast.ts             # Toast notifications
│   └── use-role.ts              # (Future) Current role & permissions
├── types/
│   ├── index.ts                 # Main type exports
│   ├── database.ts              # Database types (Supabase auto-generated)
│   ├── api.ts                   # API request/response types
│   └── nodemailer.d.ts          # Nodemailer TypeScript definitions
├── config/
│   ├── site.ts                  # Site configuration
│   └── constants.ts             # App constants
├── actions/
│   ├── auth.ts                  # Auth server actions (placeholder)
│   ├── leagues.ts               # League server actions (placeholder)
│   ├── teams.ts                 # Team server actions (placeholder)
│   └── submissions.ts           # Submission server actions (placeholder)
└── middleware.ts                # Next.js middleware
```

### 7.2 Code Style & Conventions

**TypeScript:**
- Strict mode enabled (`strict: true`)
- Use interfaces for external APIs; types for internal state
- Avoid `any`; use proper typing or generics

**React Components:**
- Use `"use client"` at the top of client components
- Prefer server components by default (in app router)
- Use hooks for state management; Context API for shared auth state
- CSS modules or Tailwind for styling

**API Routes:**
- Handle errors with descriptive messages
- Return `{ error, code }` on failure; `{ data, success }` on success
- Check auth via `getServerSession(authOptions)` in protected routes
- Validate input with Zod schemas
- Log suspicious activity (audit trail)

**Database Queries:**
- Use Supabase client (`getSupabase()` for SSR, service key for admin ops)
- Consolidate DB logic in `src/lib/services/*` to avoid duplication
- Add type safety with TypeScript (use generated Supabase types)
- Implement RLS policies for row-level security

**Session Management:**
- JWT callback should be minimal (no DB reads during token refresh)
- Use `/api/auth/refresh-profile` for explicit profile updates
- Client calls `session.update({ name, needsProfileCompletion })` after profile changes
- Session token updates immediately so UI reflects changes without logout

---

## 8. Development Workflow

### 8.1 Local Setup
```bash
# Clone & install
git clone <repo> && cd MFLV2
npm install

# Environment setup
cp .env.example .env.local
# Fill in NEXTAUTH_SECRET, Supabase keys, Stripe keys, SMTP config

# Run dev server
npm run dev
# Open http://localhost:3000
```

### 8.2 Branch Convention
- `main` → production
- `testing` → staging/QA
- `feature/*` → feature branches (branch from `testing`)
- Merge back to `testing` → PR review → merge to `main`

### 8.3 Commit Message Format
```
[FEATURE|FIX|CHORE|DOCS] Brief description (50 chars max)

Longer explanation if needed.
- Bullet points for context
- Issue #123 (if applicable)
```

### 8.4 Testing Checklist Before Commit
- [ ] TypeScript compile: `npx tsc --noEmit`
- [ ] Linting: `npm run lint`
- [ ] Manual test: flows work in `npm run dev`
- [ ] No console errors/warnings
- [ ] Responsive design check (mobile, tablet, desktop)

---

## 9. Future Enhancements (Post-V2.0)

- [ ] Mobile apps (iOS, Android)
- [ ] Advanced reporting & anomaly detection
- [ ] Team shoutouts & community features
- [ ] WhatsApp integration for notifications
- [ ] Subscription/recurring billing
- [ ] Custom challenge builder
- [ ] Referral system
- [ ] Analytics dashboard for league operators

---

## 10. Coding Agent Instructions

**For all new features, follow this checklist:**

1. **Role & Permission Check**
   - Verify role hierarchy (Host > Governor > Captain > Player)
   - Check `token.role` in middleware or `session.user.role` in components
   - Deny access if insufficient permissions

2. **Database Operations**
   - Use `getSupabase()` for SSR; service key for admin ops
   - Consolidate queries in `src/lib/services/*` if logic is reused
   - Implement RLS policies for security
   - Always validate input with Zod

3. **API Endpoint Structure**
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { getServerSession } from 'next-auth/next';
   import { authOptions } from '@/lib/auth/config';

   export async function POST(req: NextRequest) {
     try {
       const session = await getServerSession(authOptions);
       if (!session?.user?.id) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }

       const body = await req.json();
       // Validate input
       // Process request
       // Return response

       return NextResponse.json({ data: result, success: true });
     } catch (error) {
       console.error('Error:', error);
       return NextResponse.json(
         { error: 'Internal Server Error' },
         { status: 500 }
       );
     }
   }
   ```

4. **Client-Side Session Updates**
   - After profile/auth changes, call `session.update({ key: value })`
   - Include only whitelisted fields: `name`, `needsProfileCompletion`, `email`
   - Verify changes appear immediately in UI without logout

5. **Error Handling**
   - Return meaningful error messages (avoid generic "error occurred")
   - Log errors server-side for debugging
   - Show user-friendly messages in UI

6. **Testing New Endpoints**
   - Test happy path (valid input)
   - Test error path (missing/invalid input)
   - Test permissions (unauthorized access)
   - Test with multiple roles if applicable

---

## 11. FAQ & Common Issues

**Q: Why are DB reads removed from JWT callback?**  
A: JWT callback is called frequently (on each request). DB reads in it cause unnecessary load. Use `/api/auth/refresh-profile` for explicit updates instead.

**Q: How do users switch roles in the UI?**  
A: Role switcher dropdown in navbar (coming soon). Switching updates `session.user.role` and re-renders relevant dashboards/menus.

**Q: How are submissions validated?**  
A: Captain validates first (24h window) → Governor can override → Host can override. Auto-approve after 48h if no action. Points/streak increment on approval.

**Q: How is the leaderboard scored?**  
A: 1 point per valid submission. Team score = sum of members. Ranked by points (primary) then avg RR (secondary). Cache refreshed hourly or on submission.

**Q: Can a user be in multiple leagues?**  
A: Yes. `league_members` table stores user's role per league. Each league may have different role.

---

**Questions? Reach out to the team or add to this doc.**
