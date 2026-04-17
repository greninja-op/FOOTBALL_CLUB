# UI Design Language

This file defines the visual and interaction rules for the Football Club Management System. Any new UI work should follow these rules so public pages and authenticated panels feel like one product.

## Core Mood

- Use the home page as the visual source of truth.
- Keep the background cinematic: deep midnight base, floating particles, subtle football wireframes, fog layers, and glass surfaces.
- Surfaces should feel lifted from the background, not flat on it.

## Navbar Rules

- Use the same three-zone navbar structure everywhere:
  - left: glowing crest and club name
  - center: evenly spaced navigation items
  - right: role badge and primary action
- Club name uses `Bebas Neue` with wide tracking.
- Crest uses a circular frame with the `crest-glow` treatment.
- Navigation labels are uppercase, tightly tracked, and use the same underline behavior as the home page.

## Layout Rules

- Admin, manager, coach, and player pages should use one-page scroll sections when a page contains multiple tools.
- Each section needs:
  - a heading outside the card
  - a roomy gap from the previous section
  - a floating glass card for the content
- Use wide vertical spacing so each tool reads as its own zone.

## Card Rules

- Cards use dark glass with blur, soft borders, and deep shadows.
- Avoid stacking hard white tables directly on dark backgrounds without a card wrapper.
- Inner content may be dense, but the card edge should always breathe.

## Form Rules

- Do not open large forms inside fixed-height cards without resizing the container.
- Prefer inline expanding panels for create/edit flows inside management cards.
- Form reveals should animate with slide-down plus opacity, not pop instantly.
- Use shared dark input, select, and textarea styling.

## Alert Rules

- Success and error feedback should not shift the page layout.
- Use floating notices near the top-right area beneath the navbar.
- Keep animation smooth and short.

## Dropdown Rules

- Dropdowns must use the same dark glass field styling as inputs.
- Borders should be subtle by default and intensify on focus.
- Avoid browser-default bright dropdown styling against dark cards.

## Transition Rules

- Route transitions should close first, load the next page behind the curtain, then reopen.
- Users should never see the next page flash before the transition wall begins.
- Timing should feel deliberate, not abrupt.

## Coach and Player Workflow Rules

- Tactical and request interactions should support reversible actions.
- Drag-and-drop should allow assigning and removing, not only assigning.
- Request and management forms should expand inside their owning cards where practical.

## Consistency Rule

- If a new screen deviates from the home/admin shell, reuse the shared shell, floating card classes, input classes, and alert styles before adding new one-off patterns.
