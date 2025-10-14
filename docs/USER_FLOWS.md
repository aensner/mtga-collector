# User Flows

This document outlines the detailed user flows for the MTG Arena Deck Builder application, organized by persona and use case.

## Primary User Flows

### Flow 1: First-Time User - Initial Setup

**Persona**: New user with no collection data
**Goal**: Set up collection and create first deck
**Estimated Time**: 15-20 minutes

#### Steps:

1. **Landing Page**
   - User opens application
   - Sees welcome screen with three options:
     - 📸 Scan Screenshots (Recommended)
     - 📄 Import from File
     - ⚡ Start with Sample Collection
   - User clicks [Start Scanning →]

2. **Screenshot Upload**
   - Drag & drop area appears
   - User uploads 5-10 Arena collection screenshots
   - Thumbnails preview uploaded images
   - [Process Images →] button becomes active

3. **Processing**
   - Modal shows processing progress:
     - Overall progress: X/360 cards (10 images × 36 cards/page)
     - Current page: X/10
     - Per-page progress with mana curve animation
   - Empty slots automatically skipped (saves ~70% time)
   - User sees: "Processing complete: 342 cards validated, 18 need review"

4. **Review Unmatched Cards (Optional)**
   - Modal expands to show 18 unmatched cards
   - User sees OCR preview images
   - Options:
     - [✨ Fix All with AI] - Sends to Claude for correction
     - Manual correction per card
     - [Skip & Continue] - Adds verified cards only
   - User clicks [✨ Fix All with AI]
   - AI corrects 14/18 cards successfully
   - User manually fixes 2 remaining cards
   - [Done] → Modal closes

5. **Redirected to My Decks**
   - Empty state message: "You haven't created any decks yet"
   - Two prominent CTAs:
     - [+ Create Deck]
     - [Browse Templates]
   - Collection summary visible: "342 unique cards added"
   - User clicks [+ Create Deck]

6. **New Deck Wizard**
   - Name: [Enter deck name...]
   - Format: [Standard ▼]
   - Archetype: [Aggro ▼] (optional)
   - [Start Building →]

7. **Deck Builder - First Deck**
   - Split view opens:
     - Left: Card browser (filtered to "I Own" by default)
     - Right: Empty deck (0/60 cards)
   - AI suggestion appears: "For Red Aggro, consider starting with..."
   - User searches "Lightning Bolt"
   - Sees [●●●●] OWNED indicator
   - Clicks [+ Add 4]
   - Card slides into deck with animation
   - Mana curve updates in real-time
   - User continues building...

8. **Save & Export**
   - Deck reaches 60 cards
   - [Save] auto-saves with success indicator
   - User clicks [Export]
   - Selects "Arena Format"
   - Copies to clipboard
   - Success message: "Deck copied! Ready to import in Arena"

**Success Criteria**:
- ✓ Collection populated (300+ cards)
- ✓ First deck created (60 cards)
- ✓ User understands deck builder interface
- ✓ Exported deck to Arena

**Drop-off Points**:
- Screenshot upload (too many required)
- Processing wait time (15-20 seconds)
- Unmatched card review (unclear what to do)

**Optimizations**:
- Allow starting with fewer screenshots (3 minimum)
- Show entertaining tips during processing
- Make "Skip" option more prominent in review

---

### Flow 2: Returning User - Edit Existing Deck

**Persona**: Competitive player
**Goal**: Update deck based on new meta insights
**Estimated Time**: 5-10 minutes

#### Steps:

1. **My Decks Dashboard**
   - User opens app → Lands on "My Decks"
   - Sees 8 existing deck cards
   - "Red Aggro" shows "85% owned" (missing some cards)
   - User clicks [Edit] on "Red Aggro" deck

2. **Deck Builder Opens**
   - Deck loads in right panel (52/60 cards)
   - Card browser on left (filtered to owned)
   - Stats panel shows:
     - Mana curve: Heavy on 1-2 CMC
     - Avg CMC: 2.1
     - Lands: 22
   - AI suggestion badge shows "2 recommendations"

3. **Review AI Suggestions**
   - User clicks AI suggestions panel
   - Sees:
     - +2 Embercleave [●○○○] 1 owned - "Increases win rate by ~8%"
     - +3 Castle Embereth [○○○○] Missing - "Provides late-game reach"
   - User clicks [Add to Deck] on Embercleave
   - Card added, deck now 54/60
   - Stats update: Avg CMC increases to 2.3

4. **Find Substitute for Missing Card**
   - User clicks [Find Substitute] on Castle Embereth
   - Modal shows owned alternatives:
     - Ramunap Ruins [●●●○] 3 owned - Similar effect
     - Den of the Bugbear [●●●●] 4 owned - Man-land alternative
   - User selects Ramunap Ruins
   - [Add 3] → Deck now 57/60

5. **Manual Adjustments**
   - User notices Phoenix of Ash underperforming
   - Removes 2 copies (right-click → Remove)
   - Searches for "Anax"
   - Adds 2x Anax, Hardened in the Smithy
   - Deck complete: 60/60 cards

6. **Optimize & Export**
   - User clicks [🤖 Optimize] button
   - Full analysis screen shows:
     - Win rate estimate: 64% (up from 58%)
     - Consistency: 82/100
     - Strengths/Weaknesses analysis
   - User satisfied with changes
   - Clicks [Save] → Auto-saved
   - [Export] → Arena format → Copied

7. **Return to Dashboard**
   - Back arrow → Returns to My Decks
   - "Red Aggro" card now shows "87% owned" (updated)
   - Badge shows "Recently updated"

**Success Criteria**:
- ✓ Deck updated with AI suggestions
- ✓ Substitute found for missing card
- ✓ Deck optimized and exported
- ✓ Changes saved

**User Satisfaction Points**:
- AI suggestions saved time (no manual research)
- Substitute finder solved missing card problem
- Real-time stats helped decision-making
- Fast workflow (5 minutes total)

---

### Flow 3: Collection Update - Adding New Cards

**Persona**: Casual brewer
**Goal**: Add newly acquired cards after Arena session
**Estimated Time**: 2-3 minutes

#### Steps:

1. **From Deck Builder**
   - User building deck, needs "Embercleave"
   - Searches for card → Shows [○○○○] Missing
   - User just opened packs and got one
   - Clicks floating [+ Add Cards] button in corner

2. **Add Cards Modal Opens**
   - Overlay appears (doesn't leave deck builder)
   - Three options shown:
     - 📸 Scan Screenshots
     - 📝 Manual Entry ← User clicks this
     - 📄 Import File

3. **Manual Card Entry**
   - Search box appears: [Search for card...]
   - User types "Embercleave"
   - Autocomplete shows Scryfall results
   - Selects "Embercleave"
   - Quantity selector: [1] [2] [3] [4]
   - User selects [1]
   - [Add to Collection] → Success checkmark

4. **Modal Auto-Closes**
   - "✅ Added 1 card to collection"
   - Modal closes after 1 second
   - User back in Deck Builder
   - Embercleave now shows [●○○○] 1 owned
   - User clicks [+ Add 1] to deck

5. **Bulk Add (Alternative Path)**
   - User has multiple new cards
   - From Collection view → [+ Add Cards]
   - Selects "📸 Scan Screenshots"
   - Uploads 1 screenshot (latest pack opening)
   - Process → "✅ Added 5 cards"
   - [Done] → Back to Collection
   - New cards highlighted with "New" badge

**Success Criteria**:
- ✓ New card added to collection
- ✓ Immediately usable in deck builder
- ✓ Minimal workflow interruption (< 30 seconds)

**Key UX Win**:
- Modal workflow doesn't disrupt deck building
- Multiple methods for different situations
- Instant availability (no reload needed)

---

### Flow 4: AI Deck Optimization (Power User)

**Persona**: Competitive player preparing for tournament
**Goal**: Maximize deck performance using AI analysis
**Estimated Time**: 10-15 minutes

#### Steps:

1. **Select Deck for Optimization**
   - From My Decks → Click "Blue Control"
   - Deck shows "92% owned"
   - User clicks [🤖 Optimize] button (next to Edit)

2. **AI Analysis Begins**
   - Loading screen: "Analyzing deck archetype..."
   - Processing steps visible:
     - ✓ Archetype detection (Control - 96% confidence)
     - ✓ Meta analysis (pulling tournament data)
     - ✓ Card synergy evaluation
     - ✓ Matchup prediction
   - Analysis complete in 5-10 seconds

3. **Optimization Report**
   - Header shows:
     - Archetype: Control (96% confidence)
     - Win Rate Estimate: 58%
     - Consistency Score: 72/100

   - Strengths:
     - ✓ Strong removal suite (12 spells)
     - ✓ Efficient counterspells (8 sources)
     - ✓ Win conditions (4 threats)

   - Weaknesses:
     - ⚠️ Weak to early aggro (3-turn clock)
     - ⚠️ Limited card draw (only 4 sources)
     - ⚠️ Vulnerable to resolved planeswalkers

4. **Review Recommendations**
   - **High Impact Additions**:
     - +2 Shark Typhoon [●●○○] 2 owned
       - "Provides flexible threat + instant-speed play"
       - Win rate impact: +6%
       - [Add to Deck] [Explain Why]

     - +1 Supreme Verdict [●●●○] 3 owned
       - "Board wipe against aggro"
       - Win rate vs Aggro: +12%
       - [Add to Deck] [Explain Why]

   - **Consider Removing**:
     - -2 Negate
       - "Redundant with existing counterspells"
       - Swap suggestion: More card draw
       - [Remove] [Keep Anyway]

     - -1 Dream Trawler
       - "Too slow for current meta"
       - Alternative: Shark Typhoon (already suggested)
       - [Remove] [Keep Anyway]

5. **User Explores Reasoning**
   - Clicks [Explain Why] on Shark Typhoon
   - Modal expands with detailed analysis:
     - Meta context: "35% of decks are aggro"
     - Synergy: "Works with Instant package (8 spells)"
     - Statistics: "In 127 tournament decks, 89% run 2+"
     - Matchups: "+18% vs Aggro, +4% vs Control"
   - User convinced, clicks [Add to Deck]

6. **Handle Missing Cards**
   - One recommendation: +2 Teferi, Time Raveler [○○○○] Missing
   - User clicks [Find Substitute]
   - Alternatives shown:
     - Narset, Parter of Veils [●●○○] 2 owned
       - "Similar card advantage denial"
       - Meta viability: 72%
     - No substitute - deck still viable
   - User selects Narset option

7. **Apply Changes**
   - Summary shows:
     - +2 Shark Typhoon
     - +1 Supreme Verdict
     - +2 Narset, Parter of Veils
     - -2 Negate
     - -1 Dream Trawler
   - Net change: +2 cards (deck was 58/60)
   - User clicks [Apply All Recommendations]
   - Deck updates with animation
   - New stats:
     - Win Rate: 58% → 67% (+9%)
     - Consistency: 72 → 79 (+7)

8. **Custom Tuning**
   - User clicks [Custom Tune]
   - Advanced options appear:
     - Meta preference: [Aggro] [Midrange] [Control]
     - Budget constraint: [Use owned only] [Allow missing]
     - Risk tolerance: [Safe] [Experimental]
   - User adjusts settings, gets new recommendations
   - Satisfied with final deck

9. **Save & Export**
   - [Save Optimized Deck] → Confirmation
   - Export options:
     - Arena format
     - MTGGoldfish
     - Tournament decklist (text)
   - User selects Arena format → Copied

**Success Criteria**:
- ✓ Win rate increased by 9%
- ✓ Weaknesses addressed
- ✓ Only used owned cards (except noted substitutes)
- ✓ User understands reasoning behind changes

**Power User Value**:
- AI saved hours of meta research
- Transparent reasoning builds trust
- Ownership awareness prevents impossible suggestions
- Substitute finder solves missing card problem

---

### Flow 5: Deck Template Import (New User Alternative)

**Persona**: New player wanting to try competitive deck
**Goal**: Import and customize meta deck template
**Estimated Time**: 5 minutes

#### Steps:

1. **Discover Templates**
   - From My Decks (empty state)
   - Clicks [Browse Templates]
   - Template library opens

2. **Template Browser**
   - Categorized by:
     - Meta Decks (current Standard)
     - Archetype (Aggro, Control, Midrange, Combo)
     - Budget (Budget, Mid, Competitive)
   - Sorted by win rate
   - Each template shows:
     - Deck name
     - Win rate %
     - Ownership %: "You own 73% of this deck"
     - Missing wildcards needed

3. **Select Template**
   - User filters to "Aggro" + "High ownership"
   - Selects "Mono-Red Aggro (87% owned)"
   - Preview modal shows:
     - Full decklist
     - Key cards highlighted
     - Missing cards (5 cards)
     - Wildcard cost: 2 Rare, 3 Uncommon

4. **Customize Template**
   - [Import as-is] or [Customize First]
   - User clicks [Customize First]
   - Deck Builder opens with template loaded
   - Missing cards highlighted in yellow
   - AI suggestion: "Substitute for missing cards?"

5. **Find Substitutes**
   - User clicks [Find Substitutes for All Missing]
   - AI suggests owned alternatives:
     - Anax, Hardened → Torbran, Thane (owned) [Accept] [Reject]
     - Embercleave → Dreadhorde Arcanist (owned) [Accept] [Reject]
   - User accepts 3/5 substitutes
   - Decides to keep 2 missing cards (will craft)
   - Modified deck: "Mono-Red Aggro (Modified)" - 95% owned

6. **Save Custom Deck**
   - [Save Deck]
   - Name: "My Red Aggro"
   - Tags: Standard, Aggro, Budget
   - [Save] → Added to My Decks
   - Badge: "Based on template: Mono-Red Aggro"

**Success Criteria**:
- ✓ Competitive deck in < 5 minutes
- ✓ Ownership-aware suggestions
- ✓ Wildcard cost transparent
- ✓ Customization optional but easy

**New User Value**:
- Skip deck-building learning curve
- Ownership % helps choose buildable deck
- Substitute finder maximizes owned cards
- Template source cited (for learning)

---

## Edge Cases & Error Handling

### Edge Case 1: OCR Fails Completely
**Scenario**: User uploads blurry/low-res screenshot

**Flow**:
1. Processing attempts OCR
2. 0/36 cards extracted (all empty/failed)
3. Error message: "Unable to read cards from this image"
4. Suggestions:
   - Use higher resolution (1920x1080+)
   - Ensure cards visible (not zoomed out)
   - Try different screenshot
5. Options: [Upload Different Image] [Adjust Calibration] [Manual Entry]

**Recovery**:
- User can skip problematic image
- Manual entry available as backup
- Calibration option for advanced users

---

### Edge Case 2: No Internet Connection
**Scenario**: User tries to validate cards offline

**Flow**:
1. OCR completes (works offline)
2. Scryfall validation fails (network error)
3. Warning: "Unable to verify cards (offline)"
4. Options:
   - [Save Locally] → Stores OCR results
   - [Retry Connection]
   - [Work Offline] → Skips validation
5. On reconnect → Auto-validates saved cards

**User Experience**:
- No data loss
- Graceful degradation
- Auto-retry on reconnect

---

### Edge Case 3: Deck Over 60 Cards
**Scenario**: User accidentally adds too many cards

**Flow**:
1. User adds 61st card
2. Warning badge appears: "⚠️ 61/60 cards"
3. Deck stats show: "Remove 1 card to complete"
4. Options:
   - Red highlight on newest card (easy removal)
   - [Auto-optimize] → AI suggests which to remove
   - Manual removal (click any card)

**User Experience**:
- Clear visual feedback
- AI assistance available
- Easy undo

---

### Edge Case 4: All Recommendations Require Missing Cards
**Scenario**: User has low collection, AI suggests unowned cards

**Flow**:
1. User clicks [🤖 Optimize]
2. Analysis shows 5 recommendations
3. All show [○○○○] Missing
4. Special message: "These recommendations require cards you don't own"
5. Options:
   - [Find Owned Substitutes] → AI finds alternatives
   - [View Anyway] → Shows for reference (crafting plans)
   - [Optimize with Owned Only] → Re-runs with constraint

**User Experience**:
- No dead-end (substitute finder)
- Transparent about limitations
- Helps with crafting priorities

---

## Performance Optimization Opportunities

### Flow Optimization 1: Lazy Load Card Images
**Problem**: Card browser loads 1000+ images on open
**Solution**: Virtualized list + lazy loading
**Impact**: 5s → 0.5s initial load

### Flow Optimization 2: Debounced Search
**Problem**: Search triggers on every keystroke
**Solution**: 300ms debounce
**Impact**: Reduces API calls by 80%

### Flow Optimization 3: Background Collection Sync
**Problem**: Collection update blocks UI
**Solution**: Web Workers for OCR processing
**Impact**: UI remains responsive during scan

### Flow Optimization 4: Cached Deck Stats
**Problem**: Mana curve recalculates on every change
**Solution**: Memoized calculations
**Impact**: Instant updates (< 16ms)

---

## User Testing Scenarios

### Test 1: First-Time User Onboarding
**Task**: "Set up your collection and create your first deck"
**Success Metrics**:
- Time to first deck: < 20 minutes
- Completion rate: > 80%
- User understands next steps

**Observation Points**:
- Do users choose "Scan" or "Sample Collection"?
- Do they skip unmatched card review?
- Do they discover AI suggestions?

---

### Test 2: Deck Modification Speed
**Task**: "Add 5 specific cards to existing deck"
**Success Metrics**:
- Time per card: < 30 seconds
- No navigation errors
- Saves without prompt

**Observation Points**:
- Do users use search or browse?
- Do they notice ownership indicators?
- Do they check deck stats?

---

### Test 3: AI Recommendation Trust
**Task**: "Optimize your deck and explain why you accepted/rejected suggestions"
**Success Metrics**:
- Recommendation acceptance: > 40%
- Users can explain AI reasoning
- Satisfaction with results

**Observation Points**:
- Do users click [Explain Why]?
- Do they trust ownership-aware suggestions?
- Do they find substitute finder helpful?

---

## Flow Metrics to Track

### Engagement Metrics
- **Flow completion rate**: % users completing each flow
- **Time per flow**: Average duration
- **Drop-off points**: Where users abandon flow

### Feature Adoption
- **AI suggestion acceptance**: % recommendations applied
- **Template usage**: % users starting with templates
- **Substitute finder usage**: % users finding alternatives

### Efficiency Metrics
- **Cards added per session**: Average
- **Deck modifications**: Average edits per session
- **Collection update frequency**: Scans per month

### Satisfaction Indicators
- **Return rate**: % users returning within 7 days
- **Deck completion**: % decks reaching 60 cards
- **Export usage**: % decks exported

---

## Future Flow Enhancements

### Enhancement 1: Arena Log Auto-Import
**Flow**:
1. User connects Arena account
2. App monitors Arena logs
3. Detects new cards automatically
4. Background sync → No manual scanning

**Impact**: Reduces collection updates to zero manual effort

---

### Enhancement 2: Social Deck Sharing
**Flow**:
1. User clicks [Share Deck]
2. Generates shareable link
3. Recipient sees deck + ownership comparison
4. [Copy Deck] → Adjusted for recipient's collection

**Impact**: Community-driven deck discovery

---

### Enhancement 3: Draft Assistant
**Flow**:
1. User starts Arena draft
2. Opens draft assistant
3. Uploads pack screenshot
4. AI suggests pick based on:
   - Card power level
   - Synergy with previous picks
   - Deck archetype fit
5. User makes pick → Repeat

**Impact**: Improves draft performance, leverages existing OCR tech

---

This document serves as the blueprint for implementing user-centric workflows in the MTG Arena Deck Builder application. All flows prioritize deck building as the primary activity, with collection management as a supporting feature.
