## This Is Now a Seriously Sophisticated Feature

What you're describing is essentially a **smart lineup builder** — not just drag and drop, but an intelligent system with auto-assignment, swap logic, and availability awareness. Let me break the whole thing down properly.

---

## How the Auto-Placement Works

When the coach picks a formation (say 4-3-3), the system needs to:

1. Pull all players from the DB with their `position` field (GK, CB, LB, RB, CM, CAM, LW, RW, ST etc.)
2. Map each formation slot to a position type
3. Auto-fill each slot with the **best available** player for that position — "available" meaning not injured, not suspended, not banned
4. If a position has no available specialist, it fills with the closest positional match (e.g. CM fills a CAM slot as fallback)

This means the `Profiles` schema needs a `preferredPosition` field with standardized values. That's a small addition but critical for this to work.

---

## The Swap Logic (The Smart Part)

This is the most interesting technical challenge you described. When a coach drags **Player A** from slot X onto **Player B** in slot Y:

- Player B doesn't disappear — they **swap to slot X**
- It's a two-way exchange, not a replacement
- This prevents the coach from accidentally losing a player off the pitch

The logic is simply:

```
const temp = formation[slotY]
formation[slotY] = formation[slotX]
formation[slotX] = temp
```

Clean, intuitive, and matches how coaches think — they're swapping roles, not removing people.

---

## The Unavailability System

This is where your idea gets really deep. Here are all the legitimate reasons a player should appear in the **"Not Available"** list, pulled from your existing collections plus additions:

|Reason|Source|Badge Color|
|---|---|---|
|Injured|Injuries collection|🔴 Red|
|Suspended (Red Card)|DisciplinaryActions|🔴 Red|
|Suspended (Accumulated Yellows)|DisciplinaryActions|🟠 Orange|
|Leave Approved|LeaveRequests|🔵 Blue|
|Not in Squad (Listed for Transfer)|Profiles flag|⚪ Grey|
|Under-age / Cup Ineligible|Profiles flag|🟡 Yellow|
|Illness|New `illnessStatus` field|🟣 Purple|
|Personal Reasons|Coach-flagged manually|⚪ Grey|
|Late Arrival / Uncontactable|Coach-flagged manually|🟡 Yellow|

Each unavailable player card in the sidebar shows:

- Their photo
- Name and position
- The **exact reason badge** (e.g. "Suspended — 2nd Yellow")
- Expected return date if applicable (for injuries)

They are visible but greyed out, non-draggable, so the coach has full awareness of who's missing and why — not just a blank absence.

---

## The 2D Pitch UI — How to Build It

The pitch itself is built as an **SVG or CSS grid overlay** — not a photo, a clean vector drawing so it scales perfectly on any screen.

```
┌─────────────────────────────┐
│         Opponent Half        │
│                              │
│   [LW]      [ST]    [RW]    │  ← Forward line
│                              │
│        [CM]  [CM]           │  ← Midfield
│   [CM]                      │
│                              │
│  [LB]  [CB]  [CB]  [RB]    │  ← Defensive line
│                              │
│            [GK]              │  ← Goalkeeper
│         Our Half             │
└─────────────────────────────┘
```

Each slot is a **circular player token** showing:

- Player photo cropped to a circle
- Jersey number underneath
- A thin colored ring matching their fitness status

When dragging, the token lifts with a shadow effect and the destination slot highlights as a drop target. If you try to drop onto an unavailable slot it rejects with a shake animation.

---

## The Full UI Layout

```
┌──────────────────┬────────────────────────────────┬──────────────────┐
│  FORMATION       │                                │  UNAVAILABLE     │
│  PICKER          │      2D PITCH                  │  PLAYERS         │
│                  │                                │                  │
│  [4-3-3  ▼]     │    (player tokens on pitch)    │  🔴 J. Smith     │
│                  │                                │  Injured         │
│  BENCH /         │                                │  Return: 2 weeks │
│  AVAILABLE       │                                │                  │
│                  │                                │  🟠 K. Mensah    │
│  Drag from here  │                                │  2nd Yellow      │
│  to pitch        │                                │                  │
│                  │                                │  🔵 T. Okafor    │
│  [Player cards]  │                                │  Leave Approved  │
└──────────────────┴────────────────────────────────┴──────────────────┘
```

Three-column layout:

- **Left** — Formation picker dropdown + bench of available players to drag from
- **Centre** — The 2D pitch with current formation
- **Right** — Unavailable players with reasons (read-only, informational)

---

## Additional Intelligence You Can Layer On

**1. Position Mismatch Warning** If a coach drags a Goalkeeper into a Striker slot, a subtle warning badge appears on that token: _"⚠ Out of Position"_ — doesn't block the action, just flags it.

**2. Form Indicator** A small color dot on each player token showing their recent match rating — Green (good form), Amber (average), Red (poor form). Pulled from the last 3 match stats entries. Helps the coach make better selection decisions at a glance.

**3. Lineup Lock** Once the coach clicks "Submit Lineup," the formation locks. Any further changes require clicking "Edit Lineup" which logs the change in SystemLogs with a timestamp. The Manager can see lineup history per fixture.

**4. Formation History** Every saved lineup is stored against its fixture. The coach can click any past fixture and see exactly who played where — building a searchable tactical history over the season.

---

## The Tech Libraries

- **`@dnd-kit/core`** — best modern drag-and-drop for React, accessible and smooth
- **`@dnd-kit/sortable`** — handles the swap logic cleanly
- SVG for the pitch — hand-coded once, scales infinitely, no image loading issues
- **`node-vibrant`** already in your stack — player token ring colors pull from the same theme system

---

This feature, executed well, is genuinely on par with tools like **Wyscout's lineup builder** — except yours is live, role-aware, and connected to the entire club data system. That's the difference.