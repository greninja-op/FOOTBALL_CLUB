## Smart Player Identity & Archive System

This is genuinely important architecture. What you're describing solves a real problem that most club systems get wrong — **player identity is separate from player membership.** Let me break the whole thing down.

---

## The Core Problem You've Identified

A player can leave and return. If you just delete and re-create them, their history vanishes. Your system needs to understand the difference between:

```
A PERSON (permanent, never deleted)
    vs
A CLUB MEMBERSHIP (can end, can restart)
    vs
A SEASON RECORD (snapshot in time, never changes)
```

---

## The Database Architecture

Instead of one `Profiles` collection, you split into three:

### `Players` — The Person (Never Deleted)

```js
{
  _id,
  fullName,
  dateOfBirth,
  nationality,
  photo,           // current photo
  contactEmail,
  contactPhone,
  emergencyContact,
  createdAt,
  status: enum['active', 'archived', 'transferred', 'retired']
}
```

This record **never gets deleted. Ever.** It represents the human being, not their club role.

---

### `ClubMemberships` — One Per Stint at the Club

```js
{
  _id,
  playerId,        // ref → Players
  jerseyNumber,
  position,
  contractType: enum['Owned', 'On Loan'],
  contractStart,
  contractEnd,
  squadRole,
  joinedAt,
  leftAt,          // null if currently active
  leftReason: enum['transferred', 'released', 'retired', 'loan_ended'],
  isActive: Boolean
}
```

If Mensah leaves and comes back 2 years later — he gets a **second ClubMembership document**, not a new Player. His first stint is preserved forever.

---

### `SeasonStats` — One Per Player Per Season

```js
{
  _id,
  playerId,        // ref → Players
  membershipId,    // ref → ClubMemberships (which stint)
  season,          // "2024/25"
  goals,
  assists,
  yellowCards,
  redCards,
  minutesPlayed,
  appearances,
  offsides,
  matchRatings: [{ fixtureId, rating, coachNotes }],
  createdAt
}
```

Stats are **never overwritten** — they're stored per season. The player's card shows the sum or the current season depending on what view you're in.

---

### `ArchivedPlayers` — The Departure Record

```js
{
  _id,
  playerId,        // ref → Players
  membershipId,    // ref → ClubMemberships
  archivedAt,
  archivedBy,      // ref → Users (admin who did it)
  reason,
  careerSummaryAtClub: {
    totalGoals,
    totalAssists,
    totalAppearances,
    totalMinutes,
    seasonsPlayed,
    trophiesWon: []
  },
  // Snapshot of their info at time of leaving
  snapshotPhoto,
  snapshotJerseyNumber,
  snapshotPosition,
}
```

This is a **computed snapshot** — calculated at the moment they leave so even if the underlying stats change later, the archive record is frozen.

---

## The Recognition Algorithm

This is the clever part you described — when an admin uploads a new player or edits an existing one, the system checks if this person already exists.

### Trigger Points:

The algorithm fires in three situations:

```
1. Admin uploads a new player photo + name
2. Admin edits an existing player's name
3. Admin changes a jersey number
```

### How the Matching Works:

```
STEP 1 — Exact name match
Search Players collection for fullName exactly matching input
→ If found: HIGH CONFIDENCE match

STEP 2 — Fuzzy name match (handles typos / name variations)
Use string similarity (Levenshtein distance) on fullName
"Kwame Mensah" vs "K. Mensah" → 78% similarity
→ If > 70% similar: POSSIBLE match, flag for admin to confirm

STEP 3 — Jersey number cross-reference
If name match found, also check if jersey number was previously 
used by the same player in a past ClubMembership
→ Strengthens confidence score

STEP 4 — DOB cross-reference (if available)
If dateOfBirth is stored and matches → CONFIRMED

STEP 5 — Present options to admin
```

### The UI That Appears:

When a match is found, instead of silently merging, the system shows a **confirmation dialog:**

```
┌─────────────────────────────────────────────────────┐
│  ⚡ Player Match Found                              │
│─────────────────────────────────────────────────────│
│                                                     │
│  The name "Kwame Mensah" matches an existing        │
│  player record in the system.                       │
│                                                     │
│  ┌──────────────┐   ┌──────────────────────────┐   │
│  │  [Old photo] │   │ Kwame Mensah             │   │
│  │              │   │ #11 · Midfielder         │   │
│  │              │   │ Previous stint: 2021-23  │   │
│  └──────────────┘   │ Goals: 18 · Assists: 12  │   │
│                     │ Appearances: 64          │   │
│                     └──────────────────────────┘   │
│                                                     │
│  Is this the same player returning to the club?     │
│                                                     │
│  [ Yes — Link to existing record ]                  │
│  [ No — Create new player ]                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

If admin clicks **Yes** — a new `ClubMembership` is created under the same `Players._id`. All previous stats are preserved and visible in the career history. The player card can now show both "This Season" and "Career at Club" tabs.

If admin clicks **No** — a completely new `Players` document is created. No data is linked.

---

## The Delete Flow — Nothing Gets Destroyed

When admin removes a player, this is the exact sequence:

```
STEP 1: Admin clicks "Remove Player" on the admin panel
        ↓
STEP 2: System prompts for reason
        (Transferred / Released / Loan Ended / Retired)
        ↓
STEP 3: Algorithm computes career summary:
        SUM all SeasonStats where playerId matches
        → totalGoals, totalAssists, totalAppearances etc.
        ↓
STEP 4: Writes ArchivedPlayers document
        (frozen snapshot including career summary)
        ↓
STEP 5: Sets ClubMembership.isActive = false, leftAt = today
        ↓
STEP 6: Sets Players.status = 'archived' / 'transferred'
        ↓
STEP 7: Removes user's login credentials (Users collection)
        but Players document stays untouched forever
        ↓
STEP 8: Logs the action in SystemLogs
        "Admin archived player Kwame Mensah — Transferred"
```

The player **disappears from all active panels** — not in Coach's lineup, not in Manager's contract list — but their entire history is preserved and searchable.

---

## The Archive Panel (Admin Only)

A dedicated page `/admin/archive` shows all departed players:

```
┌─────────────────────────────────────────────────────────┐
│  PLAYER ARCHIVE                                         │
│  47 former players · Filter: All / Transferred /        │
│  Released / Retired / On Loan                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Photo] Kwame Mensah                    Transferred    │
│          #11 · CM · 2021–2023                          │
│          64 apps · 18G · 12A · 5,760 mins              │
│          [ View Full Record ]  [ Reinstate ]            │
│                                                         │
│  [Photo] Daniel Asante                   Released       │
│          #7  · RW · 2019–2022                          │
│          102 apps · 31G · 24A · 8,820 mins             │
│          [ View Full Record ]  [ Reinstate ]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Reinstate** button — triggers the recognition algorithm in reverse. Creates a new `ClubMembership` under the same `Players._id`. The player gets a new login, their archive snapshot is unfrozen, and fresh `SeasonStats` begin accumulating for the new stint.

---

## What the Player Card Shows

With this architecture, the player card now has two data modes:

```
[THIS SEASON ▼]          ← dropdown selector
Goals:       11
Assists:      7
Appearances: 28

Switch to:
[CAREER AT CLUB]
Goals:       29          ← sum across all stints + seasons
Assists:     19
Appearances: 92
Seasons:      3
```

And a **career timeline** on the expanded profile view:

```
2019/20 ──── 12G · 8A · 34 apps   [Season stats]
2020/21 ──── 8G  · 6A · 28 apps   [Season stats]
      ← Left: Loan to Kumasi City
2022/23 ──── 9G  · 5A · 30 apps   [Season stats — return]
```

---

## The Key Principle

```
Players table    = The human. Permanent. Sacred.
ClubMemberships  = The contract. Can start and end.
SeasonStats      = The performance. Immutable once season ends.
ArchivedPlayers  = The departure snapshot. Frozen in time.
Users            = The login. Can be deleted.
```

Deleting a `User` login never cascades down to the `Player`. They are **intentionally separate.** A player can exist in your system forever without ever having a login — think of a signing who arrives but hasn't been given app access yet, or a legend from before the system existed whose stats you manually entered.