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

### Bestätigte Annahmen
- [x] Deck-Building ist das primäre Ziel (nicht Collection Management)
- [x] Collection-Updates sind ein notwendiger aber sekundärer Workflow

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

### Offene Fragen (zu klären)
- [x] Wie werden Paper Cards heute erfasst? → Gar nicht, nur in Deckboxen
- [x] Welche Formate sind relevant? → Standard, Historic (Draft ausprobiert)
- [ ] Wie wichtig ist Paper vs. Digital? (50/50? 80/20?)
- [ ] Proxy-Druck Workflow: Wie werden Proxies erstellt? Welche Tools?

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

## 7. Nächste Schritte

- [ ] Interview durchführen
- [ ] Personas validieren/anpassen
- [ ] Use Cases priorisieren
- [ ] User Story Map erstellen
- [ ] MVP-Scope definieren

