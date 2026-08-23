---
name: frontend-design
description: Mobile-first RTL design system for Firebase dashboard apps with dark mode support
---

## Design Principles
- Mobile-first design (max-width: 600px)
- RTL support (dir="rtl")
- Dark/Light mode toggle
- Bootstrap Icons
- Card-based layout
- Touch-friendly (42px min button size)

## Color Palette

### Light Mode
- Background: #f5f7fa
- Card: #ffffff
- Text: #1f2a44
- Subtext: #6e7b96
- Primary: #0d6efd
- Success: #16a34a
- Danger: #ef4444
- Warning: #f59e0b

### Dark Mode
- Background: #0f1117
- Card: #1a1d27
- Text: #e2e8f0
- Subtext: #8896b0
- Border: #2a3456

## Component Patterns

### File Card
- Border-radius: 16px
- Padding: 12px 14px
- Shadow: 0 8px 25px rgba(0,0,0,.07)
- Border: 1.5px solid var(--border)
- Selected: border-color: var(--primary)

### Buttons
- Primary: background: var(--primary), color: #fff
- Secondary: background: var(--pl), color: var(--primary)
- Danger: background: linear-gradient(135deg,#ef4444,#fb7185)

### Icons
- Use Bootstrap Icons (bi-*)
- Icon button: 42px × 42px, border-radius: 12px

## Code Style
- CSS variables for theming
- Minimal animations (shimmer, fadeSlide)
- No external CSS frameworks
- Inline styles for component-specific styling

## Brand Colors
- FOREVER: #f472b6
- CHARACTER: #16a34a
- ROSELLA: #0d6efd
- FUTURE: #ef4444

## Layout Rules
- Container: max-width: 600px, margin: auto
- Bottom bar: fixed, padding: 12px
- Top bar: flex, space-between

## Typography
- Font: system-ui
- Title: 20px, weight: 800
- Body: 14px, weight: 700
- Small: 12px, weight: 700
