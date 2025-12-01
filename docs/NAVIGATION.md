# Navigation & Informationsarchitektur

> **Status**: Draft
> **Erstellt**: 2025-12-01
> **Basiert auf**: MVP-Scope (5 Use Cases)

---

## 1. Hauptnavigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HAUPTNAVIGATION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  🏠 Home    📚 Collection    🃏 Decks    💡 Empfehlungen    ⚙️   │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   5 Hauptbereiche:                                                          │
│                                                                             │
│   1. HOME (Dashboard)                                                       │
│      → Übersicht, Quick Actions, Notifications                             │
│                                                                             │
│   2. COLLECTION                                                             │
│      → Browse, Search, Filter, Import                                       │
│                                                                             │
│   3. DECKS                                                                  │
│      → Meine Decks, AI Deck-Builder, Deck-Details                          │
│                                                                             │
│   4. EMPFEHLUNGEN                                                           │
│      → Kaufempfehlungen, Banlist-Alerts, Upgrades                          │
│                                                                             │
│   5. SETTINGS (Icon)                                                        │
│      → Konfiguration, Import-Settings, Account                             │
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
│   ├── Dashboard                        [/]                                  │
│   │   ├── Collection Stats                                                  │
│   │   ├── Recent Activity                                                   │
│   │   ├── Notifications (Bans, Empfehlungen)                               │
│   │   └── Quick Actions                                                     │
│   │                                                                         │
│   COLLECTION                                                                │
│   ├── Collection Browser               [/collection]                        │
│   │   ├── Grid View                                                         │
│   │   ├── List View                                                         │
│   │   ├── Filter Panel                                                      │
│   │   └── Search Bar                                                        │
│   ├── Card Detail                      [/collection/:cardId]                │
│   │   ├── Card Image                                                        │
│   │   ├── Card Info (Scryfall)                                             │
│   │   ├── Ownership (Arena/Paper, Anzahl)                                  │
│   │   ├── In Decks verwendet                                               │
│   │   └── Preis-Info                                                        │
│   └── Import                           [/collection/import]                 │
│       ├── Screenshot Upload                                                 │
│       ├── OCR Processing                                                    │
│       └── Review & Confirm                                                  │
│                                                                             │
│   DECKS                                                                     │
│   ├── Deck List                        [/decks]                             │
│   │   ├── Meine Decks (Grid/List)                                          │
│   │   └── + Neues Deck                                                      │
│   ├── Deck Detail                      [/decks/:deckId]                     │
│   │   ├── Deck Stats (Mana Curve, Colors)                                  │
│   │   ├── Card List                                                         │
│   │   ├── Legality Check                                                    │
│   │   ├── Upgrade Suggestions                                               │
│   │   └── Export Options                                                    │
│   ├── Deck Builder                     [/decks/new]                         │
│   │   ├── Commander/Combo Auswahl                                          │
│   │   ├── Format Auswahl                                                    │
│   │   ├── AI Generate Button                                               │
│   │   └── Manual Edit Mode                                                  │
│   └── AI Builder                       [/decks/ai-builder]                  │
│       ├── Input (Commander/Combo)                                          │
│       ├── Constraints (Format, Budget)                                      │
│       ├── Generate                                                          │
│       └── Review Generated Deck                                             │
│                                                                             │
│   EMPFEHLUNGEN                                                              │
│   ├── Upgrade Hub                      [/recommendations]                   │
│   │   ├── Kaufempfehlungen                                                  │
│   │   ├── Banlist Alerts                                                    │
│   │   └── Deck Improvements                                                 │
│   ├── Purchase Recommendations         [/recommendations/buy]               │
│   │   ├── Top Upgrades (alle Decks)                                        │
│   │   ├── Filter by Deck                                                    │
│   │   ├── Price Comparison                                                  │
│   │   └── Budget Alternatives                                               │
│   └── Banlist Monitor                  [/recommendations/bans]              │
│       ├── Recent Bans                                                       │
│       ├── Affected Decks                                                    │
│       └── Replacement Suggestions                                           │
│                                                                             │
│   SETTINGS                                                                  │
│   └── Settings                         [/settings]                          │
│       ├── Import Settings                                                   │
│       ├── OCR Calibration                                                   │
│       ├── API Keys                                                          │
│       └── Account                                                           │
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
│   │  ┌──────┐ ┌────────────┐ ┌───────┐ ┌─────────────┐ ┌──┐        │      │
│   │  │ Logo │ │ Collection │ │ Decks │ │ Empfehlungen│ │⚙️│        │      │
│   │  └──────┘ └────────────┘ └───────┘ └─────────────┘ └──┘        │      │
│   │  ═══════════════════════════════════════════════════════════    │      │
│   │                                                                 │      │
│   │                      [ CONTENT AREA ]                           │      │
│   │                                                                 │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   MOBILE (<768px)                                                           │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ┌──────────────────────────────────────────────────────┐      │      │
│   │  │  ☰  MTGA Collector                              🔔   │      │      │
│   │  └──────────────────────────────────────────────────────┘      │      │
│   │                                                                 │      │
│   │                      [ CONTENT AREA ]                           │      │
│   │                                                                 │      │
│   │  ┌──────────────────────────────────────────────────────┐      │      │
│   │  │  🏠      📚      🃏      💡      ⚙️                   │      │      │
│   │  │ Home  Collect  Decks  Recs   Settings               │      │      │
│   │  └──────────────────────────────────────────────────────┘      │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Sekundäre Navigation (Beispiel: Collection)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│   COLLECTION - SEKUNDÄRE NAVIGATION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Collection                                                      │      │
│   │  ──────────────────────────────────────────────────────────────  │      │
│   │  [Alle Karten]  [Kürzlich]  [Duplikate]  [Ungenutzt]  [Import]  │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   Tabs/Sections:                                                            │
│   • Alle Karten      → Vollständige Collection                             │
│   • Kürzlich         → Letzte 7 Tage hinzugefügt                           │
│   • Duplikate        → >4 Kopien (Trade-Kandidaten)                        │
│   • Ungenutzt        → In keinem Deck verwendet                            │
│   • Import           → Neue Karten hinzufügen                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. URL-Struktur

| Screen | URL | Beschreibung |
|--------|-----|--------------|
| Dashboard | `/` | Home, Übersicht |
| Collection | `/collection` | Alle Karten browsen |
| Collection Filter | `/collection?color=U&cmc=3` | Mit Filtern |
| Card Detail | `/collection/cards/:cardId` | Einzelne Karte |
| Import | `/collection/import` | Screenshots hochladen |
| Deck List | `/decks` | Alle Decks |
| Deck Detail | `/decks/:deckId` | Ein Deck anzeigen |
| Deck Edit | `/decks/:deckId/edit` | Deck bearbeiten |
| New Deck | `/decks/new` | Neues Deck (manuell) |
| AI Builder | `/decks/ai-builder` | AI Deck Generator |
| Recommendations | `/recommendations` | Übersicht |
| Buy Suggestions | `/recommendations/buy` | Kaufempfehlungen |
| Banlist | `/recommendations/bans` | Ban-Monitoring |
| Settings | `/settings` | Einstellungen |

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
