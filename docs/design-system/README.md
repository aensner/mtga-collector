# MTG Arena Design System

A comprehensive design system for the MTG Arena Collection Scanner, featuring the official MTG Arena color palette, components, and accessibility guidelines.

## 📁 Directory Structure

```
docs/design-system/
├── README.md                 # This file
├── a11y/                     # Accessibility guidelines
│   └── checklist.md         # A11y checklist and standards
├── components/               # Component examples
│   ├── Readme.md            # Component usage guide
│   ├── button.html          # Button variants
│   ├── card.html            # Card components
│   ├── dialog.html          # Modal dialogs
│   ├── inputs.html          # Form inputs
│   ├── progress.html        # Progress bars
│   └── table.html           # Data tables
├── css/                      # Compiled CSS
│   └── mtga.css             # Main stylesheet (copied to src/)
├── design/                   # Design tokens
│   └── tokens.mtga.json     # Color, spacing, typography tokens
├── examples/                 # Screen templates
│   └── screen-templates/    # Full page examples
│       ├── calibration.html
│       ├── dashboard.html
│       ├── results.html
│       └── rhombus-zoom.html
├── icons/                    # Icon library
│   └── mtga/                # MTG Arena themed icons
│       ├── info.svg
│       ├── ocr.svg
│       ├── ok.svg
│       ├── refresh.svg
│       ├── rhombus.svg
│       ├── scan.svg
│       ├── settings.svg
│       └── warn.svg
├── motion/                   # Animation guidelines
│   └── motion.md            # Timing and easing standards
└── tailwind.config.js       # Tailwind configuration example
```

## 🎨 Color Palette

### Background Colors
```css
--bg-base: #0C0F14        /* Main background */
--bg-panel: #131821       /* Elevated panels */
--bg-muted: #1A2130       /* Subdued backgrounds */
--bg-elevated: #0E131B    /* Floating elements */
```

### Foreground Colors
```css
--fg-primary: #E6EEF7     /* Primary text */
--fg-secondary: #BBD0E4   /* Secondary text */
--fg-muted: #8BA3B8       /* Muted text */
--fg-inverted: #0C0F14    /* Text on light backgrounds */
```

### Accent Colors
```css
--accent: #13B9D5         /* Primary accent (cyan) */
--accent-600: #0FA3BA     /* Hover state */
--accent-700: #0C8EA2     /* Active state */
```

### Status Colors
```css
--ok: #3CCB7F             /* Success (green) */
--warn: #FFD166           /* Warning (yellow) */
--error: #EF476F          /* Error (red) */
--info: #4DA3FF           /* Info (blue) */
```

### Border Colors
```css
--border-subtle: #233045  /* Subtle borders */
--border-focus: #13B9D5   /* Focus indicators */
--border-separator: #1F2A3C /* Dividers */
```

## 🧩 Component Classes

### Buttons
```html
<!-- Primary button -->
<button class="button">Click Me</button>

<!-- Success button -->
<button class="button ok">Save</button>

<!-- Ghost button -->
<button class="button ghost">Cancel</button>

<!-- Danger button -->
<button class="button danger">Delete</button>
```

### Cards
```html
<div class="card">
  <div class="card-header">Card Title</div>
  <div class="card-body">Card content goes here...</div>
  <div class="card-actions">
    <button class="button">Action</button>
  </div>
</div>
```

### Forms
```html
<!-- Input -->
<input class="input" type="text" placeholder="Enter text...">

<!-- Select -->
<select class="select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Textarea -->
<textarea class="textarea" placeholder="Enter text..."></textarea>

<!-- Checkbox -->
<input class="checkbox" type="checkbox">
```

### Badges
```html
<span class="badge ok">Success</span>
<span class="badge warn">Warning</span>
<span class="badge error">Error</span>
<span class="badge info">Info</span>
```

### Progress Bar
```html
<div class="progress">
  <div class="bar" style="width: 60%"></div>
</div>
```

### Table
```html
<table class="table">
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

## 📏 Spacing Scale

Based on a 4px grid:

```css
--space-0: 0
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-7: 28px
--space-8: 32px
```

## 🔤 Typography

### Font Families
```css
--font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, ...
```

### Font Sizes
```css
--fs-xs: 12px
--fs-sm: 14px
--fs-md: 16px    /* Base size */
--fs-lg: 18px
--fs-xl: 22px
--fs-h1: 28px
--fs-h2: 22px
--fs-h3: 18px
```

### Line Heights
```css
--lh-tight: 1.25
--lh-normal: 1.45    /* Base line height */
--lh-relaxed: 1.6
```

## 🎭 Border Radius

```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-pill: 999px
```

## 🌑 Shadows

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.35)
--shadow-md: 0 6px 20px rgba(0,0,0,0.35)
--shadow-lg: 0 12px 32px rgba(0,0,0,0.45)
```

## ⚡ Motion

### Timing
```css
--motion-fast: 120ms      /* Quick interactions */
--motion-base: 180ms      /* Default transitions */
--motion-slow: 240ms      /* Complex animations */
```

### Easing
```css
--motion-curve: cubic-bezier(0.25, 0.1, 0.25, 1)
```

### Guidelines
- Use `120ms` for hover states and focus indicators
- Use `180ms` for most transitions (default)
- Use `240ms` for complex multi-step animations
- Always respect `prefers-reduced-motion`
- No bounce effects

## ♿ Accessibility

### Contrast Requirements
- **Text**: Minimum 4.5:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio
- All color combinations have been tested for WCAG AA compliance

### Focus Indicators
- All interactive elements have visible focus rings
- Focus ring color: `--border-focus` (#13B9D5)
- Never use `outline: none` without alternative focus indicator

### Keyboard Navigation
- Tab order is logical and follows visual flow
- Dialogs trap focus (Escape closes them)
- All functionality accessible via keyboard

### ARIA
- Meaningful labels for icons and buttons
- Status badges use `role="status"` where appropriate
- Form inputs have associated labels

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 1ms !important;
    animation-duration: 1ms !important;
  }
}
```

## 🚀 Usage in Project

### 1. Import Stylesheet
The compiled CSS is already imported in the project:

```typescript
// src/main.tsx
import './mtga.css'
```

### 2. Use Component Classes
```tsx
// Example: Button component
<button className="button ok">
  Export CSV
</button>

// Example: Card component
<div className="card">
  <div className="card-header">Results</div>
  <div className="card-body">
    <table className="table">
      {/* ... */}
    </table>
  </div>
</div>
```

### 3. Tailwind Integration
Colors and tokens are also available in Tailwind:

```tsx
// Using Tailwind utilities with design tokens
<div className="bg-bg-panel text-fg-primary">
  {/* Content */}
</div>
```

## 📖 Component Examples

View live HTML examples:
- **Components**: `components/*.html`
- **Screen Templates**: `examples/screen-templates/*.html`

Open any HTML file in a browser to see the component in action.

## 🔧 Customization

### Extending Colors
To add custom colors, edit `design/tokens.mtga.json` and regenerate the CSS.

### Component Variants
Create new component variants by combining base classes:

```html
<!-- Custom button variant -->
<button class="button" style="background: var(--info)">
  Info Button
</button>
```

## 📝 Design Tokens

Full design tokens are available in JSON format:
- **File**: `design/tokens.mtga.json`
- **Format**: Design Tokens Community Group standard
- **Usage**: Can be imported into Figma, Sketch, or other design tools

## 🤝 Contributing

When adding new components:
1. Follow existing naming conventions
2. Maintain accessibility standards
3. Test with keyboard navigation
4. Verify color contrast ratios
5. Add examples to `components/`
6. Update this README

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Tokens Format](https://design-tokens.github.io/community-group/format/)
- [MTG Arena Visual Style](https://magic.wizards.com/en/mtgarena)

---

**Version**: 1.0.0
**Last Updated**: October 2025
**Maintained by**: MTG Arena Collection Scanner Team
