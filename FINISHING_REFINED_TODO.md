# Finishing The Football App Refined To-Do

This checklist is based on `obsidian/sssas/finishing the football app refined.md`. Items marked complete were either already implemented and verified during the scan, or completed during this finishing pass.

## Foundation And Existing Wiring

- [x] Verify JWT authentication, protected routes, and role-based route access.
- [x] Verify MongoDB-backed schemas and REST API routes are wired for the core modules.
- [x] Verify Admin User Management is database-backed for list, create, edit/promote, and delete.
- [x] Verify Admin System Logs are database-backed and chronological, with CSV export.

## Manager Module

- [x] Add/verify contract countdown progress bars and contract-type badges.
- [x] Add/verify document vault upload plus preview/list grid.
- [x] Add/verify fixture scheduler supports create, edit, and delete.
- [x] Add/verify inventory UI has Stock Room and Allocations views.

## Coach Module

- [x] Verify tactical pitch blocks unavailable/injured/suspended players from dragging.
- [x] Add/verify squad health table supports inline fitness-status changes.
- [x] Add/verify discipline workflow supports issuing fines through the player fine flow.
- [x] Add/verify post-match statistics input supports goals, assists, minutes, cards, rating, and private feedback.

## Player Module

- [x] Add/verify player-only `my profile` endpoint and mobile-first bento dashboard.
- [x] Add/verify unified player schedule timeline for fixtures and training.
- [x] Add/verify player My Gear section shows assigned inventory.
- [x] Verify leave request form and request history are wired to backend status updates.

## Global UX Polish

- [x] Add/verify Global Command Palette with Ctrl/Cmd+K shortcuts.
- [x] Add/verify Global Notification Drawer/inbox for role-relevant events.
- [x] Add/verify beautiful empty states and loading states on high-density pages.
- [x] Add/verify export/print actions for logs, finance/contracts, and tactical pitch.
- [x] Add/verify personal user settings modal/dropdown.

## Final Cleanup

- [x] Deduplicate layout-level UI such as navbar, command palette, and notification center.
- [x] Verify animated background layout is not fighting child-page backgrounds.
- [x] Remove mock data and hardcoded demo rows from Admin, Manager, Coach, and Player panels.
- [x] Fix silent React warnings such as missing keys and unused imports.
- [x] Run server tests, client tests, lint, and client production build.
