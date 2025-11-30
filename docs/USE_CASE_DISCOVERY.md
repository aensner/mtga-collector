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

**Frage 1:** [Wartet auf Antwort]

**Antwort:**

---

## 5. Erkenntnisse & Hypothesen

### Bestätigte Annahmen
_(Wird während des Interviews befüllt)_

### Widerlegte Annahmen
_(Wird während des Interviews befüllt)_

### Neue Erkenntnisse
_(Wird während des Interviews befüllt)_

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

