# Datenmodell

> **Status**: Draft
> **Erstellt**: 2025-12-02
> **Basiert auf**: Use Case Discovery, Navigation

---

## 1. Domänenübersicht

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOMÄNEN-ARCHITEKTUR                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │   SCRYFALL          │                              │
│                        │   (Externe Quelle)  │                              │
│                        │   Card Master Data  │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
│                                   ▼                                         │
│                        ┌─────────────────────┐                              │
│                        │       Card          │                              │
│                        │   (Referenzdaten)   │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
│              ┌────────────────────┼────────────────────┐                    │
│              │                    │                    │                    │
│              ▼                    │                    ▼                    │
│   ┌─────────────────────┐        │         ┌─────────────────────┐         │
│   │   🎮 ARENA DOMAIN   │        │         │   🃏 PAPER DOMAIN   │         │
│   ├─────────────────────┤        │         ├─────────────────────┤         │
│   │                     │        │         │                     │         │
│   │  ArenaCollection    │        │         │  PaperCollection    │         │
│   │  └── ArenaCard      │        │         │  ├── OriginalCard   │         │
│   │                     │        │         │  └── ProxyCard      │         │
│   │  ArenaDeck          │        │         │                     │         │
│   │  └── nur Arena-     │        │         │  PaperDeck          │         │
│   │      Karten         │        │         │  └── Original +     │         │
│   │                     │        │         │      Proxy gemischt │         │
│   │  Formate:           │        │         │                     │         │
│   │  Standard, Historic │        │         │  Formate:           │         │
│   │  Explorer, Brawl    │        │         │  Commander, Modern  │         │
│   │                     │        │         │  Legacy, Pioneer    │         │
│   └─────────────────────┘        │         └─────────────────────┘         │
│                                  │                                          │
│                                  ▼                                          │
│                        ┌─────────────────────┐                              │
│                        │   SHARED SERVICES   │                              │
│                        ├─────────────────────┤                              │
│                        │  • Banlist          │                              │
│                        │  • Price Data       │                              │
│                        │  • AI Deck Builder  │                              │
│                        │  • Format Rules     │                              │
│                        └─────────────────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Kern-Entitäten

### 2.1 Card (Scryfall-Referenz)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CARD (Scryfall Master Data)                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Identifikation:                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  scryfallId      : string      // Scryfall UUID (Primary Key)   │       │
│  │  oracleId        : string      // Oracle ID (für Reprints)      │       │
│  │  name            : string      // Kartenname (English)          │       │
│  │  printedName     : string?     // Lokalisierter Name            │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Spielrelevant:                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  manaCost        : string      // "{2}{U}{U}"                   │       │
│  │  cmc             : number      // Converted Mana Cost           │       │
│  │  colors          : Color[]     // ["U", "W"]                    │       │
│  │  colorIdentity   : Color[]     // Für Commander                 │       │
│  │  type            : string      // "Creature — Elf Warrior"      │       │
│  │  typeLine        : string[]    // ["Creature", "Elf", "Warrior"]│       │
│  │  oracleText      : string      // Regeltext                     │       │
│  │  keywords        : string[]    // ["Flying", "Vigilance"]       │       │
│  │  power           : string?     // "3" oder "*"                  │       │
│  │  toughness       : string?     // "4" oder "*"                  │       │
│  │  loyalty         : string?     // Für Planeswalker              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Metadaten:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  set             : string      // "MKM" (Set Code)              │       │
│  │  setName         : string      // "Murders at Karlov Manor"     │       │
│  │  collectorNumber : string      // "123"                         │       │
│  │  rarity          : Rarity      // common|uncommon|rare|mythic   │       │
│  │  artist          : string      // Künstlername                  │       │
│  │  releasedAt      : Date        // Set Release Date              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Bilder:                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  imageUris       : {                                            │       │
│  │    small         : string      // 146x204                       │       │
│  │    normal        : string      // 488x680                       │       │
│  │    large         : string      // 672x936                       │       │
│  │    artCrop       : string      // Nur Artwork                   │       │
│  │  }                                                              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Legalität:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  legalities      : {                                            │       │
│  │    standard      : LegalStatus  // legal|not_legal|banned       │       │
│  │    historic      : LegalStatus                                  │       │
│  │    explorer      : LegalStatus                                  │       │
│  │    pioneer       : LegalStatus                                  │       │
│  │    modern        : LegalStatus                                  │       │
│  │    legacy        : LegalStatus                                  │       │
│  │    vintage       : LegalStatus                                  │       │
│  │    commander     : LegalStatus                                  │       │
│  │  }                                                              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Preise (von Scryfall):                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  prices          : {                                            │       │
│  │    usd           : number?     // Paper USD                     │       │
│  │    eur           : number?     // Paper EUR                     │       │
│  │    tix           : number?     // MTGO Tickets                  │       │
│  │  }                                                              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 ArenaCollection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ARENA COLLECTION                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ArenaCollectionEntry:                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  id              : string      // UUID                          │       │
│  │  oderId          : string      // User ID (für Multi-User)     │       │
│  │  scryfallId      : string      // FK → Card                     │       │
│  │  quantity        : number      // 1-4 (oder ∞ für Basic Lands)  │       │
│  │  addedAt         : Date        // Wann hinzugefügt              │       │
│  │  source          : ImportSource // screenshot|log|manual        │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Besonderheiten Arena:                                                      │
│  • Keine Original/Proxy Unterscheidung                                     │
│  • Max 4 Kopien (außer Basic Lands = ∞)                                    │
│  • Quelle: Screenshot-OCR oder Log-Parsing                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 PaperCollection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PAPER COLLECTION                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PaperCollectionEntry:                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  id              : string      // UUID                          │       │
│  │  ownerId         : string      // User ID                       │       │
│  │  scryfallId      : string      // FK → Card                     │       │
│  │  quantityOriginal: number      // Anzahl echter Karten          │       │
│  │  quantityProxy   : number      // Anzahl Proxy-Karten           │       │
│  │  addedAt         : Date        // Wann hinzugefügt              │       │
│  │  source          : ImportSource // precon|manual|camera|bulk    │       │
│  │  condition       : Condition?  // NM|LP|MP|HP|DMG (optional)    │       │
│  │  notes           : string?     // Freitext-Notizen              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Besonderheiten Paper:                                                      │
│  • Original + Proxy getrennt gezählt                                       │
│  • Turnierfähigkeit = nur Originale zählen                                 │
│  • Optionale Zustandsbewertung (für Sammelwert)                            │
│  • 4 Import-Methoden: Precon, Manual, Camera, Bulk                         │
│                                                                             │
│  ImportSource Enum:                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  precon   // Fertiges Produkt (Commander Precon, etc.)          │       │
│  │  manual   // Manuell eingetippt                                 │       │
│  │  camera   // Handy-Kamera Scan                                  │       │
│  │  bulk     // Bulk-Scanner                                       │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Deck

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DECK                                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Basis-Attribute:                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  id              : string      // UUID                          │       │
│  │  ownerId         : string      // User ID                       │       │
│  │  name            : string      // "Gruul Aggro"                 │       │
│  │  domain          : Domain      // arena | paper                 │       │
│  │  format          : Format      // standard|historic|commander   │       │
│  │  createdAt       : Date                                         │       │
│  │  updatedAt       : Date                                         │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Visualisierung (F16):                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  colors          : Color[]     // Berechnete Farben ["R", "G"]  │       │
│  │  colorDistribution: {          // Prozentuale Verteilung        │       │
│  │    W: number, U: number, B: number, R: number, G: number, C: number     │
│  │  }                                                              │       │
│  │  archetypes      : Archetype[] // ["Aggro", "Midrange"]         │       │
│  │  coverImage      : CoverImage  // Titelbild-Konfiguration       │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Commander-spezifisch (optional):                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  commander       : string?     // scryfallId des Commanders     │       │
│  │  partner         : string?     // scryfallId des Partners       │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Deck-Inhalt:                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  mainboard       : DeckCard[]  // Hauptdeck                     │       │
│  │  sideboard       : DeckCard[]  // Sideboard (15 Karten)         │       │
│  │  maybeboard      : DeckCard[]  // Optionale Karten              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Statistiken (berechnet):                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  cardCount       : number      // Gesamtzahl Karten             │       │
│  │  manaCurve       : number[]    // [0, 4, 12, 8, 6, 4, 2, 1]     │       │
│  │  averageCmc      : number      // Durchschnittliche CMC         │       │
│  │  landCount       : number      // Anzahl Länder                 │       │
│  │  creatureCount   : number      // Anzahl Kreaturen              │       │
│  │  isLegal         : boolean     // Format-legal?                 │       │
│  │  legalityIssues  : string[]    // ["Banned: Oko"]               │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Paper-spezifisch (wenn domain = paper):                                   │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  originalCount   : number      // Anzahl Original-Karten        │       │
│  │  proxyCount      : number      // Anzahl Proxy-Karten           │       │
│  │  isTournamentLegal: boolean    // 100% Originale?               │       │
│  │  estimatedValue  : number?     // Geschätzter Wert (EUR)        │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.5 DeckCard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DECK CARD (Karte im Deck)                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DeckCard:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  scryfallId      : string      // FK → Card                     │       │
│  │  quantity        : number      // Anzahl im Deck                │       │
│  │  isProxy         : boolean     // Paper only: ist Proxy?        │       │
│  │  category        : Category?   // Manuell: "Removal", "Ramp"    │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Category Enum (für Deck-Organisation):                                     │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  commander    // Der Commander                                  │       │
│  │  creature     // Kreaturen                                      │       │
│  │  instant      // Instants                                       │       │
│  │  sorcery      // Sorceries                                      │       │
│  │  artifact     // Artefakte                                      │       │
│  │  enchantment  // Enchantments                                   │       │
│  │  planeswalker // Planeswalker                                   │       │
│  │  land         // Länder                                         │       │
│  │  // Oder funktional:                                            │       │
│  │  ramp         // Mana-Beschleunigung                            │       │
│  │  draw         // Karten ziehen                                  │       │
│  │  removal      // Gegner-Karten entfernen                        │       │
│  │  protection   // Eigene Karten schützen                         │       │
│  │  wincon       // Win Condition                                  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.6 CoverImage (Deck-Titelbild)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COVER IMAGE                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CoverImage:                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  type            : CoverType   // auto | card | generated       │       │
│  │  cardId          : string?     // scryfallId wenn type=card     │       │
│  │  generatedUrl    : string?     // URL wenn type=generated       │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  CoverType Logik:                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  auto:                                                          │       │
│  │  ├── Commander-Deck → Commander-Karte                          │       │
│  │  └── Andere → Karte mit höchster CMC & Mythic/Rare             │       │
│  │                                                                 │       │
│  │  card:                                                          │       │
│  │  └── Manuell gewählte "Feature Card"                           │       │
│  │                                                                 │       │
│  │  generated:                                                     │       │
│  │  └── KI-generiertes Bild basierend auf:                        │       │
│  │      • Deck-Farben (WUBRG)                                     │       │
│  │      • Archetypen                                               │       │
│  │      • MTG Art Style                                            │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.7 Archetype (Deck-Strategie)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ARCHETYPE                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Archetype Enum:                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  aggro       // Schnelle Kreaturen, niedrige Kurve              │       │
│  │  control     // Counter, Removal, wenig Kreaturen               │       │
│  │  midrange    // Ausgewogene Kurve, Value-Karten                 │       │
│  │  combo       // Spezifische Win-Condition Kombination           │       │
│  │  ramp        // Mana-Beschleunigung, große Kreaturen            │       │
│  │  tribal      // Fokus auf Kreaturentyp                          │       │
│  │  tokens      // Token-Generierung + Verstärkung                 │       │
│  │  reanimator  // Friedhof-Strategien                             │       │
│  │  mill        // Gegner decken                                   │       │
│  │  burn        // Direkter Schaden                                │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Erkennung (automatisch oder manuell):                                      │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  Aggro:                                                         │       │
│  │  └── Ø CMC < 2.5 && Creature Count > 20                        │       │
│  │                                                                 │       │
│  │  Control:                                                       │       │
│  │  └── Counter Spells > 6 && Board Wipes > 2                     │       │
│  │                                                                 │       │
│  │  Tribal:                                                        │       │
│  │  └── >50% Kreaturen teilen einen Typ (Elf, Goblin, etc.)       │       │
│  │                                                                 │       │
│  │  Mill:                                                          │       │
│  │  └── Keywords: "mill", "cards from library into graveyard"     │       │
│  │                                                                 │       │
│  │  etc.                                                           │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Enums & Types

```typescript
// Farben
type Color = "W" | "U" | "B" | "R" | "G" | "C";

// Seltenheit
type Rarity = "common" | "uncommon" | "rare" | "mythic";

// Legalitätsstatus
type LegalStatus = "legal" | "not_legal" | "banned" | "restricted";

// Domäne
type Domain = "arena" | "paper";

// Format
type Format =
  // Arena
  | "standard" | "historic" | "explorer" | "brawl" | "alchemy"
  // Paper
  | "commander" | "modern" | "legacy" | "vintage" | "pioneer" | "pauper";

// Kartenzustand (Paper)
type Condition = "NM" | "LP" | "MP" | "HP" | "DMG";

// Import-Quelle
type ImportSource =
  // Arena
  | "screenshot" | "log" | "manual"
  // Paper
  | "precon" | "camera" | "bulk";

// Deck Archetypen
type Archetype =
  | "aggro" | "control" | "midrange" | "combo"
  | "ramp" | "tribal" | "tokens" | "reanimator"
  | "mill" | "burn";

// Cover Image Type
type CoverType = "auto" | "card" | "generated";
```

---

## 4. Beziehungen (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIP DIAGRAM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                           ┌──────────────────┐                              │
│                           │      User        │                              │
│                           │──────────────────│                              │
│                           │ id               │                              │
│                           │ email            │                              │
│                           │ settings         │                              │
│                           └────────┬─────────┘                              │
│                                    │                                        │
│                      ┌─────────────┼─────────────┐                          │
│                      │             │             │                          │
│                      ▼             │             ▼                          │
│          ┌──────────────────┐      │   ┌──────────────────┐                 │
│          │ ArenaCollection  │      │   │ PaperCollection  │                 │
│          │──────────────────│      │   │──────────────────│                 │
│          │ ownerId (FK)     │      │   │ ownerId (FK)     │                 │
│          │ scryfallId (FK)  │──┐   │   │ scryfallId (FK)  │──┐              │
│          │ quantity         │  │   │   │ quantityOriginal │  │              │
│          │ addedAt          │  │   │   │ quantityProxy    │  │              │
│          └──────────────────┘  │   │   └──────────────────┘  │              │
│                                │   │                         │              │
│                                │   │                         │              │
│                                ▼   │                         ▼              │
│                         ┌──────────┴─────────┐                              │
│                         │       Card         │                              │
│                         │────────────────────│                              │
│                         │ scryfallId (PK)    │                              │
│                         │ name, manaCost,    │                              │
│                         │ colors, type, ...  │                              │
│                         └────────────────────┘                              │
│                                    ▲                                        │
│                                    │                                        │
│                      ┌─────────────┴─────────────┐                          │
│                      │                           │                          │
│          ┌──────────────────┐         ┌──────────────────┐                  │
│          │     DeckCard     │         │     DeckCard     │                  │
│          │  (Arena Deck)    │         │  (Paper Deck)    │                  │
│          │──────────────────│         │──────────────────│                  │
│          │ scryfallId (FK)  │         │ scryfallId (FK)  │                  │
│          │ quantity         │         │ quantity         │                  │
│          │                  │         │ isProxy          │                  │
│          └────────┬─────────┘         └────────┬─────────┘                  │
│                   │                            │                            │
│                   ▼                            ▼                            │
│          ┌──────────────────┐         ┌──────────────────┐                  │
│          │    ArenaDeck     │         │    PaperDeck     │                  │
│          │──────────────────│         │──────────────────│                  │
│          │ ownerId (FK)     │         │ ownerId (FK)     │                  │
│          │ name, format     │         │ name, format     │                  │
│          │ colors           │         │ colors           │                  │
│          │ archetypes       │         │ archetypes       │                  │
│          │ coverImage       │         │ coverImage       │                  │
│          │ mainboard[]      │         │ mainboard[]      │                  │
│          │ sideboard[]      │         │ sideboard[]      │                  │
│          │ commander?       │         │ commander?       │                  │
│          │                  │         │ originalCount    │                  │
│          │                  │         │ proxyCount       │                  │
│          └──────────────────┘         └──────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Berechnete Felder

### Deck-Farben (automatisch)

```typescript
function calculateDeckColors(cards: DeckCard[]): Color[] {
  const colorSet = new Set<Color>();
  for (const deckCard of cards) {
    const card = getCard(deckCard.scryfallId);
    for (const color of card.colors) {
      colorSet.add(color);
    }
  }
  return Array.from(colorSet);
}
```

### Farb-Verteilung (für Pie Chart)

```typescript
function calculateColorDistribution(cards: DeckCard[]): ColorDistribution {
  const counts = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  let total = 0;

  for (const deckCard of cards) {
    const card = getCard(deckCard.scryfallId);
    // Zähle Mana-Symbole in manaCost
    for (const symbol of parseManaCost(card.manaCost)) {
      if (symbol in counts) {
        counts[symbol] += deckCard.quantity;
        total += deckCard.quantity;
      }
    }
  }

  // Normalisieren auf Prozent
  return Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, v / total * 100])
  );
}
```

### Archetype-Erkennung (heuristisch)

```typescript
function detectArchetypes(deck: Deck): Archetype[] {
  const archetypes: Archetype[] = [];

  // Aggro: niedrige Kurve + viele Kreaturen
  if (deck.averageCmc < 2.5 && deck.creatureCount > 20) {
    archetypes.push("aggro");
  }

  // Tribal: >50% Kreaturen teilen Typ
  const creatureTypes = countCreatureTypes(deck);
  const dominantType = getMostCommon(creatureTypes);
  if (dominantType.count / deck.creatureCount > 0.5) {
    archetypes.push("tribal");
  }

  // Mill: Keywords enthalten "mill"
  if (hasKeywordInDeck(deck, "mill")) {
    archetypes.push("mill");
  }

  // ... weitere Heuristiken

  return archetypes;
}
```

---

## 6. Nächste Schritte

- [ ] API-Endpunkte definieren
- [ ] Datenbankschema erstellen (Supabase)
- [ ] Scryfall-Sync implementieren
- [ ] Archetype-Erkennung verfeinern
