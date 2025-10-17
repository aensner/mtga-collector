# UX Design Specifications

## Design System

This document outlines the user experience design for the MTG Arena Deck Builder application, with a deck-first approach and AI-powered optimization features.

## Core Design Principles

1. **Progressive Disclosure**: Hide complexity behind "Advanced" options
2. **Clear Hierarchy**: Step indicators, section headers, visual weight
3. **Inline Validation**: Real-time feedback on corrections
4. **Forgiving Workflows**: Easy undo, clear cancellation
5. **Contextual Guidance**: Help appears when needed, not all at once
6. **Deck-First Mental Model**: Decks are primary, collection is supporting data
7. **Ownership Context**: Every card interaction shows owned/missing status
8. **AI as Teammate**: Proactive suggestions, transparent reasoning

## Screen Designs

### 1. First Launch Experience

**Purpose**: Guide new users through one-time collection setup

**Layout**:
```
┌─────────────────────────────────────────────┐
│                                             │
│         🎴 MTG Arena Deck Builder           │
│                                             │
│      Build winning decks with AI            │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ To get started, we need to know what    ││
│ │ cards you own.                          ││
│ │                                         ││
│ │ Choose how to build your collection:    ││
│ │                                         ││
│ │ ┌─────────────────────────────────────┐││
│ │ │ 📸 Scan Screenshots (Recommended)    │││
│ │ │ Take 5-10 screenshots of your Arena  │││
│ │ │ collection and we'll scan them.      │││
│ │ │                                      │││
│ │ │ Time: ~10-15 minutes                 │││
│ │ │ [Start Scanning →]                   │││
│ │ └─────────────────────────────────────┘││
│ │                                         ││
│ │ ┌─────────────────────────────────────┐││
│ │ │ 📄 Import from File                  │││
│ │ │ Already exported your collection?    │││
│ │ │ [Upload CSV/JSON]                    │││
│ │ └─────────────────────────────────────┘││
│ │                                         ││
│ │ ┌─────────────────────────────────────┐││
│ │ │ ⚡ Start with Sample Collection      │││
│ │ │ Try the deck builder first           │││
│ │ │ [Explore with Sample Data]           │││
│ │ └─────────────────────────────────────┘││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Interactions**:
- Three clear paths with visual hierarchy (Recommended first)
- Single-column layout for focus
- Clear time expectations
- "Sample Collection" allows trying before commitment

---

### 2. Main Dashboard (Default Landing Page)

**Purpose**: Primary navigation hub, shows user's deck portfolio

**Layout**:
```
┌─────────────────────────────────────────────┐
│ MTG Arena Deck Builder    👤 adrian.ensner  │
│ [🏠 Decks] [🎴 Build] [📚 Collection]       │
├─────────────────────────────────────────────┤
│                                             │
│ My Decks (8)              [+ New Deck]      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ 🔴 Red   │ │ 🔵 Blue  │ │ ⚫ Black │     │
│ │ Aggro    │ │ Control  │ │ Midrange │     │
│ │          │ │          │ │          │     │
│ │ 60 cards │ │ 60 cards │ │ 58 cards │     │
│ │ Standard │ │ Standard │ │ Historic │     │
│ │ 85% own  │ │ 92% own  │ │ 100% own │     │
│ │          │ │          │ │          │     │
│ │ [Edit]   │ │ [Edit]   │ │ [Edit]   │     │
│ │ [Export] │ │ [Export] │ │ [Export] │     │
│ │ [Delete] │ │ [Delete] │ │ [Delete] │     │
│ └──────────┘ └──────────┘ └──────────┘     │
│                                             │
│ Quick Stats                                 │
│ ┌─────────────────────────────────────────┐│
│ │ 📊 Collection: 1,247 unique cards        ││
│ │ 🎴 Total Decks: 8 (6 Standard, 2 Hist)  ││
│ │ 📈 Recent Activity: 3 decks updated      ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Recent Scans                                │
│ ┌─────────────────────────────────────────┐│
│ │ Jan 14: +68 cards from 2 screenshots     ││
│ │ Jan 10: +42 cards from 1 screenshot      ││
│ │ [+ Add More Cards]                       ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Key Features**:
- Deck cards with visual thumbnails (color-coded by archetype)
- Ownership percentage prominently displayed
- One-click actions per deck
- Collection stats as context (not primary focus)
- Recent scans history (non-intrusive)

**Interactions**:
- Click deck card → Opens Deck Builder
- [+ New Deck] → New deck wizard
- [Edit] → Opens Deck Builder
- [Export] → Export format selector
- [Delete] → Confirmation dialog
- [+ Add More Cards] → Add Cards modal

---

### 3. Deck Builder (Primary Workflow)

**Purpose**: Main workspace for building and editing decks

**Layout** (Improved - 3-column responsive grid):
```
┌─────────────────────────────────────────────────────────────────┐
│ 🎴 Deck Builder                                                 │
│ Deck: "Red Aggro" (Standard)  60/60 ✓  [Save] [Load] [Export]  │
├──────────────┬──────────────────────┬───────────────────────────┤
│ DECK LIST    │ COLLECTION (979)     │ AI ASSISTANT              │
│ (Compact)    │ (Full Height)        │ (Collapsible)             │
├──────────────┤                      │                           │
│ Creatures 24 │ [🔍 Search cards...] │ 💬 Suggest cards for:     │
│ Swiftspear×4 │                      │ [Type your goal...]       │
│ Champion ×4  │ ☑ I Own (Available)  │                           │
│ Giant ×4     │ ☐ In Deck ☐ Not Add │ 🎯 Or analyze deck:       │
│ Anax ×4      │                      │ [✨ Optimize Deck]        │
│              │ [Filters ▼] Sort:▼   │                           │
│ Spells 14    │                      │ Recent Suggestions:       │
│ Shock ×4     │ Blood Operative x8   │ None yet                  │
│ Strike ×4    │ 3 CMC • Creature     │                           │
│ ...          │ 3 in deck / 8 avail  │                           │
│              │ [+]                  │                           │
│ Lands 22     │                      │                           │
│ Mountain ×22 │ [Click card to       │                           │
│              │  preview details]    │                           │
│ [Clear Deck] │                      │                           │
└──────────────┴──────────────────────┴───────────────────────────┘
```

**Responsive Breakpoints**:
- **Desktop (>1280px)**: 3-column layout (25% / 40% / 35%)
- **Tablet (768-1280px)**: 2-column layout (Deck collapsed, Collection + AI)
- **Mobile (<768px)**: Single column with tabs

**Card Preview Modal** (Fixed positioning):
```
┌─────────────────────────────────────────────┐
│ [Modal with card image + details]          │
│ - max-width: 672px (max-w-2xl)             │
│ - max-height: 90vh (scrollable)            │
│ - Centered with proper margins             │
│ - Closes on click outside or Escape key    │
└─────────────────────────────────────────────┘
```

**Key Features** (2025 Improvements):
- **Optimized 3-Column Layout**: Compact deck list, full-height collection, collapsible AI
- **Fixed Card Preview Modal**: No more overflow issues (max-w-2xl, max-h-90vh)
- **Responsive Grid**: Adapts to viewport (desktop/tablet/mobile breakpoints)
- **Ownership Filter**: Default to "I Own (Available)"
- **Visual Indicators**: Ownership badges inline with cards
- **Grouped Deck List**: Creatures, Spells, Lands with count headers
- **Collapsible Filters**: Compact filter row in collection
- **Real-Time Stats**: Live updates in Statistics tab
- **Sticky Tab Navigation**: Always visible while scrolling
- **Quick Add Buttons**: [+] buttons on card hover

**Interactions**:
- Search updates results instantly (<100ms)
- Filter checkboxes toggle immediately
- [+] adds single card to deck
- Single-click card → Card preview modal (fixed positioning)
- Double-click card → Quick add to deck
- Tab navigation between Builder/Statistics/AI Optimization
- Statistics update in real-time as deck changes
- [Save] → Database persistence with success indicator
- [Export] → Format selection dropdown (Arena/MTGGoldfish/CSV)
- Escape key closes modals

**Responsive Behavior**:
- **Desktop (>1280px)**: 3-column layout (25% / 40% / 35%)
- **Tablet (768-1280px)**: 2-column layout (Deck + Collection/AI tabs)
- **Mobile (<768px)**: Single column with tab navigation
- Card preview modal always fits viewport (max-w-2xl, max-h-90vh)
- Collapsible sections for better mobile space utilization

---

### 4. Collection View (Supporting Feature)

**Purpose**: Browse and manage owned cards, see usage in decks

**Layout**:
```
┌─────────────────────────────────────────────┐
│ 📚 My Collection (1,247 cards)              │
│ [🔍 Search] [Filter ▼] [+ Add Cards]        │
├─────────────────────────────────────────────┤
│                                             │
│ Quick Filters:                              │
│ [All] [Red] [Blue] [Creatures] [Rares+]    │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Lightning Bolt                      x4   ││
│ │ Instant • 1 CMC • Common                 ││
│ │ Used in: Red Aggro, Burn                 ││
│ │ [View Details] [Remove]                  ││
│ ├─────────────────────────────────────────┤│
│ │ Counterspell                        x2   ││
│ │ Instant • 2 CMC • Uncommon               ││
│ │ Used in: Blue Control                    ││
│ │ [View Details] [Remove]                  ││
│ ├─────────────────────────────────────────┤│
│ │ Embercleave                         x1   ││
│ │ Equipment • 6 CMC • Mythic               ││
│ │ Not used in any deck                     ││
│ │ [Add to Deck ▼] [View Details]           ││
│ └─────────────────────────────────────────┘│
│                                             │
│ Collection Stats:                           │
│ Colors: 🔴 247 🔵 189 ⚫ 156 🟢 198 ⚪ 145  │
│ Rarity: C 890 • U 245 • R 89 • M 23         │
│                                             │
│ [Export Collection] [Scan More Cards]       │
└─────────────────────────────────────────────┘
```

**Key Features**:
- **Deck Usage Tracking**: Shows which decks use each card
- **Unused Cards**: Highlighted with [Add to Deck] action
- **Card-Based Layout**: Not table rows (better readability)
- **Quick Filters**: One-click presets
- **Contextual Actions**: Varies by usage status

**Interactions**:
- Search filters instantly
- Quick filters toggle active state
- [Add to Deck ▼] → Dropdown of user's decks
- [View Details] → Card detail modal with Scryfall data
- [Remove] → Confirmation dialog
- [+ Add Cards] → Add Cards modal
- [Export Collection] → Format selector

---

### 5. Add Cards Modal (Non-Intrusive Collection Update)

**Purpose**: Quick card addition without disrupting workflow

**Layout**:
```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─── Add Cards to Collection ────────┐    │
│  │                                     │    │
│  │ How would you like to add cards?   │    │
│  │                                     │    │
│  │ ┌─────────────────────────────────┐│    │
│  │ │ 📸 Scan Screenshots              ││    │
│  │ │ [Upload Images]                  ││    │
│  │ └─────────────────────────────────┘│    │
│  │                                     │    │
│  │ ┌─────────────────────────────────┐│    │
│  │ │ 📝 Manual Entry                  ││    │
│  │ │ [Search Cards...]                ││    │
│  │ └─────────────────────────────────┘│    │
│  │                                     │    │
│  │ ┌─────────────────────────────────┐│    │
│  │ │ 📄 Import File (CSV/JSON)        ││    │
│  │ │ [Choose File]                    ││    │
│  │ └─────────────────────────────────┘│    │
│  │                                     │    │
│  │           [Cancel]                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

**After scanning:**
```
┌─────────────────────────────────────────────┐
│  ┌─── Scanning Complete ──────────────┐     │
│  │                                     │     │
│  │ ✅ Added 68 cards to collection     │     │
│  │ ⚠️  4 cards need review             │     │
│  │                                     │     │
│  │ [Review 4 Cards]  [Done]            │     │
│  └─────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**Key Features**:
- **Modal Workflow**: Doesn't leave current page
- **Three Methods**: Scan, manual, import
- **Quick Exit**: [Done] returns to context
- **Optional Review**: Can skip unmatched cards
- **2-Step Max**: Upload → Process → Done

**Interactions**:
- [Upload Images] → File picker → Processing starts
- Processing happens in modal with progress bar
- [Review 4 Cards] → Expands to show unmatched cards inline
- [Done] → Closes modal, returns to previous screen
- [Cancel] → Closes without changes

---

### 6. Deck Optimization View (AI-Powered Analysis)

**Purpose**: AI-driven deck improvement recommendations

**Layout**:
```
┌─────────────────────────────────────────────┐
│ 🤖 Optimize Deck: "Red Aggro"               │
├─────────────────────────────────────────────┤
│                                             │
│ Current Deck Analysis:                      │
│ ┌─────────────────────────────────────────┐│
│ │ Archetype: Aggro (Confidence: 94%)       ││
│ │ Win Rate Estimate: 62%                   ││
│ │ Consistency Score: 78/100                ││
│ │                                          ││
│ │ Strengths:                               ││
│ │ ✓ Low mana curve (avg 2.1)               ││
│ │ ✓ High creature density (40%)            ││
│ │                                          ││
│ │ Weaknesses:                              ││
│ │ ⚠️ Lacks card draw (0 sources)           ││
│ │ ⚠️ No reach (only 8 burn spells)         ││
│ │ ⚠️ Weak to board wipes                   ││
│ └─────────────────────────────────────────┘│
│                                             │
│ 🎯 AI Recommendations (Based on Meta):      │
│ ┌─────────────────────────────────────────┐│
│ │ High Impact (Add These)                  ││
│ │ ┌─────────────────────────────────────┐ ││
│ │ │ +2 Embercleave [●○○○] 1 owned        │ ││
│ │ │ Increases win rate by ~8%            │ ││
│ │ │ [Add to Deck] [Explain Why]          │ ││
│ │ └─────────────────────────────────────┘ ││
│ │ ┌─────────────────────────────────────┐ ││
│ │ │ +3 Castle Embereth [○○○○] Missing    │ ││
│ │ │ Provides late-game reach            │ ││
│ │ │ [Add Anyway] [Find Substitute]       │ ││
│ │ └─────────────────────────────────────┘ ││
│ │                                          ││
│ │ Consider Removing:                       ││
│ │ ┌─────────────────────────────────────┐ ││
│ │ │ -2 Phoenix of Ash                    │ ││
│ │ │ Too slow for aggro plan              │ ││
│ │ │ [Remove] [Keep Anyway]               │ ││
│ │ └─────────────────────────────────────┘ ││
│ └─────────────────────────────────────────┘│
│                                             │
│ [Apply All Recommendations] [Custom Tune]   │
└─────────────────────────────────────────────┘
```

**Key Features**:
- **Deck Analysis**: Archetype, win rate, consistency
- **Strengths/Weaknesses**: Actionable insights
- **Ownership-Aware**: Shows owned status for recommendations
- **Impact Metrics**: "Increases win rate by ~8%"
- **Substitute Finder**: For missing cards
- **Transparent Reasoning**: [Explain Why] button

**Interactions**:
- [Add to Deck] → Adds card immediately
- [Explain Why] → Expands to show detailed reasoning
- [Find Substitute] → Shows owned alternatives
- [Apply All Recommendations] → Bulk applies changes
- [Custom Tune] → Opens advanced settings

---

## Navigation & Information Architecture

### Top Navigation (Always Visible)
```
┌─────────────────────────────────────────────┐
│ 🎴 MTG Deck Builder                         │
│ [🏠 My Decks] [🎴 Build] [📚 Collection]    │
│                                     👤 User │
└─────────────────────────────────────────────┘
```

**Priority Order** (reflects usage frequency):
1. **My Decks** (80% of sessions) - Default landing page
2. **Build** (15% of sessions) - Quick access to new deck
3. **Collection** (5% of sessions) - Supporting feature

**Scanning is hidden** until needed via:
- Collection tab → [+ Add Cards] button
- Empty state prompts on first launch

### User Flow Patterns

**First-Time User**:
```
Landing → Collection Setup → My Decks → Deck Builder
   ↓            ↓               ↓            ↓
Welcome   Scan/Import    Empty State   First Deck
```

**Returning User (Typical)**:
```
My Decks → Edit Deck → Save → Export
   ↓          ↓         ↓        ↓
Dashboard  Builder  Auto-save Arena
```

**Collection Update**:
```
Any Screen → [+ Add Cards] Modal → Process → Auto-Close
     ↓              ↓                  ↓          ↓
  Working    Quick Upload          Success   Resume Work
```

---

## Component Specifications

### Ownership Indicator
**Visual**: ●●●○ (filled dots = owned copies)
**Variants**:
- ●●●● = 4/4 owned (fully owned)
- ●●○○ = 2/4 owned (partial)
- ○○○○ = 0/4 owned (missing)
- ∞ = Unlimited (basic lands)

**Colors**:
- Owned: Green (#3CCB7F)
- Missing: Gray (#8BA3B8)

### Card Browser Item
```
┌─────────────────────────────────┐
│ Lightning Bolt     [●●●●] OWNED │
│ Instant • 1 CMC • Common        │
│ [+ Add 4]                       │
└─────────────────────────────────┘
```

### Deck Card Item
```
┌─────────────────────────────────┐
│ 4x Lightning Bolt          [✏️] │
│ Instant • 1 CMC                 │
└─────────────────────────────────┘
```

### Mana Curve Visualizer
```
┌─ Mana Curve ─────────────┐
│ 1: ████████ (16)         │
│ 2: ████ (8)              │
│ 3: ███ (6)               │
│ 4: ██ (4)                │
│ 5+: █ (2)                │
│                          │
│ Avg CMC: 2.1             │
│ Lands suggested: 22      │
└──────────────────────────┘
```

### AI Suggestion Card
```
┌─────────────────────────────────────┐
│ +2 Embercleave [●○○○] 1 owned       │
│ Increases win rate by ~8%           │
│ [Add to Deck] [Explain Why]         │
└─────────────────────────────────────┘
```

---

## Interaction Patterns

### Keyboard Shortcuts (Power Users)
- `Ctrl+U` - Upload images
- `Ctrl+N` - New deck
- `Ctrl+S` - Save deck
- `Ctrl+E` - Export deck
- `Ctrl+F` - Focus search
- `Arrow Keys` - Navigate card list
- `Enter` - Add selected card
- `Esc` - Close modal/cancel action

### Drag & Drop
- Drag card from browser → deck to add
- Drag within deck sections to reorder
- Drag between deck and browser to remove

### Batch Operations
**Select Mode** (checkboxes appear):
```
┌─ Selected: 4 cards ─────────────────────────┐
│ [✏️ Edit Quantity] [❌ Delete] [✓ Verify]   │
└─────────────────────────────────────────────┘
```

### Real-Time Validation
- Search shows results instantly (<100ms)
- Deck stats update immediately on card add/remove
- Ownership filter toggles without reload
- Form validation appears inline

---

## Responsive Design

### Desktop (1920x1080+)
- Split view in Deck Builder (50/50)
- Grid layout for deck cards (3-4 columns)
- Sidebar navigation always visible

### Tablet (768-1024px)
- Split view becomes 40/60 (browser narrower)
- Deck cards grid 2-3 columns
- Collapsible sidebar

### Mobile (< 768px)
- Single-column layout
- Tabbed interface (Browser / Deck / Stats)
- Bottom sheets for modals
- Swipe gestures for actions
- FAB (Floating Action Button) for [+ Add Card]

---

## Accessibility

### WCAG 2.1 AA Compliance
- Color contrast ratio ≥ 4.5:1 for text
- Focus indicators on all interactive elements
- Keyboard navigation for all features
- ARIA labels for screen readers
- Alternative text for images
- Reduced motion support (`prefers-reduced-motion`)

### Screen Reader Support
- Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ARIA landmarks for navigation
- Descriptive button labels
- Status announcements for async actions

### Keyboard Navigation
- Logical tab order
- Skip links for main content
- Focus trapping in modals
- Escape key closes overlays

---

## Error States & Empty States

### Empty Collection (First Launch)
```
┌─────────────────────────────────────────────┐
│         No cards in collection yet          │
│                                             │
│     📸 Add cards to start building decks    │
│                                             │
│          [Scan Screenshots]                 │
│          [Import from File]                 │
│          [Try Sample Collection]            │
└─────────────────────────────────────────────┘
```

### Empty Deck List
```
┌─────────────────────────────────────────────┐
│       You haven't created any decks yet     │
│                                             │
│     🎴 Build your first competitive deck    │
│                                             │
│              [+ Create Deck]                │
│              [Browse Templates]             │
└─────────────────────────────────────────────┘
```

### OCR Error State
```
┌─────────────────────────────────────────────┐
│  ⚠️ OCR Processing Failed                   │
│                                             │
│  Unable to read card names from image.      │
│                                             │
│  Tips:                                      │
│  • Use higher resolution screenshots        │
│  • Ensure cards are clearly visible         │
│  • Try adjusting calibration settings       │
│                                             │
│  [Try Again] [Adjust Calibration] [Skip]    │
└─────────────────────────────────────────────┘
```

### Network Error
```
┌─────────────────────────────────────────────┐
│  ⚠️ Connection Error                        │
│                                             │
│  Unable to connect to Scryfall API.         │
│                                             │
│  Your changes are saved locally.            │
│                                             │
│  [Retry] [Work Offline]                     │
└─────────────────────────────────────────────┘
```

---

## Animation & Transitions

### Micro-Interactions
- Card add: Slide from browser to deck (300ms ease-out)
- Modal open/close: Fade + scale (200ms ease-in-out)
- Filter toggle: Instant (no delay)
- Stats update: Number count-up animation (500ms)
- Success feedback: Checkmark bounce (400ms)

### Loading States
- Skeleton screens for card lists
- Progress bars for OCR processing
- Spinner for AI optimization
- Shimmer effect for image loading

### Page Transitions
- Fade between screens (150ms)
- Slide for modal sheets (250ms)
- No animations if `prefers-reduced-motion` is set

---

## Visual Design Tokens

### Colors (MTG Arena Theme)
```
Background:
  - base: #0C0F14
  - panels: #131821
  - muted: #1A2130

Foreground:
  - primary: #E6EEF7
  - secondary: #BBD0E4
  - muted: #8BA3B8

Accent:
  - cyan: #13B9D5 (primary action)

Status:
  - success: #3CCB7F
  - warning: #FFD166
  - error: #EF476F
  - info: #13B9D5
```

### Typography
```
Headings:
  - H1: 32px/40px, Bold
  - H2: 24px/32px, Semibold
  - H3: 20px/28px, Semibold

Body:
  - Regular: 16px/24px, Normal
  - Small: 14px/20px, Normal
  - Tiny: 12px/16px, Normal

Monospace (card names):
  - 14px/20px, Mono
```

### Spacing
```
Scale: 4px base unit
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
```

### Border Radius
```
  - sm: 4px (buttons, inputs)
  - md: 8px (cards, panels)
  - lg: 12px (modals)
  - full: 9999px (pills)
```

---

## Performance Targets

### Load Times
- Initial page load: < 2 seconds
- Deck Builder open: < 1 second
- Card search results: < 100ms
- Collection scan: 15-20 seconds for 36 cards

### Responsiveness
- UI interactions: < 16ms (60fps)
- Filter application: < 50ms
- Deck stats update: < 100ms

### Data Optimization
- Cache Scryfall card data locally
- Lazy load card images (IntersectionObserver)
- Virtualize long lists (react-window)
- Debounce search input (300ms)

---

## Future Enhancements

### Phase 2 Features
1. **Deck Templates**: Pre-built meta decks
2. **Deck Sharing**: Generate shareable links
3. **Community Ratings**: Upvote/downvote decks
4. **Arena Log Parsing**: Auto-detect new cards
5. **Wildcard Optimizer**: Best deck with budget constraints

### Phase 3 Features
6. **Mobile App**: iOS/Android native
7. **Draft Helper**: Arena draft suggestions
8. **Sideboard Builder**: AI-powered sideboard
9. **Meta Tracker**: Real-time meta analysis
10. **Tournament Mode**: Match tracking, sideboarding

---

## Design Review Checklist

Before implementing any screen, verify:

- [ ] Ownership indicators visible on all card interactions
- [ ] AI suggestions proactive but not intrusive
- [ ] Collection features secondary to deck building
- [ ] Modal workflows don't disrupt primary task
- [ ] Real-time feedback on all actions
- [ ] Keyboard navigation fully supported
- [ ] Mobile responsive (test on 375px width)
- [ ] Loading states for all async operations
- [ ] Error states with clear recovery paths
- [ ] Empty states with clear next actions
- [ ] Consistent spacing (4px grid)
- [ ] Accessible color contrast (4.5:1+)
- [ ] Reduced motion support
- [ ] Performance targets met (<1s interactions)
