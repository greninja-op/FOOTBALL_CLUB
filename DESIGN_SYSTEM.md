# Football Club Management System - Design System

## 🎨 Official Design Standards
**Version:** 1.0  
**Last Updated:** 2026-04-07  
**Source:** HomePage.jsx (Master Reference)

---

## 📐 Core Design Principles

### Background & Base
```css
Background Color: #04040c (Dark blue-black)
Min Height: 100vh
Position: relative
Z-Index: 3 (content layer)
```

### Transparency & Blur System
```css
/* Navbar - Scrolled State */
background: rgba(4,4,12,0.85)
backdropFilter: blur(24px)
WebkitBackdropFilter: blur(24px)
borderBottom: 1px solid rgba(255,255,255,0.06)

/* Navbar - Top State (transparent) */
background: transparent
backdropFilter: none
borderBottom: 1px solid transparent

/* Glass Cards (Standard) */
background: rgba(10,10,24,0.6)
backdropFilter: blur(24px)
WebkitBackdropFilter: blur(24px)
border: 1px solid rgba(255,255,255,0.07)
borderRadius: 16px (or 40px for large sections)
boxShadow: 0 0 60px rgba(0,0,0,0.4)
```

---

## 🎯 Navbar Specifications

### Structure
```
Left: Logo (40x40) + Club Name
Right: Menu Items + Role Badge + Logout Button
```

### Dimensions
```css
Height: 64px (py-4 = 16px top + 16px bottom + content)
Position: sticky
Top: 0
Z-Index: 50
Max-Width: 7xl (1280px)
Padding: px-4 sm:px-6 lg:px-8
```

### Logo Container
```css
Width: 40px
Height: 40px
Border-Radius: 50%
Background: rgba(200,16,46,0.12)
Border: 1px solid rgba(200,16,46,0.3)
Padding: 4px (if image inside)
```

### Club Name
```css
Font-Family: 'Bebas Neue', sans-serif
Font-Size: 18px (can be 20px on homepage)
Letter-Spacing: 4px
Color: white
```

### Menu Items (Navigation Links)
```css
/* Container */
Display: flex
Gap: 40px (gap-10) or 32px (gap-8)
Align-Items: center

/* Individual Links */
Font-Family: 'Bebas Neue', sans-serif
Font-Size: 11px
Letter-Spacing: 3px
Padding: 20px 0 (vertical for underline effect)
Color: rgba(255,255,255,0.4) (inactive)
Color: var(--color-primary) (active)
Border-Bottom: 2px solid transparent (inactive)
Border-Bottom: 2px solid var(--color-primary) (active)
Transition: all 0.2s
Cursor: pointer
Background: transparent
White-Space: nowrap

/* Hover State (inactive links) */
Color: rgba(255,255,255,0.7)
```

### Role Badge
```css
Padding: 6px 16px
Border-Radius: 100px
Font-Size: 9px
Font-Family: 'Bebas Neue', sans-serif
Letter-Spacing: 3px

/* Role Colors */
Admin: background rgba(168,85,247,0.15), color #c084fc, border 1px solid rgba(168,85,247,0.3)
Manager: background rgba(59,130,246,0.15), color #60a5fa, border 1px solid rgba(59,130,246,0.3)
Coach: background rgba(34,197,94,0.15), color #4ade80, border 1px solid rgba(34,197,94,0.3)
Player: background rgba(234,179,8,0.15), color #facc15, border 1px solid rgba(234,179,8,0.3)
```

### Logout Button
```css
Font-Family: 'Bebas Neue', sans-serif
Font-Size: 11px
Letter-Spacing: 3px
Background: var(--color-primary)
Color: white
Border: none
Border-Radius: 2px
Padding: 8px 20px
Cursor: pointer
Transition: transform 0.2s, box-shadow 0.2s
Box-Shadow: 0 4px 12px rgba(200,16,46,0.3)

/* Hover State */
Transform: translateY(-2px)
Box-Shadow: 0 6px 20px rgba(200,16,46,0.5)
```

---

## 🎴 Card System

### Glass Card (Standard Content Container)
```css
Background: rgba(10,10,24,0.6)
Backdrop-Filter: blur(24px)
-webkit-backdrop-filter: blur(24px)
Border: 1px solid rgba(255,255,255,0.07)
Border-Radius: 16px
Box-Shadow: 0 0 60px rgba(0,0,0,0.4)
Overflow: hidden
Padding: varies by content
```

### Large Section Cards
```css
Border-Radius: 40px
Padding: 40px (p-10)
```

### Component Cards (Tables, Forms)
```css
Background: bg-gray-800/40
Backdrop-Filter: blur-sm
Border: border border-white/10
Border-Radius: rounded-lg (8px)
Padding: p-4 or p-6
```

---

## 📊 Table Styling

### Table Structure
```css
/* Container */
Overflow-X: auto

/* Table */
Min-Width: 100%
Divide-Y: divide-white/10

/* Table Header */
Background: bg-gray-900/40
Padding: px-4 py-2.5 (compact) or px-6 py-3 (standard)
Text: text-xs font-medium text-gray-300 uppercase tracking-wider

/* Table Body */
Background: bg-gray-800/20
Divide-Y: divide-white/10

/* Table Rows */
Hover: hover:bg-gray-700/20

/* Table Cells */
Padding: px-4 py-2.5 (compact) or px-6 py-4 (standard)
Text: text-sm text-white (primary) or text-gray-300 (secondary)
```

---

## 🎨 Color System

### Primary Colors
```css
--color-primary: rgb(200,16,46) /* Red */
Primary RGB: rgba(200,16,46,X)
```

### Text Colors
```css
White (Primary): white or rgba(255,255,255,1.0)
Light Gray (Secondary): rgba(255,255,255,0.7) or text-gray-300
Medium Gray (Tertiary): rgba(255,255,255,0.4) or text-gray-400
Dim Gray (Disabled): rgba(255,255,255,0.3) or text-gray-500
```

### Border Colors
```css
Subtle: rgba(255,255,255,0.07)
Light: rgba(255,255,255,0.10)
Medium: rgba(255,255,255,0.15)
Strong: rgba(255,255,255,0.20)
```

### Status Colors
```css
Success/Win: #22c55e (green-500)
Warning/Draw: #eab308 (yellow-500)
Error/Loss: #ef4444 (red-500)
Info: #3b82f6 (blue-500)
```

### Status Badges (Dark Theme)
```css
Success: bg-green-900/40 text-green-200 border border-green-500/30
Warning: bg-yellow-900/40 text-yellow-200 border border-yellow-500/30
Error: bg-red-900/40 text-red-200 border border-red-500/30
Info: bg-blue-900/40 text-blue-200 border border-blue-500/30
```

---

## 🔤 Typography

### Font Family
```css
Primary: 'Bebas Neue', sans-serif
Body: System default (Inter, -apple-system, etc.)
```

### Heading Sizes
```css
H1 (Hero): clamp(60px, 13vw, 140px)
H2 (Section): clamp(36px, 5vw, 64px) or 48px
H3 (Subsection): text-xl (20px) or text-2xl (24px)
H4 (Component): text-lg (18px)
```

### Body Text
```css
Large: text-base (16px) or 15px
Standard: text-sm (14px)
Small: text-xs (12px)
Tiny: 9px or 11px (for labels, badges)
```

### Letter Spacing
```css
Headings (Bebas Neue): 3px to 5px
Labels/Badges: 2px to 4px
Body: normal (0)
```

---

## 🎭 Button System

### Primary Button
```css
Font-Family: 'Bebas Neue', sans-serif
Font-Size: 11px or 13px
Letter-Spacing: 3px
Background: var(--color-primary)
Color: white
Border: none
Border-Radius: 2px
Padding: 8px 20px (small) or 12px 32px (large)
Transition: transform 0.2s, box-shadow 0.2s
Box-Shadow: 0 4px 12px rgba(200,16,46,0.3)

/* Hover */
Transform: translateY(-2px)
Box-Shadow: 0 8px 24px rgba(200,16,46,0.5)
```

### Secondary Button
```css
Font-Family: 'Bebas Neue', sans-serif
Font-Size: 11px or 13px
Letter-Spacing: 3px
Background: bg-gray-700/40
Border: 1px solid rgba(255,255,255,0.10)
Color: text-gray-300
Border-Radius: 2px
Padding: 8px 20px
Transition: background 0.2s, transform 0.2s

/* Hover */
Background: bg-gray-700/60
Transform: translateY(-2px)
```

### Tertiary/Ghost Button
```css
Font-Family: 'Bebas Neue', sans-serif
Font-Size: 11px or 12px
Letter-Spacing: 3px
Background: transparent
Border: 1px solid rgba(255,255,255,0.2)
Color: white
Border-Radius: 2px
Padding: 10px 28px
Transition: background 0.2s, transform 0.2s

/* Hover */
Background: rgba(255,255,255,0.06)
Transform: translateY(-2px)
```

### Button Sizes
```css
Small: px-3 py-1.5 text-sm
Medium: px-4 py-2 text-sm
Large: px-6 py-3 text-base
```

---

## 📝 Form Elements

### Input Fields
```css
Background: bg-gray-800/40
Border: border-white/20
Color: text-white
Placeholder: placeholder-gray-500
Padding: px-3 py-2
Border-Radius: rounded (4px)
Focus: focus:outline-none focus:ring-2 focus:ring-red-500
```

### Select Dropdowns
```css
/* Same as Input Fields */
Background: bg-gray-800/40
Border: border-white/20
Color: text-white
Padding: px-3 py-2
Border-Radius: rounded
```

### Textarea
```css
/* Same as Input Fields */
Background: bg-gray-800/40
Border: border-white/20
Color: text-white
Placeholder: placeholder-gray-500
Padding: px-3 py-2
Border-Radius: rounded
Min-Height: varies
```

### Labels
```css
Font-Size: text-sm
Font-Weight: font-medium
Color: text-gray-300
Margin-Bottom: mb-1
```

---

## 🎬 Modal System

### Modal Overlay
```css
Position: fixed
Inset: 0
Background: rgba(0,0,0,0.7) or bg-black/70
Backdrop-Filter: blur-sm
Display: flex
Align-Items: center
Justify-Content: center
Z-Index: 50
```

### Modal Container
```css
Background: bg-gray-900/95
Backdrop-Filter: backdrop-blur-md
Border: border border-white/10
Border-Radius: rounded-lg (8px)
Max-Width: max-w-md (448px) or max-w-lg (512px)
Width: w-full
Margin: mx-4
Box-Shadow: 0 20px 60px rgba(0,0,0,0.5)
```

### Modal Header
```css
Padding: p-6
Border-Bottom: border-b border-white/10
Display: flex
Justify-Content: space-between
Align-Items: center
```

### Modal Body
```css
Padding: p-6
Space-Y: space-y-4
```

### Modal Footer
```css
Padding: p-6 or pt-4
Display: flex
Gap: gap-3
```

---

## 📏 Spacing System

### Container Padding
```css
Small: p-4 (16px)
Medium: p-6 (24px)
Large: p-8 (32px)
Extra Large: p-10 (40px)
```

### Section Spacing
```css
Vertical: py-24 (96px) for major sections
Between Elements: space-y-6 (24px) or space-y-8 (32px)
```

### Gap Spacing
```css
Tight: gap-2 (8px)
Normal: gap-4 (16px)
Loose: gap-6 (24px)
Extra Loose: gap-8 (32px)
```

---

## 🎪 Animation & Transitions

### Standard Transitions
```css
Transition: all 0.2s ease
Transition: transform 0.2s, box-shadow 0.2s
Transition: background 0.4s ease, border-color 0.4s ease
```

### Hover Effects
```css
/* Buttons */
Transform: translateY(-2px)
Box-Shadow: enhanced

/* Links */
Color: brighter shade
Opacity: increased
```

### Scroll Behavior
```css
Scroll-Behavior: smooth
Scroll-Margin-Top: 80px (navbar height) or scroll-mt-24
```

---

## 🎯 Z-Index Layers

```css
Background Effects: 0
Pitch Ghost/Particles: 0
Floating Balls: 0
Content Layer: 3
Navbar: 50
Modals/Overlays: 50
Tooltips/Popovers: 60
```

---

## 📱 Responsive Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px (max-w-7xl)
2xl: 1536px
```

---

## ✅ Component Checklist

When creating or updating components, ensure:

- [ ] Background uses `rgba(10,10,24,0.6)` with `backdrop-blur(24px)`
- [ ] Borders use `rgba(255,255,255,0.07)` or `/10`
- [ ] Text colors: white (primary), gray-300 (secondary), gray-400 (tertiary)
- [ ] Buttons use red-600 (primary) or gray-700/40 (secondary)
- [ ] Tables have bg-gray-900/40 headers and bg-gray-800/20 bodies
- [ ] Modals use bg-gray-900/95 with backdrop-blur-md
- [ ] Status badges use dark variants with colored borders
- [ ] Bebas Neue font for headings/labels with letter-spacing
- [ ] Compact sizing: p-4, text-xl, px-4 py-2.5
- [ ] Hover states with translateY(-2px) and enhanced shadows
- [ ] Smooth transitions (0.2s)

---

## 🎨 Quick Reference

### Most Common Patterns

**Glass Card:**
```jsx
style={{
  background: 'rgba(10,10,24,0.6)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  boxShadow: '0 0 60px rgba(0,0,0,0.4)',
}}
```

**Navbar (Scrolled):**
```jsx
style={{
  background: 'rgba(4,4,12,0.85)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}}
```

**Primary Button:**
```jsx
className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
```

**Table Header:**
```jsx
className="bg-gray-900/40 px-4 py-2.5 text-xs font-medium text-gray-300 uppercase tracking-wider"
```

**Status Badge:**
```jsx
className="px-2 py-1 text-xs rounded bg-green-900/40 text-green-200 border border-green-500/30"
```

---

**END OF DESIGN SYSTEM**
