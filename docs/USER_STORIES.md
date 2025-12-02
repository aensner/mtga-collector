# User Stories & Acceptance Criteria

> **Status**: Draft
> **Erstellt**: 2025-12-02
> **Scope**: MVP (5 Use Cases)

---

## Story Format

```
Als [Rolle]
möchte ich [Funktion]
damit [Nutzen]

Akzeptanzkriterien:
- [ ] Kriterium 1
- [ ] Kriterium 2
```

---

## Epic A1: Arena Collection Import (Screenshot OCR)

### US-A1.1: Screenshot hochladen

```
Als Arena-Spieler
möchte ich Screenshots meiner Collection hochladen können
damit ich meine Karten digitalisieren kann

Akzeptanzkriterien:
- [ ] Drag & Drop Zone ist sichtbar auf der Import-Seite
- [ ] Unterstützte Formate: PNG, JPG, JPEG
- [ ] Mehrere Screenshots gleichzeitig hochladbar
- [ ] Vorschau der hochgeladenen Bilder wird angezeigt
- [ ] Fehlermeldung bei ungültigem Dateiformat
- [ ] Maximum: 10 Screenshots pro Upload-Session
```

### US-A1.2: OCR-Verarbeitung

```
Als Arena-Spieler
möchte ich dass meine Screenshots automatisch verarbeitet werden
damit Kartennamen erkannt werden

Akzeptanzkriterien:
- [ ] OCR startet automatisch nach Upload
- [ ] Fortschrittsanzeige zeigt aktuelle Karte (z.B. "12/36")
- [ ] Leere Kartenslots werden übersprungen
- [ ] Erkannte Karten werden gegen Scryfall validiert
- [ ] Verarbeitungszeit < 30 Sekunden pro Screenshot
- [ ] Fehlerhafte Erkennungen werden markiert
```

### US-A1.3: Ergebnisse prüfen und korrigieren

```
Als Arena-Spieler
möchte ich die OCR-Ergebnisse prüfen und korrigieren können
damit falsch erkannte Karten behoben werden

Akzeptanzkriterien:
- [ ] Tabelle zeigt: Position, erkannter Name, Confidence, Anzahl
- [ ] Nicht-erkannte Karten sind rot markiert
- [ ] Kartennamen sind editierbar (Inline-Edit)
- [ ] Autocomplete mit Scryfall-Daten bei Eingabe
- [ ] "Alle übernehmen" Button für bestätigte Karten
- [ ] "AI Korrektur" Button für problematische Karten
- [ ] Vorschau des OCR-Bereichs für jede Karte
```

### US-A1.4: Collection speichern

```
Als Arena-Spieler
möchte ich die erkannten Karten zu meiner Collection hinzufügen
damit sie dauerhaft gespeichert sind

Akzeptanzkriterien:
- [ ] "Zur Collection hinzufügen" Button vorhanden
- [ ] Duplikate erhöhen die Anzahl (nicht doppelt anlegen)
- [ ] Erfolgsmeldung mit Anzahl hinzugefügter Karten
- [ ] Weiterleitung zur Collection-Ansicht
- [ ] Import-Historie wird gespeichert (Datum, Anzahl)
```

---

## Epic A4: Collection Browse & Search

### US-A4.1: Collection anzeigen

```
Als Arena-Spieler
möchte ich meine Collection als Übersicht sehen
damit ich weiß welche Karten ich besitze

Akzeptanzkriterien:
- [ ] Grid-Ansicht mit Kartenbildern (Standard)
- [ ] Listen-Ansicht als Alternative
- [ ] Karten zeigen: Bild, Name, Anzahl, Set-Symbol
- [ ] Lazy Loading für Performance (> 100 Karten)
- [ ] Sortierung: Alphabetisch (Standard), CMC, Anzahl, Datum
- [ ] Collection-Statistik: Gesamt, Unique, nach Seltenheit
```

### US-A4.2: Collection filtern

```
Als Arena-Spieler
möchte ich meine Collection filtern können
damit ich bestimmte Karten schnell finde

Akzeptanzkriterien:
- [ ] Filter-Panel (collapsible sidebar)
- [ ] Filter nach Farbe (W/U/B/R/G/C, Multi-Select)
- [ ] Filter nach CMC (Slider oder Buttons 0-7+)
- [ ] Filter nach Kartentyp (Creature, Instant, etc.)
- [ ] Filter nach Seltenheit (C/U/R/M)
- [ ] Filter nach Set (Dropdown mit Suche)
- [ ] Filter nach Format-Legalität (Standard, Historic, etc.)
- [ ] Filter kombinierbar (AND-Logik)
- [ ] "Filter zurücksetzen" Button
- [ ] Aktive Filter als Chips angezeigt
```

### US-A4.3: Collection durchsuchen

```
Als Arena-Spieler
möchte ich in meiner Collection suchen können
damit ich Karten nach Name oder Text finde

Akzeptanzkriterien:
- [ ] Suchfeld prominent platziert
- [ ] Suche in: Kartenname, Regeltext, Kreaturentyp
- [ ] Live-Suche (Debounce 300ms)
- [ ] Mindestens 2 Zeichen für Suche
- [ ] Suchergebnisse sofort angezeigt
- [ ] "Keine Ergebnisse" Meldung wenn leer
- [ ] Suchbegriff bleibt nach Navigation erhalten
```

### US-A4.4: Karten-Detail anzeigen

```
Als Arena-Spieler
möchte ich Details zu einer Karte sehen
damit ich alle Informationen auf einen Blick habe

Akzeptanzkriterien:
- [ ] Modal öffnet bei Klick auf Karte
- [ ] Großes Kartenbild
- [ ] Kartenname, Manakosten, Typ
- [ ] Regeltext (Oracle Text)
- [ ] Anzahl in Collection
- [ ] In welchen Decks verwendet (Liste)
- [ ] Format-Legalität (Icons: ✓ legal, ✗ illegal, ⚠ banned)
- [ ] Link zu Scryfall für mehr Details
- [ ] Schließen mit X, ESC oder Klick außerhalb
```

### US-A4.5: Spezielle Ansichten

```
Als Arena-Spieler
möchte ich vordefinierte Ansichten nutzen können
damit ich häufige Fragen schnell beantworte

Akzeptanzkriterien:
- [ ] Tab "Kürzlich": Letzte 7 Tage hinzugefügt
- [ ] Tab "Duplikate": Karten mit > 4 Kopien
- [ ] Tab "Ungenutzt": Karten in keinem Deck
- [ ] Anzahl in Tab-Label (z.B. "Ungenutzt (23)")
- [ ] Tabs als Quick-Filter (kombinierbar mit anderen Filtern)
```

---

## Epic B1: AI Deck-Builder

### US-B1.1: Deck-Builder starten

```
Als Arena-Spieler
möchte ich den AI Deck-Builder starten können
damit ich ein optimales Deck erstellen kann

Akzeptanzkriterien:
- [ ] "Neues Deck mit AI" Button in Deck-Liste
- [ ] Wizard-Flow mit klaren Schritten
- [ ] Schritt-Indikator (1/3, 2/3, 3/3)
- [ ] Zurück-Button zwischen Schritten
- [ ] Abbrechen möglich mit Bestätigung
```

### US-B1.2: Startpunkt wählen

```
Als Arena-Spieler
möchte ich einen Startpunkt für mein Deck wählen
damit die AI weiß worauf sie aufbauen soll

Akzeptanzkriterien:
- [ ] Option A: "Karten-Combo" - 2-4 Karten auswählen
- [ ] Option B: "Strategie" - Archetype wählen (Aggro, Control, etc.)
- [ ] Kartenauswahl mit Autocomplete aus eigener Collection
- [ ] Gewählte Karten werden als Basis angezeigt
- [ ] Warnung wenn gewählte Karten nicht in Collection
- [ ] Mindestens 1 Karte oder 1 Strategie erforderlich
```

### US-B1.3: Format und Constraints wählen

```
Als Arena-Spieler
möchte ich Format und Einschränkungen festlegen
damit das generierte Deck meinen Anforderungen entspricht

Akzeptanzkriterien:
- [ ] Format-Auswahl: Standard, Historic, Explorer, Brawl
- [ ] Deck-Größe wird automatisch gesetzt (60/100)
- [ ] Optional: Farb-Einschränkung (z.B. "nur Rot-Grün")
- [ ] Optional: Budget-Modus (nur Common/Uncommon)
- [ ] Vorschau der Collection-Karten im gewählten Format
- [ ] Warnung wenn < 40 legale Karten in Collection
```

### US-B1.4: Deck generieren lassen

```
Als Arena-Spieler
möchte ich das Deck von der AI generieren lassen
damit ich ein optimiertes Deck erhalte

Akzeptanzkriterien:
- [ ] "Deck generieren" Button startet AI
- [ ] Ladeindikator während Generierung
- [ ] Generierung < 30 Sekunden
- [ ] AI nutzt nur Karten aus meiner Collection
- [ ] AI erklärt ihre Entscheidungen (kurze Begründung)
- [ ] Fehlerbehandlung wenn AI nicht antworten kann
```

### US-B1.5: Generiertes Deck prüfen

```
Als Arena-Spieler
möchte ich das generierte Deck prüfen und anpassen
damit es meinen Vorstellungen entspricht

Akzeptanzkriterien:
- [ ] Deck-Ansicht mit allen Karten
- [ ] Mana-Kurve Visualisierung
- [ ] Farb-Verteilung (Pie Chart)
- [ ] Kategorien: Creatures, Spells, Lands
- [ ] Karten entfernbar (mit Vorschlägen für Ersatz)
- [ ] Karten hinzufügbar (aus Collection)
- [ ] Legalitäts-Check in Echtzeit
- [ ] "Deck speichern" Button
- [ ] Deck-Name editierbar
```

### US-B1.6: Deck speichern

```
Als Arena-Spieler
möchte ich mein Deck speichern können
damit ich es später wiederfinde und nutzen kann

Akzeptanzkriterien:
- [ ] Deck-Name erforderlich
- [ ] Format wird automatisch gespeichert
- [ ] Archetypes werden erkannt und gespeichert
- [ ] Cover-Image wird automatisch gewählt (Feature Card)
- [ ] Erfolgsmeldung nach Speichern
- [ ] Weiterleitung zur Deck-Detail Ansicht
```

---

## Epic C2: Kaufempfehlungen mit Preisen

### US-C2.1: Upgrade-Vorschläge sehen

```
Als Arena-Spieler
möchte ich Vorschläge für Deck-Verbesserungen sehen
damit ich weiß welche Karten mein Deck verbessern würden

Akzeptanzkriterien:
- [ ] "Upgrades anzeigen" Button in Deck-Detail
- [ ] Liste mit empfohlenen Karten
- [ ] Für jede Empfehlung: Karte, Begründung, Preis
- [ ] Sortierung nach Priorität (höchste Verbesserung zuerst)
- [ ] Anzeige welche Karte ersetzt wird (falls applicable)
- [ ] Maximal 10 Empfehlungen pro Deck
```

### US-C2.2: Preise vergleichen

```
Als Arena-Spieler
möchte ich Preise für empfohlene Karten sehen
damit ich informierte Kaufentscheidungen treffen kann

Akzeptanzkriterien:
- [ ] Preis in EUR angezeigt (Scryfall-Daten)
- [ ] Preisquelle angegeben (z.B. "Cardmarket")
- [ ] Sortierung nach Preis möglich
- [ ] Filter: "Nur unter €X"
- [ ] Gesamtpreis für alle Empfehlungen
- [ ] "In Arena = Wildcards" Info anzeigen
```

### US-C2.3: Budget-Alternativen

```
Als Arena-Spieler
möchte ich günstigere Alternativen sehen
damit ich auch mit Budget upgraden kann

Akzeptanzkriterien:
- [ ] "Budget-Alternativen" Toggle/Button
- [ ] Für teure Karten: günstigere Optionen anzeigen
- [ ] Vergleich: Original vs. Alternative (Preis, Effekt)
- [ ] Filter: nur Karten die ich noch nicht habe
- [ ] Sortierung nach Preis-Leistung
```

### US-C2.4: Wildcard-Empfehlungen (Arena-spezifisch)

```
Als Arena-Spieler
möchte ich wissen welche Wildcards ich einsetzen sollte
damit ich meine begrenzten Ressourcen optimal nutze

Akzeptanzkriterien:
- [ ] Anzeige welche Seltenheit benötigt (Common bis Mythic)
- [ ] Priorisierung: "Diese Mythic bringt am meisten"
- [ ] Wildcard-Kosten-Übersicht für alle Empfehlungen
- [ ] Filter nach Seltenheit
- [ ] "Habe ich schon" Check gegen Collection
```

---

## Epic C4: Banlist-Monitoring & Alternativen

### US-C4.1: Banlist-Änderungen sehen

```
Als Arena-Spieler
möchte ich über Banlist-Änderungen informiert werden
damit ich rechtzeitig reagieren kann

Akzeptanzkriterien:
- [ ] Banlist-Monitor Seite unter /arena/bans
- [ ] Liste der kürzlichen Bans (letzte 30 Tage)
- [ ] Für jeden Ban: Karte, Format, Datum, Status
- [ ] Status: Banned, Suspended, Restricted
- [ ] Quelle verlinkt (z.B. WotC Announcement)
- [ ] Notification-Badge wenn neue Bans seit letztem Besuch
```

### US-C4.2: Betroffene Decks identifizieren

```
Als Arena-Spieler
möchte ich sehen welche meiner Decks betroffen sind
damit ich weiß wo ich handeln muss

Akzeptanzkriterien:
- [ ] "Betroffene Decks" Liste bei jedem Ban
- [ ] Anzahl betroffener Karten pro Deck
- [ ] Schnell-Link zum Deck
- [ ] Filter: nur eigene Decks
- [ ] Warnung in Deck-Detail wenn illegale Karten
- [ ] Dashboard-Widget: "2 Decks betroffen"
```

### US-C4.3: Ersatz-Vorschläge erhalten

```
Als Arena-Spieler
möchte ich Vorschläge für Ersatzkarten bekommen
damit ich mein Deck wieder legal machen kann

Akzeptanzkriterien:
- [ ] "Alternativen finden" Button bei betroffenen Decks
- [ ] Vorschläge nur aus eigener Collection
- [ ] Ähnliche Funktion wie gebannte Karte
- [ ] Begründung warum Alternative passt
- [ ] "Keine passende Alternative" wenn Collection zu klein
- [ ] Direkt-Link zum Deck-Edit mit Vorschlag
```

### US-C4.4: Deck reparieren

```
Als Arena-Spieler
möchte ich mein Deck mit einem Klick reparieren können
damit ich schnell wieder spielbereit bin

Akzeptanzkriterien:
- [ ] "Deck reparieren" Button wenn Alternative gefunden
- [ ] Vorschau der Änderung vor Bestätigung
- [ ] Automatischer Tausch: Banned → Alternative
- [ ] Manueller Modus: selbst auswählen
- [ ] Erfolgsmeldung: "Deck ist wieder legal"
- [ ] Undo möglich (letzte Änderung rückgängig)
```

---

## Übergreifende Stories

### US-X.1: Deck-Liste anzeigen

```
Als Arena-Spieler
möchte ich alle meine Decks sehen
damit ich den Überblick behalte

Akzeptanzkriterien:
- [ ] Grid-Ansicht mit Deck-Karten
- [ ] Pro Deck: Titelbild, Name, Format, Farben
- [ ] Archetyp-Tags sichtbar
- [ ] Sortierung: Name, Datum, Format
- [ ] Filter nach Format
- [ ] "Neues Deck" Button prominent
- [ ] Legalitäts-Status (✓ legal, ⚠ illegal)
```

### US-X.2: Deck exportieren

```
Als Arena-Spieler
möchte ich mein Deck exportieren können
damit ich es in Arena importieren kann

Akzeptanzkriterien:
- [ ] "Exportieren" Button in Deck-Detail
- [ ] Arena-kompatibles Format (Text)
- [ ] "In Zwischenablage kopieren" Button
- [ ] Download als .txt Datei
- [ ] Export-Vorschau vor dem Kopieren
```

### US-X.3: Dashboard sehen

```
Als Arena-Spieler
möchte ich eine Übersicht auf dem Dashboard sehen
damit ich den Status meiner Collection kenne

Akzeptanzkriterien:
- [ ] Collection-Statistik (Karten, Unique, Wildcards-Wert)
- [ ] Anzahl Decks
- [ ] Kürzlich hinzugefügte Karten (letzte 5)
- [ ] Notifications (Bans, Empfehlungen)
- [ ] Quick-Actions: Import, Neues Deck, Collection
```

---

## Story Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STORY MAP - MVP                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   USER JOURNEY:                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   │  IMPORT  │─►│  BROWSE  │─►│  BUILD   │─►│ UPGRADE  │─►│ MAINTAIN │     │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│        │             │             │             │             │            │
│        ▼             ▼             ▼             ▼             ▼            │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│   │ A1.1    │  │ A4.1    │  │ B1.1    │  │ C2.1    │  │ C4.1    │          │
│   │ Upload  │  │ Anzeigen│  │ Starten │  │ Upgrades│  │ Bans    │          │
│   │─────────│  │─────────│  │─────────│  │─────────│  │─────────│          │
│   │ A1.2    │  │ A4.2    │  │ B1.2    │  │ C2.2    │  │ C4.2    │          │
│   │ OCR     │  │ Filtern │  │ Start-  │  │ Preise  │  │ Decks   │          │
│   │─────────│  │─────────│  │ punkt   │  │─────────│  │ finden  │          │
│   │ A1.3    │  │ A4.3    │  │─────────│  │ C2.3    │  │─────────│          │
│   │ Prüfen  │  │ Suchen  │  │ B1.3    │  │ Budget  │  │ C4.3    │          │
│   │─────────│  │─────────│  │ Format  │  │─────────│  │ Ersatz  │          │
│   │ A1.4    │  │ A4.4    │  │─────────│  │ C2.4    │  │─────────│          │
│   │ Speich. │  │ Detail  │  │ B1.4    │  │ Wild-   │  │ C4.4    │          │
│   └─────────┘  │─────────│  │ Gener.  │  │ cards   │  │ Repair  │          │
│                │ A4.5    │  │─────────│  └─────────┘  └─────────┘          │
│                │ Spezial │  │ B1.5    │                                     │
│                └─────────┘  │ Prüfen  │                                     │
│                             │─────────│                                     │
│                             │ B1.6    │                                     │
│                             │ Speich. │                                     │
│                             └─────────┘                                     │
│                                                                             │
│   TOTAL: 21 User Stories für MVP                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Priorisierung (MoSCoW)

| Story | Must | Should | Could | Won't |
|-------|------|--------|-------|-------|
| **A1: Import** |
| A1.1 Upload | ✓ | | | |
| A1.2 OCR | ✓ | | | |
| A1.3 Prüfen | ✓ | | | |
| A1.4 Speichern | ✓ | | | |
| **A4: Browse** |
| A4.1 Anzeigen | ✓ | | | |
| A4.2 Filtern | ✓ | | | |
| A4.3 Suchen | ✓ | | | |
| A4.4 Detail | ✓ | | | |
| A4.5 Spezial | | ✓ | | |
| **B1: AI Builder** |
| B1.1 Starten | ✓ | | | |
| B1.2 Startpunkt | ✓ | | | |
| B1.3 Format | ✓ | | | |
| B1.4 Generieren | ✓ | | | |
| B1.5 Prüfen | ✓ | | | |
| B1.6 Speichern | ✓ | | | |
| **C2: Kaufempfehlungen** |
| C2.1 Upgrades | ✓ | | | |
| C2.2 Preise | ✓ | | | |
| C2.3 Budget | | ✓ | | |
| C2.4 Wildcards | | | ✓ | |
| **C4: Banlist** |
| C4.1 Bans sehen | ✓ | | | |
| C4.2 Decks finden | ✓ | | | |
| C4.3 Ersatz | ✓ | | | |
| C4.4 Repair | | ✓ | | |

**Zusammenfassung:**
- **Must Have**: 17 Stories
- **Should Have**: 3 Stories
- **Could Have**: 1 Story

---

## Nächste Schritte

- [ ] Stories in Sprints aufteilen
- [ ] Technische Tasks pro Story definieren
- [ ] Story Points schätzen
