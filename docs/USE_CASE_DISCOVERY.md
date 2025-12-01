# Use Case Discovery - MTGA Collector

> **Status**: In Arbeit
> **Zuletzt aktualisiert**: 2025-11-30
> **Methodik**: Stakeholder-Interview, User Story Mapping

---

## 1. Stakeholder Map

```
                    ┌─────────────────────────────────────┐
                    │         MTGA Collector              │
                    │         Stakeholder Map             │
                    └─────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │   PRIMÄR      │       │   SEKUNDÄR    │       │   TERTIÄR     │
    │               │       │               │       │               │
    │ ? Direkte     │       │ ? Indirekte   │       │ ? Externe     │
    │   Nutzer      │       │   Nutzer      │       │   Partner     │
    └───────────────┘       └───────────────┘       └───────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │ • Competitive │       │ • Content     │       │ • Scryfall    │
    │   Player      │       │   Creators?   │       │   API         │
    │ • Casual      │       │ • Coaches?    │       │ • MTGGoldfish │
    │   Brewer      │       │ • Community   │       │ • MTGA selbst │
    │ • Collection  │       │   Manager?    │       │               │
    │   Manager     │       │               │       │               │
    └───────────────┘       └───────────────┘       └───────────────┘
```

**Offene Fragen:**
- [ ] Wer sind die tatsächlichen primären Nutzer?
- [ ] Gibt es sekundäre Stakeholder (Content Creator, Coaches)?
- [ ] Welche externen Systeme/Partner sind relevant?

---

## 2. Aktuelle Personas (aus PRODUCT_VISION.md)

| Persona | Nutzungsanteil | Ziel | Hauptschmerz |
|---------|----------------|------|--------------|
| **Competitive Player** | 80% | Meta-Decks schnell bauen | Weiß nicht welche Meta-Decks baubar sind |
| **Casual Brewer** | 15% | Kreative Deck-Ideen | Synergien schwer zu entdecken |
| **Collection Manager** | 5% | Sammlung aktuell halten | Aktualisierung unterbricht Workflow |

**Zu validieren:**
- [ ] Stimmen diese Anteile mit der Realität überein?
- [ ] Fehlen weitere relevante Personas?
- [ ] Sind die Schmerzpunkte korrekt identifiziert?

---

## 3. Discovery-Fragen (Interview-Leitfaden)

### 3.1 Kontext & Motivation
- Warum wurde dieses Projekt gestartet?
- Welches Problem löst es für dich persönlich?
- Wer soll die App primär nutzen?

### 3.2 User Journey
- Wie sieht ein typischer Nutzungstag aus?
- Wann und wo wird die App genutzt?
- Welche Geräte werden verwendet?

### 3.3 Schmerzpunkte
- Was ist der größte Frust mit aktuellen Lösungen?
- Welche Aufgaben dauern zu lange?
- Was fehlt komplett?

### 3.4 Erfolgskriterien
- Woran erkennst du, dass die App erfolgreich ist?
- Welche Metriken sind wichtig?
- Was wäre das Minimum Viable Product?

### 3.5 Priorisierung
- Welche 3 Features sind unverzichtbar?
- Was ist "nice to have"?
- Was würdest du explizit weglassen?

---

## 4. Interview-Protokoll

### Session 1 - [Datum: 2025-11-30]

**F1: Was war der ursprüngliche Auslöser für dieses Projekt?**

> "Ich löse in erster Linie ein eigenes Problem. Ich spiele MTG Arena und spiele
> daneben auch mit Paper Cards. Das Problem ist, dass ich die Karten, ob virtuell
> oder Paper gerne verwalten möchte. Die Verwaltung ist dabei nur ein Mittel zum
> Zweck. Es geht mir eigentlich darum mit den Card Collections (virtuell und Paper)
> optimale aber legale Decks zu bauen. Die Collections verändern sich zudem laufend.
> Neue Karten kommen hinzu und gewisse werden entweder generell oder nur in
> spezifischen Formaten gebanned."

**F4: Wie verwaltest du heute deine Paper Cards?**

> "Sie sind noch nicht verwaltet. Ich habe Deckboxen in denen sie zu Decks
> zusammengestellt sind. Ich spiele physisch hauptsächlich das Commander Format.
> Dazu habe ich ein paar Precon Sets gekauft. In der Zwischenzeit habe ich
> angefangen Proxykarten zu drucken. Dazu habe ich teilweise Decklists aus dem
> Internet heruntergeladen und angepasst. In der Verwaltung wäre es wichtig die
> Originale von den Proxies unterscheiden zu können."

**F5: Welche Formate spielst du aktiv?**

> "Ich kenne mich mit den Formaten noch nicht gut aus. Ich glaube Standard und
> Historic. Irgendein Draft-Format habe ich auch schon ausprobiert. Im Moment
> versuche ich in Arena noch darauf zu verzichten Geld auszugeben. Das schränkt
> die Formate schon etwas ein. Das muss aber nicht so bleiben."

**F6: Wie ist die Aufteilung zwischen Arena und Paper?**

> "Das hängt etwas von den Gelegenheiten ab Paper zu spielen. Aber realistisch
> ist wohl 80/20."

**F7: Was ist deine größte Frustration beim Deck-Building?**

> "Ich möchte gerne mit den Karten aus der Collection ein optimales Deck bauen.
> Als Basis sollte eine Commander Karte oder eine Combo von Karten möglich sein.
> Mit AI Unterstützung möchte ich dann beispielsweise die besten gültigen Karten
> finden um schnell die nötigen Mana bekommen oder die Library zu durchsuchen usw.
> Dazu müssen die Abilities, die Synergien aller Karten in der Collection sowie
> die aktuellen Regeln verstanden werden."

**F8: Welche anderen Tools oder Websites nutzt du für MTG?**

> "Ich verwende moxfield.com und archidekt.com um bestehende Decks abzurufen.
> Die URLs kommen meist von YouTube Videos, respektive der Video-Beschreibung."

**F9: Wie sieht dein idealer Workflow aus?**

> "Ich finde eine Karten Combo aus 2 Karten, dann möchte ich damit ein neues Deck
> starten und mir von der KI die dazu passenden Karten aus meiner Kollektion
> zusammenstellen lassen. Das Deck muss legal und optimal sein. Danach möchte ich
> Vorschläge zur Spielweise und Kaufempfehlungen (mit Preisen) für weitere, noch
> bessere Karten Ergänzungen abrufen können."

---

## 5. Erkenntnisse & Hypothesen

### Schlüssel-Erkenntnisse aus Interview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KERN-ERKENNTNIS #1                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   "Verwaltung ist nur Mittel zum Zweck"                                     │
│                                                                             │
│   ┌─────────────────┐         ┌─────────────────────────────────────┐      │
│   │ Collection      │ ──────► │ OPTIMALE + LEGALE Decks bauen       │      │
│   │ Management      │  dient  │ (Das eigentliche Ziel!)             │      │
│   └─────────────────┘         └─────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KERN-ERKENNTNIS #2                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ZWEI Sammlungen - EINE Lösung benötigt                                    │
│                                                                             │
│   ┌─────────────────┐         ┌─────────────────┐                          │
│   │  MTG Arena      │         │  Paper Cards    │                          │
│   │  (Digital)      │         │  (Physisch)     │                          │
│   └────────┬────────┘         └────────┬────────┘                          │
│            │                           │                                    │
│            └───────────┬───────────────┘                                    │
│                        ▼                                                    │
│            ┌─────────────────────┐                                          │
│            │  Unified Collection │  ◄── Aktuell nur Arena unterstützt!     │
│            │  Management         │                                          │
│            └─────────────────────┘                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KERN-ERKENNTNIS #3                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Collections sind DYNAMISCH                                                │
│                                                                             │
│   Änderungstreiber:                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │ + Neue Karten       │ Booster, Drafts, Rewards, Käufe          │      │
│   │ - Banned Karten     │ Generell ODER format-spezifisch          │      │
│   │ ~ Format-Rotation   │ Standard rotiert Sets raus               │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► App muss Legalität pro Format kennen und aktuell halten!             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KERN-ERKENNTNIS #4                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Paper Cards: ORIGINALE vs. PROXIES unterscheiden                         │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                     Paper Collection                            │      │
│   │   ┌───────────────────┐     ┌───────────────────┐              │      │
│   │   │    ORIGINALE      │     │     PROXIES       │              │      │
│   │   │                   │     │                   │              │      │
│   │   │ • Gekaufte Karten │     │ • Gedruckte       │              │      │
│   │   │ • Precon Sets     │     │   Kopien          │              │      │
│   │   │ • Trade/Tausch    │     │ • Für Casual Play │              │      │
│   │   │                   │     │ • Deck-Testing    │              │      │
│   │   │ ► Turnier-legal   │     │ ► NICHT turnier-  │              │      │
│   │   │                   │     │   legal           │              │      │
│   │   └───────────────────┘     └───────────────────┘              │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► Wichtig für: Turnierfähigkeit, Sammlungswert, Kaufplanung            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KERN-ERKENNTNIS #5                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Aktueller Paper-Workflow: DECK-ZENTRIERT (nicht Card-zentriert)          │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  1. Decklist aus Internet laden (z.B. EDHREC, Moxfield)        │      │
│   │                         ▼                                       │      │
│   │  2. Decklist anpassen (Budget, eigene Ideen)                   │      │
│   │                         ▼                                       │      │
│   │  3. Fehlende Karten als Proxies drucken                        │      │
│   │                         ▼                                       │      │
│   │  4. Deck in Deckbox aufbewahren                                │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   Paper-Format: Commander (EDH) - 100 Karten Singleton                     │
│   Quelle: Precon Sets + angepasste Netdecks                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KERN-ERKENNTNIS #6                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FREE-TO-PLAY Constraint in MTG Arena                                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Aktueller Status:                                              │      │
│   │  • Kein Geld ausgeben in Arena (F2P)                           │      │
│   │  • Schränkt verfügbare Karten/Formate ein                      │      │
│   │  • Könnte sich in Zukunft ändern                               │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   Formate (Arena):                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ✓ Standard    │ Hauptformat, rotiert jährlich                 │      │
│   │  ✓ Historic    │ Eternal Format, alle Arena-Karten             │      │
│   │  ? Draft       │ Limited Format, ausprobiert                   │      │
│   │  ? Explorer    │ Pioneer-Äquivalent                            │      │
│   │  ? Brawl       │ Commander-ähnlich (60 Karten)                 │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► F2P macht "optimale Decks aus Collection" NOCH wichtiger!            │
│       (Begrenzte Wildcards = jede Karte zählt)                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KERN-ERKENNTNIS #7 (KERN-FEATURE!)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   AI-GESTÜTZTER DECK-BUILDER mit tiefem MTG-Verständnis                    │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                      WORKFLOW                                   │      │
│   │                                                                 │      │
│   │   ┌─────────────────┐                                          │      │
│   │   │  STARTPUNKT     │                                          │      │
│   │   │  • Commander    │                                          │      │
│   │   │  • Karten-Combo │                                          │      │
│   │   └────────┬────────┘                                          │      │
│   │            │                                                    │      │
│   │            ▼                                                    │      │
│   │   ┌─────────────────────────────────────────────┐              │      │
│   │   │         AI ANALYSIERT & EMPFIEHLT           │              │      │
│   │   │                                             │              │      │
│   │   │  Input:                                     │              │      │
│   │   │  • Meine Collection (nur was ich habe!)    │              │      │
│   │   │  • Abilities aller Karten                  │              │      │
│   │   │  • Synergien zwischen Karten               │              │      │
│   │   │  • Aktuelle Regeln & Banlist               │              │      │
│   │   │                                             │              │      │
│   │   │  Output:                                    │              │      │
│   │   │  • Beste Mana-Ramp Karten                  │              │      │
│   │   │  • Beste Tutors (Library durchsuchen)      │              │      │
│   │   │  • Beste Removal/Interaction               │              │      │
│   │   │  • Synergie-Vorschläge                     │              │      │
│   │   └─────────────────────────────────────────────┘              │      │
│   │            │                                                    │      │
│   │            ▼                                                    │      │
│   │   ┌─────────────────┐                                          │      │
│   │   │  OPTIMALES DECK │                                          │      │
│   │   │  (aus meiner    │                                          │      │
│   │   │   Collection!)  │                                          │      │
│   │   └─────────────────┘                                          │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► Das ist der KERN-VALUE: "Bestes Deck aus MEINEN Karten"              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI MUSS VERSTEHEN:                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. ABILITIES                                                              │
│      ┌──────────────────────────────────────────────────────────────┐      │
│      │ • Keywords (Flying, Trample, Haste, etc.)                    │      │
│      │ • Activated Abilities (Tap: Draw a card)                     │      │
│      │ • Triggered Abilities (When X enters, do Y)                  │      │
│      │ • Static Abilities (All creatures get +1/+1)                 │      │
│      └──────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   2. SYNERGIEN                                                              │
│      ┌──────────────────────────────────────────────────────────────┐      │
│      │ • Tribal (Elves boost other Elves)                           │      │
│      │ • Mechanics (Tokens + Sacrifice outlets)                     │      │
│      │ • Combos (Infinite loops, win conditions)                    │      │
│      │ • Commander synergy (Color identity, theme)                  │      │
│      └──────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   3. DECK-FUNKTIONEN (was jedes Deck braucht)                              │
│      ┌──────────────────────────────────────────────────────────────┐      │
│      │ • Mana Ramp         │ Schneller mehr Mana                   │      │
│      │ • Card Draw         │ Karten nachziehen                     │      │
│      │ • Removal           │ Gegner-Karten entfernen               │      │
│      │ • Tutors            │ Library durchsuchen                   │      │
│      │ • Win Conditions    │ Wie gewinne ich?                      │      │
│      │ • Protection        │ Eigene Karten schützen                │      │
│      └──────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   4. REGELN & LEGALITÄT                                                    │
│      ┌──────────────────────────────────────────────────────────────┐      │
│      │ • Format-Regeln (Commander: 100 Karten, Singleton)           │      │
│      │ • Banned Lists (pro Format unterschiedlich)                  │      │
│      │ • Color Identity (Commander bestimmt erlaubte Farben)        │      │
│      └──────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KERN-ERKENNTNIS #8 - IDEALER WORKFLOW                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   DREI PHASEN im idealen Workflow                                          │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  PHASE 1: DECK ERSTELLEN                                        │      │
│   │  ═══════════════════════════════════════════════════════════    │      │
│   │                                                                 │      │
│   │  ┌───────────────┐                                             │      │
│   │  │ Karten-Combo  │  "Ich finde 2 Karten die gut                │      │
│   │  │ (2 Karten)    │   zusammen funktionieren"                   │      │
│   │  └───────┬───────┘                                             │      │
│   │          │                                                      │      │
│   │          ▼                                                      │      │
│   │  ┌───────────────────────────────────────────────────┐         │      │
│   │  │  AI baut Deck aus MEINER Kollektion               │         │      │
│   │  │  • Passende Karten automatisch wählen             │         │      │
│   │  │  • Constraints: LEGAL + OPTIMAL                   │         │      │
│   │  └───────────────────────────────────────────────────┘         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  PHASE 2: SPIELWEISE LERNEN                                     │      │
│   │  ═══════════════════════════════════════════════════════════    │      │
│   │                                                                 │      │
│   │  ┌───────────────────────────────────────────────────┐         │      │
│   │  │  AI erklärt Spielweise:                           │         │      │
│   │  │  • Wie spiele ich dieses Deck?                    │         │      │
│   │  │  • Welche Combos gibt es?                         │         │      │
│   │  │  • Mulligan-Entscheidungen?                       │         │      │
│   │  │  • Matchup-Tipps?                                 │         │      │
│   │  └───────────────────────────────────────────────────┘         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  PHASE 3: UPGRADE PLANEN                                        │      │
│   │  ═══════════════════════════════════════════════════════════    │      │
│   │                                                                 │      │
│   │  ┌───────────────────────────────────────────────────┐         │      │
│   │  │  Kaufempfehlungen mit PREISEN:                    │         │      │
│   │  │  • "Karte X würde Deck verbessern"                │         │      │
│   │  │  • "Preis: €5.99 bei [Shop]"                      │         │      │
│   │  │  • "Alternative: Karte Y für €1.99"               │         │      │
│   │  │  • Priorität: Was bringt am meisten?              │         │      │
│   │  └───────────────────────────────────────────────────┘         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► Workflow geht über Deck-Building hinaus:                             │
│       BUILD → LEARN → UPGRADE                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Bestätigte Annahmen
- [x] Deck-Building ist das primäre Ziel (nicht Collection Management)
- [x] Collection-Updates sind ein notwendiger aber sekundärer Workflow
- [x] Workflow hat 3 Phasen: Build → Learn → Upgrade

### Widerlegte/Angepasste Annahmen
- [ ] **"Competitive Player" = 80%** - Trifft nicht zu für diesen Nutzer
  - Eher: Lernender Spieler, der optimieren will mit begrenzten Ressourcen

### Neue Erkenntnisse (Scope-Erweiterung!)
- [ ] **Paper Cards Support** - Aktuell nicht unterstützt, aber gewünscht
- [ ] **Format-Legalität** - Bannings müssen berücksichtigt werden
- [ ] **Dynamische Updates** - Collection ändert sich regelmäßig
- [ ] **Proxy-Tracking** - Originale vs. Proxies unterscheiden (für Turnierfähigkeit)
- [ ] **Decklist-Import** - Netdecks laden und anpassen (EDHREC, Moxfield, etc.)
- [ ] **Commander-Fokus** - Paper hauptsächlich Commander/EDH Format
- [ ] **F2P-Optimierung** - Deck-Building unter Budget-Constraints besonders wichtig
- [ ] **Format-Edukation** - Nutzer lernt Formate noch kennen
- [ ] **AI Deck-Builder (KERN!)** - Optimales Deck aus Collection mit AI-Unterstützung
- [ ] **Synergie-Erkennung** - AI muss Karten-Synergien verstehen
- [ ] **Funktions-Kategorien** - Ramp, Draw, Removal, Tutors, Protection, Win-Cons
- [ ] **Commander/Combo als Startpunkt** - Deck um Schlüsselkarte(n) herum bauen
- [ ] **Decklist-Import von URLs** - Moxfield, Archidekt URLs direkt importieren
- [ ] **YouTube als Discovery** - Deck-Ideen kommen oft von Content Creators
- [ ] **Spielweise-Guide** - AI erklärt wie man das Deck spielt (Combos, Mulligan, Matchups)
- [ ] **Kaufempfehlungen** - Upgrade-Vorschläge MIT PREISEN
- [ ] **Budget-Alternativen** - Günstigere Optionen für teure Karten
- [ ] **Proaktive Deck-Analyse** - Nach Collection-Update: "Neue Karte X verbessert Deck Y!"
- [ ] **Banlist-Monitoring** - Bei Banlist-Änderung: betroffene Decks finden + Alternativen vorschlagen

### Proaktive Deck-Optimierung (Neue Erkenntnis!)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROAKTIVE DECK-OPTIMIERUNG                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   TRIGGER 1: Collection wird aktualisiert                                  │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  + Neuer Booster geöffnet                                       │      │
│   │  + Karte gecraftet                                              │      │
│   │  + Paper-Karten hinzugefügt                                     │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   TRIGGER 2: Banlist-Änderung                                              │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ! Karte wurde gebannt in Format X                              │      │
│   │  → Welche meiner Decks sind betroffen?                          │      │
│   │  → Welche Alternativen gibt es aus meiner Collection?           │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   AUTOMATISCHE ANALYSE:                                                    │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Für jedes bestehende Deck prüfen:                              │      │
│   │  • Passt neue Karte besser als eine vorhandene?                │      │
│   │  • Ermöglicht neue Karte neue Synergien/Combos?                │      │
│   │  • Verbessert neue Karte die Mana-Kurve?                       │      │
│   │  • Füllt neue Karte eine Lücke (mehr Removal, Draw, etc.)?     │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   NOTIFICATION:                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  "Neue Karte 'Lightning Bolt' könnte in deinem                  │      │
│   │   'Burn Deck' die Karte 'Shock' ersetzen!"                     │      │
│   │                                                                 │      │
│   │   [Details anzeigen]  [Änderung übernehmen]  [Ignorieren]      │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► Proaktiv statt reaktiv: App findet Verbesserungen automatisch!       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tool-Landschaft (Aktuell genutzt)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AKTUELLE TOOL-LANDSCHAFT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   DISCOVERY (Deck-Ideen finden)                                            │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  YouTube Videos                                                 │      │
│   │  └──► Deck-URLs in Video-Beschreibung                          │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   DECK-HOSTING (Decklists abrufen)                                         │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  • moxfield.com    │ Beliebte Deck-Sharing Plattform           │      │
│   │  • archidekt.com   │ Alternative Deck-Sharing Plattform        │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   GAP: Kein Tool verbindet Decklist mit MEINER Collection!                 │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Aktuell:                                                       │      │
│   │  • Manueller Abgleich: Was habe ich? Was fehlt?                │      │
│   │  • Kein automatischer Ownership-Check                          │      │
│   │  • Kein "Was kann ich mit meinen Karten bauen?"                │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► OPPORTUNITY: Import + Ownership-Abgleich + Substitution              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Offene Fragen (zu klären)
- [x] Wie werden Paper Cards heute erfasst? → Gar nicht, nur in Deckboxen
- [x] Welche Formate sind relevant? → Standard, Historic (Draft ausprobiert)
- [x] Wie wichtig ist Paper vs. Digital? → **80% Arena / 20% Paper**
- [x] Proxy-Kennzeichnung? → **Beim Import-Modus angeben** (nicht pro Karte)
- [x] Bevorzugte Collection-Import Methode? → Datei-Export (aber Arena unterstützt es nicht)
- [x] Update-Frequenz? → **Nach jedem Booster-Pack** (häufig!)
- [x] Paper Card Import? → **Mix aus 4 Methoden** (je nach Situation)

### Paper Collection Import - Optionen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PAPER COLLECTION IMPORT OPTIONEN                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   METHODE 1: Fertige Produkte importieren                                  │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  • Precon Decks (Commander Precons)                             │      │
│   │  • Standard Decks (Challenger Decks, etc.)                      │      │
│   │  → Produkt auswählen, alle Karten automatisch hinzufügen        │      │
│   │  ✓ Sehr schnell für bekannte Produkte                           │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   METHODE 2: Manuell eintippen                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  • Kartennamen eintippen                                        │      │
│   │  • Autocomplete mit Scryfall-Daten                              │      │
│   │  → Für einzelne Karten oder kleine Mengen                       │      │
│   │  ✓ Präzise, kein Scan-Equipment nötig                           │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   METHODE 3: Handy-Kamera scannen                                          │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  • Einzelne Karte fotografieren                                 │      │
│   │  • App erkennt Karte (Image Recognition)                        │      │
│   │  → Wenn man den Namen nicht kennt                               │      │
│   │  ? Erfordert gute Image Recognition (Scryfall hat Bilder)       │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   METHODE 4: Bulk-Scan (fortgeschritten)                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  • Vorrichtung für schnelles Durchscannen vieler Karten        │      │
│   │  • Karten schnell nacheinander vor Kamera halten               │      │
│   │  → Für große Sammlungen                                         │      │
│   │  ? Community-Lösungen existieren (DIY Scanning Rigs)            │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► Alle 4 Methoden sollten unterstützt werden (je nach Kontext)        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Update-Frequenz Implikation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UPDATE-FREQUENZ: NACH JEDEM BOOSTER                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Häufige, kleine Updates → Prozess muss SCHNELL + EINFACH sein!           │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Screenshot-Workflow wäre zu aufwändig:                         │      │
│   │  • Arena öffnen                                                 │      │
│   │  • Zur Collection navigieren                                    │      │
│   │  • Nach neuen Karten filtern/suchen                            │      │
│   │  • Screenshots machen                                           │      │
│   │  • In App hochladen + verarbeiten                              │      │
│   │  • Fehler korrigieren                                          │      │
│   │  = 5-10 Minuten für ein paar Karten? Zu viel!                  │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Idealer Workflow:                                              │      │
│   │  • Booster öffnen in Arena                                      │      │
│   │  • Collection automatisch aktualisiert                          │      │
│   │  = 0 Sekunden Aufwand!                                          │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► Log-Parsing könnte das ermöglichen (automatischer Sync)              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Arena Collection Import - Technische Optionen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARENA COLLECTION IMPORT OPTIONEN                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   OPTION A: Screenshot OCR (aktuell implementiert)                         │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ✓ Funktioniert                                                 │      │
│   │  ✗ Aufwändig (viele Screenshots nötig)                         │      │
│   │  ✗ Fehleranfällig (OCR-Genauigkeit)                            │      │
│   │  ✗ Manuelle Korrekturen nötig                                  │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   OPTION B: Datei-Export (vom User bevorzugt)                              │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ✗ Arena bietet KEINEN Collection-Export                        │      │
│   │  ? Aber: Log-Dateien könnten Collection enthalten              │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   OPTION C: Log-File Parsing (zu untersuchen!)                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ? Arena schreibt Logs: Player.log, output_log.txt             │      │
│   │  ? Tools wie MTGA Pro Tracker, 17Lands nutzen diese            │      │
│   │  ? Collection-Daten könnten enthalten sein                     │      │
│   │  → RECHERCHE NÖTIG                                              │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   OPTION D: UI-Automatisierung (vom User erwähnt)                          │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ? Arena-UI fernsteuern und auslesen                           │      │
│   │  ✗ Fragil (UI-Änderungen brechen es)                           │      │
│   │  ✗ Komplex zu implementieren                                   │      │
│   │  ✗ Möglicherweise gegen ToS                                    │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ──► EMPFEHLUNG: Option C (Log-Parsing) untersuchen!                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Priorisierungs-Implikation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRIORISIERUNG                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   80% Arena  ████████████████████████████████████████  → MVP-Fokus         │
│   20% Paper  ██████████                                → Phase 2+          │
│                                                                             │
│   Empfehlung:                                                               │
│   • MVP: Arena-Features perfektionieren                                    │
│   • Later: Paper-Support als Erweiterung                                   │
│   • Architektur: Von Anfang an für beide planen                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Use Case Übersicht (Draft)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USE CASE DIAGRAM                                  │
│                           (Draft - zu validieren)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────┐                                                             │
│    │ Spieler  │                                                             │
│    └────┬─────┘                                                             │
│         │                                                                   │
│         ├────────► UC1: Sammlung scannen                                    │
│         │              • Screenshot hochladen                               │
│         │              • OCR verarbeiten                                    │
│         │              • Ergebnisse korrigieren                             │
│         │                                                                   │
│         ├────────► UC2: Deck bauen                                          │
│         │              • Neues Deck erstellen                               │
│         │              • Karten hinzufügen/entfernen                        │
│         │              • Deck speichern                                     │
│         │                                                                   │
│         ├────────► UC3: Deck optimieren                                     │
│         │              • AI-Analyse starten                                 │
│         │              • Vorschläge prüfen                                  │
│         │              • Änderungen übernehmen                              │
│         │                                                                   │
│         ├────────► UC4: Deck exportieren                                    │
│         │              • Format wählen                                      │
│         │              • In Arena importieren                               │
│         │                                                                   │
│         └────────► UC5: Fehlende Karten finden                              │
│                        • Ersatzkarten suchen                                │
│                        • Budget-Alternativen                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Session-Zusammenfassung

### Session 1 - 2025-11-30 - ABGESCHLOSSEN

**Themen behandelt:**
- [x] Projekt-Motivation und persönlicher Kontext
- [x] Paper vs. Digital Spielweise (80/20)
- [x] Formate (Standard, Historic, Commander)
- [x] F2P-Constraint und Budget-Bewusstsein
- [x] Proxy-Tracking Anforderung
- [x] Externe Tools (Moxfield, Archidekt, YouTube)
- [x] Idealer Workflow (BUILD → LEARN → UPGRADE)
- [x] AI Deck-Builder als Kern-Feature

---

### Session 2 - 2025-12-01 - Collection Management

**Fokus:** Wie werden Collections erstellt und aktualisiert?

**F10: Wie würdest du am liebsten deine Arena Collection initial erfassen?**

> "Am liebsten B (Datei exportieren). Leider unterstützt Arena nicht den Export
> der ganzen Collection. Wenn du einen anderen Weg findest, wie du an die
> Internas kommst, umso besser. Eine weitere Variante könnte sein die Arena
> Windows Applikation durch browsen des UI ferngesteuert auszulesen. Aber ich
> weiss nicht, ob das möglich ist. Aktuell habe ich keine andere Möglichkeit
> gefunden als Variante A (Screenshots). Aber ich will die Lösung nicht
> vorwegnehmen."

**F11: Wie oft würdest du die Collection aktualisieren wollen?**

> "Nach jedem Booster-Pack. Oder wenn ich eine neue Karte gecraftet habe."

**F12: Wie würdest du am liebsten Paper Cards erfassen?**

> "Es ist wohl ein Mix:
> 1. Die Precon oder einzwei Standard Decks, die ich gekauft habe
> 2. Manuell eintippen
> 3. Per Handy-Kamera scannen
> 4. Bulk-Scan - ich habe im Internet gesehen, dass es Leute gibt, die sich
>    Vorrichtungen gebastelt haben, mit denen sie per Handy viele Karten
>    einzeln aber schnell nacheinander scannen können."

**F13: Wie soll Original vs. Proxy gekennzeichnet werden?**

> "Beim Import-Modus angeben."

**F14: Weitere Ideen zum Deck Building?**

> "Schön wäre, wenn nach einem Collection Update alle Decks geprüft werden
> könnten, ob es mit den neuen Karten Sinn macht etwas auszuwechseln. Vielleicht
> gibt es ja dann plötzlich neues Potenzial, das vorher nicht da war."

> "Laufen müssten auch Änderungen der Banlists nötige Anpassungen an Decks finden
> und Alternativen zu Karten finden, die entfernt werden müssen."

**F15: Was möchtest du in deiner Collection suchen und filtern können?**

> Bestätigt:
> - Alle Karten eines Typs (z.B. "alle Elfen")
> - Karten mit bestimmten Abilities (z.B. "alle mit Card Draw")
> - Filter nach Farbe, Manakosten, Seltenheit
> - Karten mit Duplikaten (mehr als Playset)
> - Karten die in keinem Deck verwendet werden
> - **Original vs. Proxy** (explizit genannt!)

**Alle Suchkriterien bestätigt:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COLLECTION BROWSE & SEARCH                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   BESTÄTIGT VOM USER:                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ✓ Kreaturentyp (Tribal)    "Alle Elfen", "Alle Goblins"       │      │
│   │  ✓ Abilities/Keywords       "Card Draw", "Flying", "Deathtouch"│      │
│   │  ✓ Farbe                    Mono-Color, Multi-Color, Colorless │      │
│   │  ✓ Manakosten (CMC)         1-Drop, 2-Drop, etc.               │      │
│   │  ✓ Seltenheit               Common, Uncommon, Rare, Mythic     │      │
│   │  ✓ Duplikate                >4 Kopien (Trade-Kandidaten)       │      │
│   │  ✓ Ungenutzte Karten        In keinem Deck verwendet           │      │
│   │  ✓ Original / Proxy         Nur echte oder nur Proxies         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ERWEITERTE FILTER (alle bestätigt):                                      │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ✓ Set/Edition              "Nur Karten aus Phyrexia Set"      │      │
│   │  ✓ Künstler                 Fan eines bestimmten Artists       │      │
│   │  ✓ Arena / Paper            Wo besitze ich diese Karte?        │      │
│   │  ✓ Format-Legal             "Zeige nur Standard-legale Karten" │      │
│   │  ✓ Kürzlich hinzugefügt     "Letzte 7 Tage / Letzter Booster" │      │
│   │  ✓ Preis-Range              "Karten über €5 Wert" (Trade!)     │      │
│   │  ✓ Power/Toughness          "Alle 4/4 Kreaturen"               │      │
│   │  ✓ Kartentyp                Instant, Sorcery, Enchantment...   │      │
│   │  ✓ Textsuche                Freitext im Kartentext             │      │
│   │  ✓ Combo-Partner            "Karten die mit X gut sind"        │      │
│   │  ✓ Favoriten/Tags           Eigene Markierungen                │      │
│   │  ✓ Deck-Potenzial           "Fehlt nur 1 Karte für Combo X"   │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   SORTIERUNG (alle bestätigt):                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ✓ Alphabetisch             A-Z, Z-A                           │      │
│   │  ✓ Nach CMC                 Günstig → Teuer                    │      │
│   │  ✓ Nach Anzahl              Viele → Wenige                     │      │
│   │  ✓ Nach Preis/Wert          Wertvollste zuerst                 │      │
│   │  ✓ Nach Hinzufügedatum      Neueste zuerst                     │      │
│   │  ✓ Nach Set-Nummer          Collector's Number                 │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ANSICHTEN (alle bestätigt):                                              │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  ✓ Karten-Grid              Bilder wie in Arena                │      │
│   │  ✓ Liste/Tabelle            Kompakt, viele auf einmal          │      │
│   │  ✓ Nach Set gruppiert       Expansion-Übersicht                │      │
│   │  ✓ Nach Farbe gruppiert     Color Wheel Ansicht                │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. MVP-Scope (Definiert: 2025-12-01)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MVP SCOPE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ████████████████████████████████████████████████████████████████████████  │
│   █                         MVP (5 Use Cases)                            █  │
│   ████████████████████████████████████████████████████████████████████████  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  A1  Arena Collection Import (Screenshot OCR)            ✓ MVP │      │
│   │      → Bereits implementiert! Basis für alles weitere.         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  A4  Collection Browse & Search                          ✓ MVP │      │
│   │      → Karten finden, filtern, sortieren (20+ Kriterien)       │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  B1  AI Deck-Builder                                     ✓ MVP │      │
│   │      → Optimales Deck aus Collection mit AI-Unterstützung      │      │
│   │      → Startpunkt: Commander oder Karten-Combo                 │      │
│   │      → Constraint: Legal + Optimal                             │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  C2  Kaufempfehlungen mit Preisen                        ✓ MVP │      │
│   │      → "Diese Karte würde dein Deck verbessern"                │      │
│   │      → Preisvergleich von Shops                                │      │
│   │      → Budget-Alternativen vorschlagen                         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  C4  Banlist-Monitoring & Alternativen                   ✓ MVP │      │
│   │      → Bei Ban: betroffene Decks finden                        │      │
│   │      → Ersatzkarten aus Collection vorschlagen                 │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│   ════════════════════════════════════════════════════════════════════════  │
│                                                                             │
│   NICHT IM MVP (Phase 2+):                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  A2  Arena Log-Parsing              → Recherche nötig          │      │
│   │  A3  Paper Collection Import        → 20% Nutzung, später      │      │
│   │  B2  Deck Import (Moxfield URL)     → Nice-to-have             │      │
│   │  B3  Deck Export                    → Nice-to-have             │      │
│   │  B4  Ownership-Check                → Teil von B1?             │      │
│   │  C1  Spielweise-Guide               → Phase 2                  │      │
│   │  C3  Proaktive Optimierung          → Phase 2                  │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### MVP User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MVP USER FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. IMPORT                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Screenshot hochladen → OCR → Collection erstellen              │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   2. BROWSE                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Collection durchsuchen → Filter anwenden → Karten finden       │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   3. BUILD                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Combo/Commander wählen → AI baut Deck → Review & Adjust        │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   4. UPGRADE                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Kaufempfehlungen sehen → Preise vergleichen → Entscheiden      │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                         │                                                   │
│                         ▼                                                   │
│   5. MAINTAIN                                                               │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │  Banlist-Check → Betroffene Decks → Alternativen finden         │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Offene Themen:**
- [ ] **User Story Mapping**: Detaillierte Stories für MVP erstellen

### Kern-Erkenntnisse (8 Stück)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ZUSAMMENFASSUNG DER KERN-ERKENNTNISSE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  #1  Verwaltung ist Mittel zum Zweck → Deck-Building ist das Ziel          │
│  #2  Zwei Sammlungen: Arena (80%) + Paper (20%)                            │
│  #3  Collections sind dynamisch (neue Karten, Bans, Rotation)              │
│  #4  Paper: Original vs. Proxy unterscheiden                               │
│  #5  Paper-Workflow ist deck-zentriert (Netdecks → anpassen → drucken)     │
│  #6  F2P macht optimale Deck-Nutzung noch wichtiger                        │
│  #7  AI Deck-Builder = KERN-FEATURE (Synergie, Abilities, Regeln)          │
│  #8  Workflow: BUILD → LEARN → UPGRADE (mit Preisen!)                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Nächste Schritte

- [x] Interview Session 1 durchführen
- [x] Interview Session 2: Collection Management
- [x] Use Cases priorisieren
- [x] MVP-Scope definieren (5 Use Cases)
- [ ] Personas validieren/anpassen
- [ ] User Story Map erstellen

