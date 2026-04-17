# Phase 1 Player Domain Plan

This document introduces the first safe step toward the player identity system described in the planning notes.

## Goal

Add the new player-domain foundation without breaking the current `Profile`-based application.

## New Models Added

- `server/models/Player.js`
  - Permanent person identity
  - Can outlive club membership and user login
- `server/models/ClubMembership.js`
  - One document per stint at the club
  - Holds active squad and availability context
- `server/models/SeasonStats.js`
  - One document per player membership per season
  - Intended to replace mutable cumulative stats over time
- `server/models/ArchivedPlayer.js`
  - Frozen departure snapshot for archive/history workflows

## Compatibility Strategy

The current application still depends heavily on `Profile` references:

- fixtures lineup
- training attendees
- injuries
- disciplinary actions
- leave requests
- inventory assignments
- multiple frontend panels

To avoid a disruptive rewrite, the new models are introduced in parallel and include compatibility links:

- `Player.currentUserId`
- `Player.legacyProfileId`
- `ClubMembership.userId`
- `ClubMembership.legacyProfileId`

`Profile` was also extended with migration-friendly fields:

- `preferredPosition`
- `secondaryPositions`
- `playerStatus`
- `availabilityNotes`

These additions support the future smart lineup builder while keeping the existing UI functional.

## Recommended Next Steps

1. Run `npm run migrate:player-domain` from `server/` to backfill `Player`, `ClubMembership`, and current-season `SeasonStats`.
2. Use the new admin endpoints:
   - `GET /api/player-domain/players`
   - `GET /api/player-domain/archive`
   - `POST /api/player-domain/profiles/:profileId/archive`
   - `POST /api/player-domain/archive/:archiveId/reinstate`
3. Introduce a read service that can resolve a player from either legacy `Profile` or new `Player`.
4. Move season performance writes from `Profile.stats` into `SeasonStats`.
5. Update coach lineup and squad screens to consume `preferredPosition` and membership availability.

## Important Constraint

Do not replace `Profile` in existing routes all at once. The repo currently has too many direct dependencies on `Profile` for a safe big-bang migration.

## Phase 1 APIs

### Archive a player

`POST /api/player-domain/profiles/:profileId/archive`

Body:

```json
{
  "reason": "transferred",
  "notes": "Joined another club after the January window."
}
```

### Reinstate a player

`POST /api/player-domain/archive/:archiveId/reinstate`

Body:

```json
{
  "userId": "optional-user-id",
  "jerseyNumber": 8,
  "primaryPosition": "CM",
  "secondaryPositions": ["DM", "CAM"],
  "contractType": "Owned"
}
```

### List player-domain records

`GET /api/player-domain/players`

Returns the admin-facing record set used by the new archive manager tab, including:

- legacy `Profile` identity
- linked `Player` status if migrated
- active membership summary if present
- migration state for each record
