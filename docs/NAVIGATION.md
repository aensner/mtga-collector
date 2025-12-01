# Navigation & Informationsarchitektur

> **Status**: Draft
> **Erstellt**: 2025-12-01
> **Aktualisiert**: 2025-12-01 (Arena/Paper Trennung)
> **Basiert auf**: MVP-Scope (5 Use Cases)

---

## 0. Domänenmodell

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOMÄNENMODELL                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Arena und Paper sind GETRENNTE WELTEN:                                    │
│                                                                             │
│   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐│
│   │           🎮 ARENA              │   │           🃏 PAPER              ││
│   │                                 │   │                                 ││
│   │   Collection                    │   │   Collection                    ││
│   │   └── Virtuelle Karten          │   │   ├── Originale (turnierfähig)  ││
│   │       (keine Unterscheidung)    │   │   └── Proxies (casual only)     ││
│   │                                 │   │                                 ││
│   │   Decks                         │   │   Decks                         ││
│   │   └── NUR aus Arena-Karten      │   │   └── Original + Proxy gemischt ││
│   │                                 │   │                                 ││
│   │   Formate:                      │   │   Formate:                      ││
│   │   • Standard                    │   │   • Commander (EDH)             ││
│   │   • Historic                    │   │   • Modern                      ││
│   │   • Explorer                    │   │   • Legacy                      ││
│   │   • Brawl                       │   │   • Vintage                     ││
│   │   • Draft                       │   │   • Pioneer                     ││
│   └─────────────────────────────────┘   └─────────────────────────────────┘│
│                                                                             │
│   KEINE Mischung möglich:                                                   │
│   • Arena-Decks können NUR Arena-Karten enthalten                          │
│   • Paper-Decks können NUR Paper-Karten enthalten                          │
│                                                                             │
│   GEMEINSAM:                                                                │
│   • Scryfall Kartendaten (Regeln, Bilder, Abilities)                       │
│   • AI Deck-Builder Logik                                                   │
│   • Banlist-Daten (aber unterschiedliche Formate!)                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Hauptnavigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HAUPTNAVIGATION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  🏠 Home       🎮 Arena       🃏 Paper       ⚙️ Settings         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   4 Hauptbereiche:                                                          │
│                                                                             │
│   1. HOME (Dashboard)                                                       │
│      → Übersicht beider Welten, Notifications, Quick Actions               │
│                                                                             │
│   2. ARENA (80% Nutzung - MVP Fokus)                                       │
│      → Arena Collection                                                     │
│      → Arena Decks                                                          │
│      → Arena Import (Screenshot OCR)                                        │
│      → Arena Empfehlungen & Banlists                                        │
│                                                                             │
│   3. PAPER (20% Nutzung - Phase 2)                                         │
│      → Paper Collection (Original + Proxy)                                  │
│      → Paper Decks                                                          │
│      → Paper Import (4 Methoden)                                            │
│      → Paper Empfehlungen & Preise                                          │
│                                                                             │
│   4. SETTINGS (Icon)                                                        │
│      → Konfiguration, Import-Settings, Account                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sekundäre Navigation (innerhalb Arena/Paper)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│   ARENA / PAPER - SEKUNDÄRE NAVIGATION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  🎮 Arena                                                        │      │
│   │  ──────────────────────────────────────────────────────────────  │      │
│   │  [Collection]  [Decks]  [Empfehlungen]  [Import]                │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  🃏 Paper                                                        │      │
│   │  ──────────────────────────────────────────────────────────────  │      │
│   │  [Collection]  [Decks]  [Empfehlungen]  [Import]                │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   Gleiche Struktur, aber unterschiedliche:                                  │
│   • Filter (Paper: Original/Proxy)                                         │
│   • Import-Methoden (Arena: OCR, Paper: 4 Methoden)                        │
│   • Formate (Arena: Standard/Historic, Paper: Commander/Modern)            │
│   • Empfehlungen (Paper: Preise wichtiger)                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Screen-Übersicht

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SCREEN MAP                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   HOME                                                                      │
│   └── Dashboard                        [/]                                  │
│       ├── Arena Stats (Karten, Decks)                                      │
│       ├── Paper Stats (Karten, Decks, Originale/Proxies)                   │
│       ├── Recent Activity (beide)                                           │
│       ├── Notifications (Bans, Empfehlungen)                               │
│       └── Quick Actions                                                     │
│                                                                             │
│   ══════════════════════════════════════════════════════════════════════   │
│   🎮 ARENA                                                                  │
│   ══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   ARENA > COLLECTION                                                        │
│   ├── Collection Browser               [/arena/collection]                  │
│   │   ├── Grid View / List View                                            │
│   │   ├── Filter Panel                                                      │
│   │   │   ├── Farbe, CMC, Typ, Seltenheit                                  │
│   │   │   ├── Set, Keywords, Kreaturentyp                                  │
│   │   │   ├── Format-Legal (Standard, Historic, etc.)                      │
│   │   │   └── Textsuche                                                     │
│   │   └── Search Bar                                                        │
│   ├── Card Detail                      [/arena/collection/:cardId]          │
│   │   ├── Card Image + Info                                                 │
│   │   ├── Anzahl in Collection                                             │
│   │   ├── In welchen Decks verwendet                                       │
│   │   └── Format-Legalität                                                  │
│   └── Import (Screenshot)              [/arena/import]                      │
│       ├── Drag & Drop Zone                                                  │
│       ├── OCR Processing                                                    │
│       └── Review & Confirm                                                  │
│                                                                             │
│   ARENA > DECKS                                                             │
│   ├── Deck List                        [/arena/decks]                       │
│   │   ├── Meine Decks (Grid/List)                                          │
│   │   └── + Neues Deck                                                      │
│   ├── Deck Detail                      [/arena/decks/:deckId]               │
│   │   ├── Deck Stats (Mana Curve, Colors)                                  │
│   │   ├── Card List                                                         │
│   │   ├── Legality Check                                                    │
│   │   ├── Upgrade Suggestions                                               │
│   │   └── Export (Arena Format)                                             │
│   └── AI Builder                       [/arena/decks/ai-builder]            │
│       ├── Startpunkt (Combo wählen)                                        │
│       ├── Format (Standard, Historic, etc.)                                │
│       ├── Generate → AI arbeitet                                           │
│       └── Review & Adjust                                                   │
│                                                                             │
│   ARENA > EMPFEHLUNGEN                                                      │
│   ├── Übersicht                        [/arena/recommendations]             │
│   │   ├── Kaufempfehlungen (Wildcards)                                     │
│   │   ├── Banlist Alerts                                                    │
│   │   └── Deck Improvements                                                 │
│   └── Banlist Monitor                  [/arena/bans]                        │
│       ├── Recent Bans (Standard, Historic)                                 │
│       ├── Affected Decks                                                    │
│       └── Replacement Suggestions                                           │
│                                                                             │
│   ══════════════════════════════════════════════════════════════════════   │
│   🃏 PAPER (Phase 2)                                                        │
│   ══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   PAPER > COLLECTION                                                        │
│   ├── Collection Browser               [/paper/collection]                  │
│   │   ├── Grid View / List View                                            │
│   │   ├── Filter Panel                                                      │
│   │   │   ├── Alle Filter wie Arena PLUS:                                  │
│   │   │   ├── ★ Original / Proxy Toggle                                    │
│   │   │   └── ★ Preis-Range                                                │
│   │   └── Search Bar                                                        │
│   ├── Card Detail                      [/paper/collection/:cardId]          │
│   │   ├── Card Image + Info                                                 │
│   │   ├── ★ Anzahl Originale + Anzahl Proxies                              │
│   │   ├── In welchen Decks verwendet                                       │
│   │   ├── ★ Marktpreis                                                      │
│   │   └── Format-Legalität                                                  │
│   └── Import                           [/paper/import]                      │
│       ├── ★ Import-Modus wählen:                                           │
│       │   ├── Precon/Produkt importieren                                   │
│       │   ├── Manuell eintippen                                            │
│       │   ├── Kamera-Scan (einzeln)                                        │
│       │   └── Bulk-Scan                                                     │
│       └── ★ Original/Proxy Kennzeichnung                                   │
│                                                                             │
│   PAPER > DECKS                                                             │
│   ├── Deck List                        [/paper/decks]                       │
│   ├── Deck Detail                      [/paper/decks/:deckId]               │
│   │   ├── ★ Original vs Proxy Anteil anzeigen                              │
│   │   └── ★ Turnierfähigkeit prüfen                                        │
│   └── AI Builder                       [/paper/decks/ai-builder]            │
│       ├── Startpunkt (Commander wählen)                                    │
│       └── Format (Commander, Modern, etc.)                                 │
│                                                                             │
│   PAPER > EMPFEHLUNGEN                                                      │
│   ├── Übersicht                        [/paper/recommendations]             │
│   │   ├── ★ Kaufempfehlungen mit Preisen                                   │
│   │   ├── ★ Budget-Alternativen                                            │
│   │   └── Banlist Alerts                                                    │
│   └── Banlist Monitor                  [/paper/bans]                        │
│       └── Formate: Commander, Modern, Legacy                               │
│                                                                             │
│   ══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   SETTINGS                                                                  │
│   └── Settings                         [/settings]                          │
│       ├── Arena Settings                                                    │
│       │   └── OCR Calibration                                              │
│       ├── Paper Settings                                                    │
│       │   └── Default Import Mode                                          │
│       ├── API Keys                                                          │
│       └── Account                                                           │
│                                                                             │
│   ★ = Paper-spezifisch                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. User Flows

### 3.1 Collection Import Flow (A1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLOW: COLLECTION IMPORT                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │  Collection  │────►│   Import     │────►│   Upload     │               │
│   │  (leer)      │     │   Button     │     │   Screen     │               │
│   └──────────────┘     └──────────────┘     └──────┬───────┘               │
│                                                     │                       │
│                                                     ▼                       │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │  Collection  │◄────│   Review &   │◄────│  Processing  │               │
│   │  Browser     │     │   Confirm    │     │  (OCR)       │               │
│   └──────────────┘     └──────────────┘     └──────────────┘               │
│                                                                             │
│   Screens:                                                                  │
│   1. /collection              → "Importieren" Button                       │
│   2. /collection/import       → Drag & Drop Zone                           │
│   3. /collection/import       → Progress Bar, Status                       │
│   4. /collection/import       → Ergebnisse prüfen, korrigieren             │
│   5. /collection              → Neue Karten sichtbar                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Collection Browse Flow (A4)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLOW: COLLECTION BROWSE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │  Collection  │────►│   Filter     │────►│  Filtered    │               │
│   │  Browser     │     │   Panel      │     │  Results     │               │
│   └──────────────┘     └──────────────┘     └──────┬───────┘               │
│                                                     │                       │
│                                                     ▼                       │
│                                              ┌──────────────┐               │
│                                              │  Card Detail │               │
│                                              │  Modal/Page  │               │
│                                              └──────────────┘               │
│                                                                             │
│   Filter Panel enthält:                                                     │
│   • Farbe (WUBRG + Colorless + Multi)                                      │
│   • CMC (Slider: 0-10+)                                                    │
│   • Kartentyp (Creature, Instant, etc.)                                    │
│   • Seltenheit (C/U/R/M)                                                   │
│   • Set/Edition (Dropdown)                                                  │
│   • Keywords (Autocomplete)                                                 │
│   • Kreaturentyp (Autocomplete)                                            │
│   • Format-Legal (Toggle)                                                   │
│   • Textsuche (Freitext)                                                   │
│   • Original/Proxy (Toggle)                                                 │
│   • Arena/Paper (Toggle)                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 AI Deck Builder Flow (B1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLOW: AI DECK BUILDER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │  Decks       │────►│  + Neues     │────►│  AI Builder  │               │
│   │  Overview    │     │    Deck      │     │  Wizard      │               │
│   └──────────────┘     └──────────────┘     └──────┬───────┘               │
│                                                     │                       │
│                                              ┌──────┴───────┐               │
│                                              ▼              ▼               │
│                                     ┌────────────┐  ┌────────────┐          │
│                                     │ Commander  │  │ Karten-    │          │
│                                     │ wählen     │  │ Combo      │          │
│                                     └─────┬──────┘  └──────┬─────┘          │
│                                           │                │                │
│                                           └───────┬────────┘                │
│                                                   ▼                         │
│                                          ┌──────────────┐                   │
│                                          │ Format &     │                   │
│                                          │ Constraints  │                   │
│                                          └──────┬───────┘                   │
│                                                 │                           │
│                                                 ▼                           │
│   ┌──────────────┐     ┌──────────────┐  ┌──────────────┐                   │
│   │  Deck        │◄────│  Review &    │◄─│  AI         │                   │
│   │  Detail      │     │  Adjust      │  │  Generating  │                   │
│   └──────────────┘     └──────────────┘  └──────────────┘                   │
│                                                                             │
│   AI Builder Steps:                                                         │
│   1. Startpunkt wählen (Commander ODER Karten-Combo)                       │
│   2. Format wählen (Standard, Historic, Commander, etc.)                   │
│   3. Optional: Budget-Limit                                                 │
│   4. "Deck generieren" → AI arbeitet                                       │
│   5. Generiertes Deck reviewen                                              │
│   6. Anpassen (Karten austauschen)                                         │
│   7. Speichern                                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Purchase Recommendations Flow (C2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLOW: KAUFEMPFEHLUNGEN                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │  Deck        │────►│  "Upgrade    │────►│  Upgrade     │               │
│   │  Detail      │     │   anzeigen"  │     │  List        │               │
│   └──────────────┘     └──────────────┘     └──────┬───────┘               │
│                                                     │                       │
│         ODER                                        ▼                       │
│                                              ┌──────────────┐               │
│   ┌──────────────┐                           │  Card        │               │
│   │  Empfehlungen│───────────────────────────│  Comparison  │               │
│   │  Hub         │                           │  + Preise    │               │
│   └──────────────┘                           └──────────────┘               │
│                                                                             │
│   Upgrade List zeigt:                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Karte              Ersetzt        Verbesserung   Preis         │      │
│   │  ──────────────────────────────────────────────────────────────  │      │
│   │  Lightning Bolt     Shock          +Damage        €2.50         │      │
│   │  Counterspell       Cancel         -Mana Cost     €1.80         │      │
│   │  Sol Ring           —              +Ramp          €3.20         │      │
│   │                                                                 │      │
│   │  [Budget-Alternativen anzeigen]                                 │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Banlist Monitor Flow (C4)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLOW: BANLIST MONITORING                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   TRIGGER: Neue Banlist-Änderung                                           │
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │  Dashboard   │────►│  🔔 Alert    │────►│  Banlist     │               │
│   │  (Home)      │     │  Notification│     │  Detail      │               │
│   └──────────────┘     └──────────────┘     └──────┬───────┘               │
│                                                     │                       │
│                                                     ▼                       │
│                                              ┌──────────────┐               │
│                                              │  Betroffene  │               │
│                                              │  Decks       │               │
│                                              └──────┬───────┘               │
│                                                     │                       │
│                                                     ▼                       │
│                                              ┌──────────────┐               │
│                                              │  Replacement │               │
│                                              │  Suggestions │               │
│                                              └──────────────┘               │
│                                                                             │
│   Banlist Detail zeigt:                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ⛔ BANNED: Oko, Thief of Crowns                                │      │
│   │  Format: Standard                                                │      │
│   │  Datum: 2025-12-01                                               │      │
│   │                                                                  │      │
│   │  Betroffene Decks (2):                                           │      │
│   │  • Simic Food → [Alternativen anzeigen]                         │      │
│   │  • Bant Midrange → [Alternativen anzeigen]                      │      │
│   │                                                                  │      │
│   │  Ersatz-Vorschläge aus deiner Collection:                        │      │
│   │  • Nissa, Who Shakes the World                                  │      │
│   │  • Hydroid Krasis                                                │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Navigation Patterns

### 4.1 Primäre Navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NAVIGATION PATTERNS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   DESKTOP (>1024px)                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ┌──────┐  ┌──────┐  ┌─────────┐  ┌─────────┐  ┌──┐ ┌──┐       │      │
│   │  │ Logo │  │ Home │  │ 🎮 Arena│  │ 🃏 Paper│  │🔔│ │⚙️│       │      │
│   │  └──────┘  └──────┘  └─────────┘  └─────────┘  └──┘ └──┘       │      │
│   │  ═══════════════════════════════════════════════════════════    │      │
│   │  Sekundär: [Collection]  [Decks]  [Empfehlungen]  [Import]      │      │
│   │  ───────────────────────────────────────────────────────────    │      │
│   │                                                                 │      │
│   │                      [ CONTENT AREA ]                           │      │
│   │                                                                 │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   MOBILE (<768px)                                                           │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ┌──────────────────────────────────────────────────────┐      │      │
│   │  │  ☰  MTGA Collector    [🎮 Arena ▼]             🔔   │      │      │
│   │  └──────────────────────────────────────────────────────┘      │      │
│   │                                                                 │      │
│   │                      [ CONTENT AREA ]                           │      │
│   │                                                                 │      │
│   │  ┌──────────────────────────────────────────────────────┐      │      │
│   │  │  🏠      📚       🃏      💡       📥                │      │      │
│   │  │ Home  Collect   Decks   Recs    Import              │      │      │
│   │  └──────────────────────────────────────────────────────┘      │      │
│   │                                                                 │      │
│   │  ↑ Bottom Nav passt sich an: Arena oder Paper Kontext          │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Sekundäre Navigation (innerhalb Arena/Paper)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│   ARENA - SEKUNDÄRE NAVIGATION                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  🎮 Arena                                                        │      │
│   │  ──────────────────────────────────────────────────────────────  │      │
│   │  [Collection]  [Decks]  [Empfehlungen]  [Import]                │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   Collection Tabs:                                                          │
│   • Alle Karten      → Vollständige Arena-Collection                       │
│   • Kürzlich         → Letzte 7 Tage hinzugefügt                           │
│   • Duplikate        → >4 Kopien                                           │
│   • Ungenutzt        → In keinem Deck verwendet                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│   PAPER - SEKUNDÄRE NAVIGATION                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  🃏 Paper                                                        │      │
│   │  ──────────────────────────────────────────────────────────────  │      │
│   │  [Collection]  [Decks]  [Empfehlungen]  [Import]                │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   Collection Tabs (erweitert):                                              │
│   • Alle Karten      → Vollständige Paper-Collection                       │
│   • Originale        → Nur echte Karten                                    │
│   • Proxies          → Nur Proxy-Karten                                    │
│   • Kürzlich         → Letzte 7 Tage hinzugefügt                           │
│   • Ungenutzt        → In keinem Deck verwendet                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. URL-Struktur

### Globale Routes

| Screen | URL | Beschreibung |
|--------|-----|--------------|
| Dashboard | `/` | Home, Übersicht beider Welten |
| Settings | `/settings` | Einstellungen |

### Arena Routes (MVP)

| Screen | URL | Beschreibung |
|--------|-----|--------------|
| Arena Home | `/arena` | Arena Übersicht |
| Collection | `/arena/collection` | Arena-Karten browsen |
| Collection Filter | `/arena/collection?color=U&cmc=3` | Mit Filtern |
| Card Detail | `/arena/collection/:cardId` | Einzelne Karte |
| Import | `/arena/import` | Screenshots hochladen |
| Deck List | `/arena/decks` | Arena Decks |
| Deck Detail | `/arena/decks/:deckId` | Ein Deck anzeigen |
| Deck Edit | `/arena/decks/:deckId/edit` | Deck bearbeiten |
| AI Builder | `/arena/decks/ai-builder` | AI Deck Generator |
| Empfehlungen | `/arena/recommendations` | Upgrades & Alerts |
| Banlist | `/arena/bans` | Ban-Monitoring |

### Paper Routes (Phase 2)

| Screen | URL | Beschreibung |
|--------|-----|--------------|
| Paper Home | `/paper` | Paper Übersicht |
| Collection | `/paper/collection` | Paper-Karten browsen |
| Collection Filter | `/paper/collection?type=proxy` | Mit Filtern |
| Card Detail | `/paper/collection/:cardId` | Einzelne Karte |
| Import | `/paper/import` | Karten hinzufügen |
| Import Mode | `/paper/import?mode=precon` | Spezifischer Modus |
| Deck List | `/paper/decks` | Paper Decks |
| Deck Detail | `/paper/decks/:deckId` | Ein Deck anzeigen |
| AI Builder | `/paper/decks/ai-builder` | AI Deck Generator |
| Empfehlungen | `/paper/recommendations` | Kaufempfehlungen |
| Banlist | `/paper/bans` | Ban-Monitoring |

---

## 6. Modals vs. Pages

| Aktion | Typ | Begründung |
|--------|-----|------------|
| Card Detail | **Modal** | Schnell schließen, zurück zur Liste |
| Filter Panel | **Side Panel** | Bleibt offen während Browsen |
| Import Process | **Page** | Multi-Step, braucht Fokus |
| AI Builder | **Page** | Wizard, mehrere Schritte |
| Deck Edit | **Page** | Komplexe Interaktion |
| Settings | **Page** | Eigener Bereich |
| Notifications | **Dropdown** | Quick-Access |
| Confirm Delete | **Modal** | Kurze Bestätigung |

---

## 7. Nächste Schritte

- [ ] Wireframes für Hauptscreens erstellen
- [ ] Datenmodell definieren
- [ ] Component Library planen
