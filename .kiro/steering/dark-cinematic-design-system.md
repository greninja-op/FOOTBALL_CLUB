---
inclusion: auto
---

# Dark Cinematic Design System - MANDATORY

**CRITICAL**: This design system MUST be applied to ALL new components and pages automatically. Any UI work must follow these specifications without exception.

## Core Philosophy

This application uses a dark cinematic aesthetic inspired by luxury sports brands. All components must maintain visual consistency with the established design language.

## Color System

### Primary Colors
- **Primary Red**: `rgb(200, 16, 46)` or `var(--color-primary)`
- **Background Dark**: `#04040c` (rgba(4, 4, 12, 1))
- **Text White**: `rgba(255, 255, 255, 1.0)`
- **Text Light**: `rgba(255, 255, 255, 0.7)`
- **Text Muted**: `rgba(255, 255, 255, 0.4)`

### Semantic Colors
- **Success**: Green-900/40 with green-500/30 border
- **Warning**: Yellow-900/40 with yellow-500/30 border
- **Error**: Red-900/40 with red-500/30 border
- **Info**: Blue-900/40 with blue-500/30 border

## Glass-Morphism System

### Container Backgrounds
```css
/* Main containers */
background: rgba(10, 10, 24, 0.6);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.07);
border-radius: 16px;

/* Tailwind equivalent */
className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg"
```

### Card Backgrounds
```css
/* Secondary cards/sections */
background: rgba(31, 41, 55, 0.2); /* gray-700/20 */
border: 1px solid rgba(255, 255, 255, 0.1);

/* Tailwind equivalent */
className="bg-gray-700/20 border border-white/10"
```

### Modal Backgrounds
```css
/* Modal overlays */
background: rgba(17, 24, 39, 0.95); /* gray-900/95 */
backdrop-filter: blur(16px);

/* Tailwind equivalent */
className="bg-gray-900/95 backdrop-blur-md"
```

## Typography

### Font Family
- **Headers**: Bebas Neue (uppercase, letter-spacing: 3-4px)
- **Body**: System default (Inter/SF Pro)

### Font Sizes (Compact)
- **Page Title**: `text-xl` (20px)
- **Section Title**: `text-sm` (14px)
- **Body Text**: `text-sm` (14px)
- **Small Text**: `text-xs` (12px)

### Text Colors
```css
/* Headers */
color: rgba(255, 255, 255, 1.0);
className="text-white"

/* Body text */
color: rgba(255, 255, 255, 0.7);
className="text-gray-300"

/* Muted text */
color: rgba(255, 255, 255, 0.4);
className="text-gray-400"

/* Disabled text */
color: rgba(255, 255, 255, 0.3);
className="text-gray-500"
```

## Component Patterns

### Buttons

#### Primary Button (Red)
```jsx
<button className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm transition">
  Action
</button>
```

#### Secondary Button (Green)
```jsx
<button className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm transition">
  Action
</button>
```

#### Ghost Button
```jsx
<button className="bg-gray-700/20 text-gray-300 px-3 py-1.5 rounded hover:bg-gray-700/40 text-sm transition border border-white/10">
  Action
</button>
```

### Form Inputs

#### Text Input
```jsx
<input 
  type="text"
  className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
  placeholder="Enter text..."
/>
```

#### Textarea
```jsx
<textarea 
  className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none"
  rows="4"
  placeholder="Enter text..."
/>
```

#### Select Dropdown
```jsx
<select className="w-full px-3 py-1.5 bg-gray-800/40 border border-white/20 rounded-md text-white text-sm focus:border-red-500 focus:outline-none">
  <option>Option 1</option>
</select>
```

### Tables

#### Table Structure
```jsx
<div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-900/40">
      <tr className="border-b border-white/10">
        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-300">Header</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/10">
      <tr className="hover:bg-gray-700/20 transition">
        <td className="px-4 py-2.5 text-sm text-white">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Status Badges

#### Success Badge
```jsx
<span className="px-2 py-0.5 bg-green-900/40 border border-green-500/30 text-green-200 text-xs font-semibold rounded">
  Active
</span>
```

#### Warning Badge
```jsx
<span className="px-2 py-0.5 bg-yellow-900/40 border border-yellow-500/30 text-yellow-200 text-xs font-semibold rounded">
  Pending
</span>
```

#### Error Badge
```jsx
<span className="px-2 py-0.5 bg-red-900/40 border border-red-500/30 text-red-200 text-xs font-semibold rounded">
  Denied
</span>
```

#### Info Badge
```jsx
<span className="px-2 py-0.5 bg-blue-900/40 border border-blue-500/30 text-blue-200 text-xs font-semibold rounded">
  Info
</span>
```

### Modals

```jsx
{/* Modal Overlay */}
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
  {/* Modal Container */}
  <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg p-4 max-w-md w-full mx-4">
    {/* Modal Header */}
    <h3 className="text-sm font-semibold text-white mb-3">Modal Title</h3>
    
    {/* Modal Content */}
    <div className="text-sm text-gray-300">
      Content here
    </div>
    
    {/* Modal Actions */}
    <div className="flex gap-2 mt-4">
      <button className="flex-1 bg-gray-700/20 text-gray-300 px-3 py-1.5 rounded hover:bg-gray-700/40 text-sm transition">
        Cancel
      </button>
      <button className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm transition">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Toast Notifications

```jsx
{/* Success Toast */}
<div className="bg-green-900/40 border border-green-500/30 text-green-200 px-3 py-2 rounded text-sm">
  Success message
</div>

{/* Error Toast */}
<div className="bg-red-900/40 border border-red-500/30 text-red-200 px-3 py-2 rounded text-sm">
  Error message
</div>

{/* Warning Toast */}
<div className="bg-yellow-900/40 border border-yellow-500/30 text-yellow-200 px-3 py-2 rounded text-sm">
  Warning message
</div>
```

### Cards

```jsx
<div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-4">
  <h3 className="text-sm font-semibold text-white mb-3">Card Title</h3>
  <div className="text-sm text-gray-300">
    Card content
  </div>
</div>
```

## Spacing System (Compact)

### Padding
- **Container**: `p-4` (16px)
- **Card**: `p-4` (16px)
- **Button**: `px-3 py-1.5` (12px horizontal, 6px vertical)
- **Input**: `px-3 py-1.5` (12px horizontal, 6px vertical)
- **Table Cell**: `px-4 py-2.5` (16px horizontal, 10px vertical)

### Margins
- **Section Gap**: `mb-4` (16px)
- **Element Gap**: `mb-3` (12px)
- **Small Gap**: `mb-2` (8px)

### Grid Gaps
- **Card Grid**: `gap-4` (16px)
- **Form Grid**: `gap-3` (12px)
- **Button Group**: `gap-2` (8px)

## Navigation Patterns

### Tab Navigation
```jsx
<div className="mb-4 border-b border-white/10">
  <nav className="flex -mb-px">
    <button className="px-4 py-2 text-sm font-medium border-b-2 border-red-500 text-red-400">
      Active Tab
    </button>
    <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600">
      Inactive Tab
    </button>
  </nav>
</div>
```

### Scroll-Based Navigation
- Use sticky navbar with menu items
- Implement scroll spy for active section highlighting
- Use smooth scrolling with offset for navbar height
- Apply `scroll-mt-24` to section containers

## Animation & Transitions

### Standard Transition
```css
transition-property: all;
transition-duration: 150ms;
transition-timing-function: ease-in-out;

/* Tailwind */
className="transition"
```

### Hover Effects
```css
/* Buttons */
hover:bg-red-700
hover:bg-gray-700/40

/* Cards */
hover:bg-gray-700/20

/* Links */
hover:text-gray-300
```

## Accessibility

### Focus States
```css
/* All interactive elements */
focus:outline-none
focus:border-red-500
focus:ring-2
focus:ring-red-500/20
```

### Color Contrast
- Ensure text meets WCAG AA standards
- White text on dark backgrounds: minimum 7:1 ratio
- Status badges: use borders for additional clarity

## Loading States

```jsx
<div className="p-4 text-gray-300 text-sm">Loading...</div>
```

## Error States

```jsx
<div className="bg-red-900/40 border border-red-500/30 text-red-200 px-3 py-2 rounded text-sm">
  Error message here
</div>
```

## Empty States

```jsx
<div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center text-gray-400 text-sm">
  No data available
</div>
```

## MANDATORY IMPLEMENTATION RULES

1. **ALWAYS** use dark backgrounds (bg-gray-800/40, bg-gray-900/40)
2. **ALWAYS** use light text colors (text-white, text-gray-300, text-gray-400)
3. **ALWAYS** use red accent color for primary actions (bg-red-600)
4. **ALWAYS** use glass-morphism with backdrop-blur
5. **ALWAYS** use white/10 borders (border-white/10)
6. **ALWAYS** use compact sizing (p-4, text-sm, px-3 py-1.5)
7. **ALWAYS** add status badge borders for clarity
8. **ALWAYS** use transition classes for hover effects
9. **NEVER** use light backgrounds (bg-white, bg-gray-50)
10. **NEVER** use blue accent colors (use red instead)
11. **NEVER** use large padding/text sizes (use compact sizing)
12. **NEVER** create components without glass-morphism effects

## Quick Reference Checklist

When creating ANY new component, verify:

- [ ] Dark container background (bg-gray-800/40 or bg-gray-900/40)
- [ ] Backdrop blur applied (backdrop-blur-sm or backdrop-blur-md)
- [ ] White/10 borders (border border-white/10)
- [ ] Light text colors (text-white, text-gray-300)
- [ ] Red primary buttons (bg-red-600 hover:bg-red-700)
- [ ] Dark form inputs (bg-gray-800/40 border-white/20)
- [ ] Status badges with borders and /40 opacity backgrounds
- [ ] Compact sizing (p-4, text-sm, px-3 py-1.5)
- [ ] Hover states with transitions
- [ ] Focus states with red accent

## Examples from Existing Components

Reference these components for implementation patterns:
- `client/src/components/UserManagement.jsx` - Tables, modals, forms
- `client/src/components/PerformanceTracking.jsx` - Multi-column layout
- `client/src/components/PlayerDashboard.jsx` - Cards, badges, stats
- `client/src/pages/AdminPanel.jsx` - Scroll navigation, sections
- `client/src/components/Navbar.jsx` - Navigation, menu items

---

**This design system is MANDATORY and must be applied automatically to all new UI work without requiring explicit mention from the user.**
