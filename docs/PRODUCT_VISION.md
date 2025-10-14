# MTG Arena Deck Builder - Product Vision

## Overview

**Primary Purpose**: AI-powered deck building, optimization, and management for MTG Arena players

**Supporting Feature**: Collection scanning (one-time setup + occasional updates)

## Problem Statement

MTG Arena players want to:
- Build competitive decks quickly
- Understand what decks they can build with their collection
- Optimize existing decks based on meta analysis
- Track and manage multiple deck lists

Currently, they must:
- Manually track owned cards across external tools
- Build decks without knowing what they own
- Rely on static deck lists without personalized optimization
- Switch between multiple apps (Arena, deck builders, collection trackers)

## Solution

A deck-first application where:
1. **Collection scanning** is a one-time setup step (10-15 minutes)
2. **Deck building** is the primary, daily workflow
3. **AI assistance** provides meta-aware suggestions and optimization
4. **Ownership awareness** shows what decks you can build right now

## User Personas

### Persona 1: The Competitive Player (Primary)
- **Goal**: Build and optimize meta decks quickly
- **Frequency**: Opens app 3-5x/week
- **Workflow**: My Decks → Edit → Optimize with AI → Export to Arena
- **Pain Point**: Doesn't know which meta decks are buildable with owned cards

### Persona 2: The Casual Brewer (Secondary)
- **Goal**: Experiment with creative deck ideas
- **Frequency**: Opens app 1-2x/week
- **Workflow**: New Deck → Browse collection → Add cards → Test changes
- **Pain Point**: Hard to discover synergies and card combinations

### Persona 3: The Collection Manager (Occasional)
- **Goal**: Keep collection up-to-date after Arena sessions
- **Frequency**: Updates collection 1-2x/month
- **Workflow**: Add Cards modal → Quick scan → Back to deck building
- **Pain Point**: Updating collection is tedious and interrupts deck building flow

## Product Principles

1. **Deck-First Mental Model**: Homepage shows decks, not collection
2. **AI as Teammate**: Proactive suggestions, not just search
3. **Ownership Context**: Every interaction shows owned/missing status
4. **Minimal Friction**: Collection updates happen in modal, not full-screen flow
5. **Progressive Disclosure**: Advanced features available but not overwhelming

## Success Metrics

### Engagement
- **Time in Deck Builder**: > 70% of session time
- **Decks per user**: Average 5+ active decks
- **AI suggestion acceptance rate**: > 40%
- **Weekly active users**: Users building/editing decks weekly

### Efficiency
- **Time to first deck**: < 5 minutes after collection setup
- **Collection update time**: < 2 minutes per scan
- **Deck modification speed**: < 30 seconds per card change

### Retention
- **Collection scans after setup**: < 1 per month (shows good initial capture)
- **Return rate**: 60%+ of users return within 7 days
- **Deck completion rate**: 80%+ of started decks reach 60 cards

## Competitive Advantage

| Feature | Our App | Existing Tools |
|---------|---------|----------------|
| **Ownership Awareness** | Built-in via OCR scanning | Manual import/entry |
| **AI Optimization** | Meta-aware, personalized | Generic tier lists |
| **Workflow** | Deck-first | Collection-first |
| **Update Friction** | Modal (30 seconds) | Full re-import (5+ min) |
| **Context Switching** | Single app | Arena + 3rd party tools |

## Roadmap

### Phase 1: Core Deck Experience (Weeks 1-2)
- My Decks dashboard (landing page)
- Deck Builder split view with ownership indicators
- Real-time stats (mana curve, card type distribution)
- Simple collection view

### Phase 2: AI Features (Week 3)
- AI deck suggestions in deck builder
- Deck optimization analysis
- Smart card recommendations based on owned cards

### Phase 3: Collection Management (Week 4)
- Scanning modal workflow (non-intrusive)
- Quick add cards from deck builder
- Collection stats and tracking

### Phase 4: Polish (Week 5)
- Export/import deck formats (Arena, MTGO, MTGGoldfish)
- Deck sharing and templates
- Performance optimization

### Phase 5: Advanced Features (Future)
- Arena log parsing (auto-detect new cards)
- Deck templates from meta
- Community deck ratings
- Tournament-ready exports

## Design Philosophy

### Information Architecture
```
Home (My Decks - 80% of sessions)
├─ Deck Builder (Primary feature - 15% of sessions)
│  ├─ Card Browser (ownership-aware)
│  ├─ Deck Editor (real-time stats)
│  ├─ AI Suggestions (proactive)
│  └─ Export/Share
├─ Collection (Supporting feature - 5% of sessions)
│  ├─ Collection Stats
│  ├─ Advanced Filters
│  └─ Quick Add Cards
└─ Settings
```

### User Journey

**First-Time User (One-Time Setup)**
```
1. Landing → Choose collection method
2. Scan screenshots (10-15 min, one-time)
3. Redirect to "My Decks" (empty state with prompts)
4. [+ New Deck] → Enter Deck Builder
```

**Returning User (90% of sessions)**
```
1. Open app → "My Decks" dashboard
2. Click existing deck → Deck Builder
3. Modify, optimize, save, export
4. (Collection never touched)
```

**Collection Update (Occasional)**
```
1. From anywhere: [+ Add Cards] floating button
2. Quick scan modal → Process → Auto-close
3. Continue previous context
```

## Key Features

### 1. My Decks Dashboard
- Grid of deck cards with thumbnails
- Ownership percentage per deck (e.g., "85% owned")
- Quick actions: Edit, Export, Delete, Duplicate
- Collection summary stats (unobtrusive)

### 2. Deck Builder
- **Split View**: Card browser (left) + Deck editor (right)
- **Ownership Filter**: "I Own" checked by default
- **Visual Indicators**: ●●●○ shows 3/4 copies owned
- **Real-Time Stats**: Mana curve, type distribution, land suggestions
- **Grouped Deck View**: By card type (Creatures, Instants, Lands, etc.)
- **One-Click Additions**: [+ Add 4] buttons

### 3. AI Optimization
- **Deck Analysis**: Archetype detection, win rate estimate, consistency score
- **Proactive Suggestions**: "Consider adding Embercleave (increases win rate by 8%)"
- **Ownership-Aware**: Shows [●○○○] 1 owned for recommendations
- **Substitute Finder**: Suggests alternatives for missing cards
- **Transparent Reasoning**: "Explain Why" for each recommendation

### 4. Collection Management
- **Deck Usage Tracking**: "Used in: Red Aggro, Burn"
- **Unused Cards Highlighted**: Suggests adding to decks
- **Quick Add Modal**: Non-intrusive workflow
- **Multiple Import Methods**: Scan, CSV, manual entry

### 5. Export & Sharing
- **Format Support**: Arena, MTGO, MTGGoldfish, text
- **One-Click Export**: Direct Arena import format
- **Deck Sharing**: Generate shareable links
- **Template Library**: Meta decks adjusted for owned cards

## Technical Considerations

### Performance
- Deck builder must load < 1 second
- Card search results < 100ms
- Collection updates process in background
- Cache Scryfall data locally

### Data Model
- Cards linked to decks (many-to-many)
- Track ownership quantity (1-4 per card)
- Store deck metadata (archetype, format, last modified)
- Separate collection scans history

### AI Integration
- Anthropic Claude for deck optimization
- Scryfall for card data and fuzzy matching
- Local card database for fast search
- Meta data from MTGGoldfish/tournament results

## Future Considerations

1. **Arena Integration**: Automatic collection sync via Arena log files
2. **Social Features**: Share decks, community ratings, deck discussions
3. **Mobile App**: iOS/Android versions with simplified UI
4. **Advanced Analytics**: Win/loss tracking, matchup analysis
5. **Budget Optimizer**: Build best deck with wildcard constraints
6. **Draft Helper**: Arena draft suggestions based on owned cards
7. **Sideboard Builder**: AI-powered sideboard recommendations
8. **Meta Tracking**: Monitor archetype popularity and adapt suggestions

## Open Questions

1. Should we support automatic Arena log parsing for collection updates?
2. Do we offer pre-built meta deck templates users can copy/modify?
3. Should we include social features (deck sharing, ratings) in V1?
4. How do we handle wildcards and crafting recommendations?
5. Do we track deck performance (win/loss) or keep it offline-focused?
