<div align="center">

# Phil's Day&Night Cycle

![Foundry v14 Compatible](https://img.shields.io/badge/Foundry-v13-brightgreen?style=flat-square) ![Foundry v12 Compatible](https://img.shields.io/badge/Foundry-v12-green?style=flat-square) ![License](https://img.shields.io/badge/License-GPLv3_%2F_CC_BY--NC--ND-blue?style=flat-square)
[![Version](https://img.shields.io/badge/Version-5.1.9-blue?style=flat-square)](https://github.com/PhilsModules/phils-day-night-cycle/releases) [![Patreon](https://img.shields.io/badge/SUPPORT-Patreon-ff424d?style=flat-square&logo=patreon)](https://www.patreon.com/PhilsModules)

<br>

**Bring your world to life with a beautiful, immersive clock widget.**
<br>
_Erwecke deine Welt zum Leben mit einem wunderschoenen und immersiven Uhr Widget._

<br>

<a href="#-english-instructions"><img src="https://img.shields.io/badge/%20-English_Instructions-black?style=for-the-badge&logo=united-kingdom&logoColor=white" alt="English Instructions"></a> <a href="#-deutsche-anleitung"><img src="https://img.shields.io/badge/%20-Deutsche_Anleitung-black?style=for-the-badge&logo=germany&logoColor=red" alt="Deutsche Anleitung"></a> <a href="Updates.md"><img src="https://img.shields.io/badge/%20-Update_Logs-black?style=for-the-badge&logo=clock&logoColor=white" alt="Updates"></a>

</div>

<br>

> [!NOTE]
> **A Quick Note / Hinweis in eigener Sache**
>
> 🇬🇧 **Hi everyone!**  
> A quick note before you start: I create these modules completely in my free time and offer them to the community for free. Since neither my partner nor I are professional graphic designers, translators, or full time developers, maintaining these projects takes a huge amount of effort. To make these modules possible, we use assistance from artificial intelligence, especially for translations and visual elements. Hiring professional designers or translators is simply something we cannot afford out of pocket.
> 
> If these modules should ever be removed from the official Foundry package listing due to rules regarding artificial intelligence, do not worry. The project will continue! You can always find all updates, releases, and support directly here on GitHub.
> 
> Thank you so much for your understanding and support!
> 
> ---
> 
> 🇩🇪 **Hallo zusammen!**  
> Ein kleiner Hinweis in eigener Sache, bevor ihr startet: Ich erstelle diese Module komplett in meiner Freizeit und stelle sie der Community kostenlos zur Verfügung. Da weder meine Lebensgefährtin noch ich Grafikdesigner, gelernte Übersetzer oder hauptberufliche Entwickler sind, ist die Pflege extrem aufwendig. Um die Module in dieser Form überhaupt anbieten zu können, nutzen wir Hilfe von künstlicher Intelligenz, zum Beispiel für Übersetzungen und grafische Elemente. Professionelle Designer oder Übersetzer können wir uns privat schlicht nicht leisten.
> 
> Sollten die Module wegen der Nutzung von künstlicher Intelligenz oder veränderter Richtlinien irgendwann aus dem offiziellen Verzeichnis von Foundry gelöscht werden, müsst ihr euch keine Sorgen machen. Das Projekt stirbt nicht! Ihr findet alle Updates, neue Versionen und Unterstützung bei Problemen weiterhin direkt hier auf GitHub.
> 
> Vielen Dank für euer Verständnis und eure Unterstützung!

<br>

>
> ### Kompatibilitaet / Compatibility
>
> **English:** This module works **standalone** and includes a full calendar system. It manages time and date natively using the reliable time tracking built into Foundry. No other calendar modules are required.
>
> **Deutsch:** Dieses Modul funktioniert **eigenstaendig** und enthaelt ein vollwertiges Kalendersystem. Es verwaltet Zeit und Datum nativ ueber die eingebaute Zeiterfassung von Foundry. Es werden keine weiteren Module fuer den Kalender benoetigt.
>
> ---
>
> ### Vikingar Preview / Sneak Peek
>
> **English:** This version includes the new **Vikingar** calendar preset. This is a sneak preview of my upcoming **Viking Pathfinder 2 Supplement** featuring: **24** Classes, **31** Backgrounds, **1974** Feats, **939** Spells, **22** Ancestries, and **483** Items.
>
> **Deutsch:** Diese Version enthaelt das neue **Vikingar** Kalender-Preset. Dies ist eine Sneak Preview auf mein kommendes **Wikinger Pathfinder 2 Supplement** mit: **24** Klassen, **31** Hintergruenden, **1974** Talenten, **939** Zaubern, **22** Abstammungen und **483** Gegenstaenden.

<br>

---

<br>

<div align="center">
<img src="https://github.com/PhilsModules/phils-day-night-cycle/blob/main/pv.png" alt="Preview" width="800">
</div>

<br>

<br>

<br>

# <img src="https://flagcdn.com/48x36/gb.png" width="28" height="21" alt="EN"> English Instructions

**An elegant clock widget with drag and drop functionality for Foundry VTT.**

Phil's Day&Night Cycle adds a visually appealing clock that automatically syncs with the Foundry World Time. It shows not just the time but the current phase of day like Morning, Noon, Evening or Night in a beautiful design.

-> **[Detailed Climate Zone Guide](climate_zones.md)** - Learn about the different climates and their lighting times.

## Key Features

- **Complete Weather System:** Simulates realistic weather including temperature, wind and humidity based on climate zones with over 1200 unique weather descriptions.
- **Weather Rules Integration:** Other systems or content modules can inject GM-only weather rule notes into the generated weather chat cards.
- **Simple Calendar Migration:** Import the currently active Simple Calendar setup into a PDNC custom calendar, including compatible notes and events.
- **Dynamic Day Phases:** Add, delete, and rename all time slots in the Theme Configuration.
- **Smart Clock Mapping:** The clock face automatically maps any number of phases (even just 2 or 4) to its 8 visual segments using time-based windowing.
- **Automatic FX:** Weather automatically applies Rain, Snow, Fog or Storm effects to your scene.
- **Smart Lighting:** Scene darkness automatically adjusts based on time of day, season and cloud cover.
- **Beautiful Design:** A high quality widget with a premium look and integrated weather display.
- **Moon Cycle:** The widget accurately displays the current moon phase (Waxing, Full, Waning, New) synced to the calendar date.
- **Custom Images:** Upload your own image for the clock face easily.
- **Drag and Drop:** Place the clock anywhere on your screen.
- **Calendar Integration:** Click to open the fully featured calendar complete with automatic daily Weather Reports.
- **Notes and Events:** Create public events, GM notes or party notes.
- **Time Machine:** Use the Time Machine to jump to any specific date (GM Only).
- **System Support:** Supports Golarion for PF2e, Harptos for D&D 5e, Gregorian, and the new **Vikingar** calendar.

## Installation

1.  Open Foundry VTT.
2.  Go to the **Addon Modules** tab.
3.  Click **Install Module**.
4.  Paste the following **Manifest URL** into the field:
    ```
    https://github.com/PhilsModules/phils-day-night-cycle/releases/latest/download/module.json
    ```
5.  Click **Install**.

## How to Use

### 1. The Clock

The clock is visible in the bottom right by default.

- **Move:** Simply drag the widget with your mouse to any position on screen.
- **Smart Clock Orientation:** When in *Automatic (Smart)* mode, the clock face automatically shifts to open above, below, left, or right based on the screen edge to stay completely visible.
- **Orientation Selector (Right-Click):** Right-click the small clock icon on the widget to open a 3x3 directional popover menu (`Above ⬆️`, `Below ⬇️`, `Left ⬅️`, `Right ➡️`, or `Smart Auto 🪄`) to manually pin where the clock face opens with 1 click.
<div align="center">
<img src="https://github.com/PhilsModules/phils-day-night-cycle/blob/main/3x3.png" alt="Preview" width="400">
</div>

- **Hide / Collapse:** Click the clock icon to toggle the clock face open/closed (hiding the top arrow cleanly when collapsed).
- **Open Calendar:** Click directly on the clock face or the date text.

### 2. The Calendar

In the calendar you can click on days to add events.

- **Right Click a Day:** Opens the Add Event menu.
- **Left Click a Day:** Shows all events for that day.
- **View Switcher:** Toggle between **Year View** (12-month grid), **Month View**, and **List View** (all upcoming events) using the dropdown at the top.

### 3. Settings

In the module settings you can adjust various options.

- Change the calendar system (Golarion, Harptos and others).
- Change the clock background image.
- Set time and date offsets.
- **Toggle Weather System:** Disable the entire weather and lighting system if you only want the Clock and Calendar features.
- **Import From Simple Calendar:** Open the built-in migration tool to copy the currently active Simple Calendar calendar into PDNC and optionally migrate notes/events.

### 4. Weather System

The module automatically simulates weather.

**Configuring Weather**

- Every morning a window automatically opens for the Gamemaster to determine the weather for the new day.
- You can also manually change the weather at any time by clicking the small **Cloud Icon** on the clock widget at the top left.
- The setting **Post Weather GM Notes** can keep general or provider-driven GM weather guidance embedded in the generated weather chat card.
- Weather visuals and rule meaning are now separated: `fx` stays visual, while semantic `weather.tags` are used for generic and system-specific rule notes.

### 5. Custom Climate Zones

1.  Open the **Module Settings**.
2.  Click the **Manage Custom Climates** button.
3.  Create a new climate zone such as Desert or Ice World.
4.  Add weather entries for each season (Spring, Summer, Autumn, Winter).
    - **Text:** The description posted to chat (example "A sandy wind is blowing").
    - **Temp:** The temperature range (example "30 to 40").
    - **FX:** The visual effect (example "FOG" for sandstorms).
    - **Tags (optional in data/imports):** Semantic rule markers such as `wind:storm`, `visibility:fog`, or `precipitation:heavy-rain`.
5.  Save your climate zone.
6.  Select it in the main settings under **Climate Zone**.

### 6. Weather Mixer & Composer

Want to create your own unique weather? Open the **Weather Mixer** by clicking the Flask Icon in the Weather Configuration window.

- **Layering:** Combine multiple effects (e.g. Rain + Fog + Wind).
- **Customization:** Fully control every aspect of the simulation:
  - **Particles:** Adjust Density, Speed, Size, and Direction.
  - **Filters:** Tweak Color, Intensity, and Speed of shaders.
- **Preview:** Use the **Preview** button to test your mix live on the canvas without saving.
- **Favorites:** Save your perfect storm to your list of favorites for instant access.

### 7. Pathfinder 2e Synchronization

This module offers a seamless 1-click integration with Pathfinder 2e's native World Clock system.

1. Open the **Setup Wizard** (runs automatically on first launch, or re-open anytime from **Module Settings** -> **Restart Setup Wizard**).
2. Select **Golarion** as your calendar system.
3. If running Pathfinder 2e, the wizard displays the **Pathfinder 2e World Clock Integration** panel.
4. Click **Compare & Synchronize Times** to open the side-by-side comparison.
5. Click **Synchronize PF2e Now** to align PF2e's creation timestamp directly with PDNC Master Time without touching `game.time.worldTime` (all spell durations, active effects, and journal events are preserved 100%).
6. If the weekday differs, click **Align PDNC Week Start** to sync weekdays seamlessly.
7. Done! Both systems stay in sync.

### 8. Macros / API

You can control the clock using Script Macros. Create a new Macro, set the type to **Script**, and paste the code below.

**Toggle Clock Visibility**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggle();
```

**Set Time**

```js
// Change the time below (Hour, Minute)
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.setTime(12, 0);
```

**Reset Clock Position**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.resetPosition();
```

**Toggle Dungeon Mode**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggleDungeonMode();
```

**Weather Rules Integration**

Other systems or setting modules can register a provider and inject system-specific rule notes into the weather card without modifying this module's core weather logic.

The provider receives a `weather` object that now separates visual effects from rule semantics:

```js
{
  fx: "storm",
  fxList: ["storm"],
  tags: ["hazard:storm", "wind:strong", "temperature:cold-mild"],
  tempMin: 0,
  tempMax: 6
}
```

```js
Hooks.once("ready", () => {
  if (!window.PhilsDayNightCycle?.registerWeatherRulesProvider) return;

  window.PhilsDayNightCycle.registerWeatherRulesProvider("my-module", ({ weather }) => {
    if (!weather.tags.includes("wind:strong")) return null;

    return {
      title: "My System Weather Effects",
      audience: "gm",
      entries: [
        "Ranged attacks beyond medium distance take a penalty.",
        "Open flames are extinguished unless protected."
      ]
    };
  });
});
```

You can also use the `pdnc.collectWeatherRules` hook for simple synchronous integrations. Each provider may return a single section or an array of sections. A section can target `gm` or `public`, but GM-only notes are the intended default.
If your own module imports or generates climate entries, you can provide an explicit `tags` array there and PDNC will pass it through to all weather-rule providers.

**Simple Calendar Migration**

PDNC also includes a built-in migration tool for the `foundryvtt-simple-calendar` module.

- Open **Module Settings** and use **Import From Simple Calendar**.
- The importer reads the currently active Simple Calendar calendar, creates a PDNC custom calendar from it, and can migrate compatible notes into PDNC events.
- If you use multiple Simple Calendar calendars, activate the source calendar there first and then run the import in PDNC.
- Current date/time sync is only offered when the Simple Calendar setup uses a standard `24 / 60 / 60` day structure.

<br>

---

<br>

# <img src="https://flagcdn.com/48x36/de.png" width="28" height="21" alt="DE"> Deutsche Anleitung

**Eine elegante Uhr per Drag and Drop fuer Foundry VTT.**

Phil's Day&Night Cycle fuegt eine visuell ansprechende Uhr hinzu welche sich automatisch mit der Weltzeit in Foundry synchronisiert. Sie zeigt nicht nur die Uhrzeit an sondern visualisiert auch die aktuelle Tagesphase wie Morgen, Mittag, Abend oder Nacht in einem wunderschoenen Design.

-> **[Detaillierter Guide zu Klimazonen](klimazonen.md)** - Erfahre alles ueber die verschiedenen Klimate und ihre Lichtzeiten.

## Funktionen

- **Volles Wettersystem:** Simulation von realistischem Wetter inklusive Temperatur, Wind und Luftfeuchtigkeit basierend auf Klimazonen mit ueber 1200 einzigartigen Wetterbeschreibungen.
- **Regel-Integration fuer Wetter:** Andere Systeme oder Content-Module koennen SL-exklusive Wetter-Regelhinweise in die erzeugten Wetterkarten einspeisen.
- **Simple-Calendar-Migration:** Importiert den aktuell aktiven Simple-Calendar-Kalender als PDNC-Kalender und uebernimmt kompatible Notizen oder Ereignisse.
- **Dynamische Phasen:** Beliebig viele Phasen erstellen, loeschen oder umbenennen in der Theme-Konfiguration.
- **Intelligentes Uhr-Mapping:** Das Zifferblatt mappt automatisch jede Phasenanzahl (auch nur 2 oder 4) auf die 8 visuellen Segmente.
- **Automatische Effekte:** Das Wetter erzeugt automatisch passende Effekte fuer Regen, Schnee, Nebel oder Sturm in deiner Szene.
- **Intelligente Beleuchtung:** Die Helligkeit der Szene passt sich automatisch an Tageszeit, Jahreszeit und Bewoelkung an.
- **Wunderschoenes Design:** Ein hochwertiges Widget im Premium Look mit integrierter Wetteranzeige.
- **Mondzyklus:** Die Uhr zeigt die aktuelle Mondphase (Zunehmend, Voll, Abnehmend, Neu) synchron zum Kalenderdatum an.
- **Benutzerdefinierte Bilder:** Lade ganz einfach dein eigenes Bild fuer das Zifferblatt hoch.
- **Drag and Drop:** Platziere die Uhr frei an jeder beliebigen Stelle auf deinem Bildschirm.
- **Integration des Kalenders:** Ein Klick oeffnet den vollwertigen Kalender mit automatischem Logbuch als Wetterbericht.
- **Notizen und Events:** Erstelle oeffentliche Ereignisse sowie Notizen fuer den GM oder die ganze Gruppe.
- **Zeitreise:** Nutze die Zeitmaschine um zu jedem beliebigen Datum zu springen (nur fuer den GM).
- **Unterstuetzung vieler Systeme:** Unterstuetzt Golarion fuer PF2e, Harptos fuer D&D 5e, den Gregorianischen Kalender sowie den neuen **Vikingar** Kalender.

## Installation

1.  Oeffne Foundry VTT.
2.  Gehe zum Reiter **Addon Modules**.
3.  Klicke auf **Install Module**.
4.  Fuege die folgende **Manifest URL** unten ein:
    ```
    https://github.com/PhilsModules/phils-day-night-cycle/releases/latest/download/module.json
    ```
5.  Klicke auf **Install**.

## Bedienung

### 1. Die Uhr

Du findest die Uhr standardmaessig unten rechts.

- **Verschieben:** Ziehe das Widget einfach mit der Maus an jeden beliebigen Bildschirmrand.
- **Intelligente Ausrichtung (Smart Positioning):** Im *Automatisch (Smart)*-Modus erkennt die Uhr Bildschirmraender selbststaendig. Am oberen Rand oeffnet sich das Zifferblatt z. B. unter dem Bedienfeld, am linken Rand rechts davon usw.
- **Schnell-Ausrichtung per Rechtsklick:** Mache einen **Rechtsklick auf das Uhr-Icon** im Bedienfeld, um ein diamantfoermiges Schnellmenue zu oeffnen. Dort kannst du mit 1 Klick bestimmen, wo das Zifferblatt aufklappen soll (`Oben ⬆️`, `Unten ⬇️`, `Links ⬅️`, `Rechts ➡️` oder `Smart Auto 🪄`).
<div align="center">
<img src="https://github.com/PhilsModules/phils-day-night-cycle/blob/main/3x3.png" alt="Preview" width="400">
</div>

- **Ausblenden:** Klicke auf das Uhr-Icon, um das Zifferblatt ein- oder auszuklappen (der Pfeil wird dabei sauber ausgeblendet).
- **Kalender oeffnen:** Klicke direkt auf das Zifferblatt oder das Datum.

### 2. Der Kalender

Im Kalender kannst du Tage anklicken um Ereignisse hinzuzufuegen.

- **Rechtsklick auf einen Tag:** Oeffnet das Menue um einen neuen Termin zu erstellen.
- **Linksklick auf einen Tag:** Zeigt alle Ereignisse dieses Tages an.
- **Ansicht wechseln:** Nutze das Dropdown oben, um zwischen **Jahresansicht** (12 Monate Raster), **Monatsansicht** und **Terminliste** (alle kommenden Events) zu wechseln.

### 3. Einstellungen

In den Moduleinstellungen kannst du diverse Dinge anpassen.

- Das Kalendersystem aendern (Golarion, Harptos und weitere).
- Das Hintergrundbild der Uhr austauschen.
- Versatz fuer Zeit und Datum einstellen.
- **Wettersystem schalten:** Deaktiviere das gesamte Wetter und Lichtsystem falls du nur die Uhr und den Kalender nutzen moechtest.
- **Aus Simple Calendar importieren:** Oeffnet das eingebaute Migrationstool, um den aktuell aktiven Simple-Calendar-Kalender nach PDNC zu uebernehmen und optional Notizen oder Ereignisse zu migrieren.

### 4. Wettersystem

Das Modul simuliert das Wetter vollautomatisch.

**Konfiguration des Wetters**

- Jeden Morgen oeffnet sich automatisch ein Fenster fuer den Gamemaster in dem das Wetter fuer den neuen Tag bestimmt werden kann.
- Du kannst das Wetter auch jederzeit manuell aendern indem du auf das kleine **Wolken Icon** in der Uhr oben links im Widget klickst.
- Die Einstellung **SL-Wetternotizen im Chat** kann allgemeine oder von anderen Modulen gelieferte Regelhinweise direkt in die erzeugte Wetterkarte einbetten.
- Wetteroptik und Regelbedeutung sind jetzt getrennt: `fx` bleibt visuell, waehrend semantische `weather.tags` fuer allgemeine und systemspezifische Regelhinweise genutzt werden.

### 5. Eigene Klimazonen erstellen

1.  Oeffne die **Moduleinstellungen**.
2.  Klicke auf den Button **Manage Custom Climates**.
3.  Erstelle eine neue Klimazone wie zum Beispiel Wueste oder Eiswelt.
4.  Fuege fuer jede Jahreszeit (Fruehling, Sommer, Herbst, Winter) Eintraege fuer das Wetter hinzu.
    - **Text:** Die Beschreibung die im Chat gepostet wird (zum Beispiel "Ein sandiger Wind weht").
    - **Temp:** Der Temperaturbereich (zum Beispiel "30 bis 40").
    - **FX:** Der visuelle Effekt (zum Beispiel "FOG" fuer Sandsturm).
    - **Tags (optional in Daten/Importen):** Semantische Regelmarker wie `wind:storm`, `visibility:fog` oder `precipitation:heavy-rain`.
5.  Speichere deine Klimazone ab.
6.  Waehle sie nun in den Haupteinstellungen unter **Climate Zone** aus.

### 6. Wetter Mixer & Komponist

Moechtest du dein ganz eigenes Wetter erschaffen? Oeffne den **Wetter Mixer** ueber das Reagenzglas-Icon im Wetter-Konfigurationsmenue.

- **Schichten:** Kombiniere mehrere Effekte (z.B. Regen + Nebel + Wind).
- **Anpassung:** Volle Kontrolle ueber jeden Aspekt der Simulation:
  - **Partikel:** Passe Dichte, Geschwindigkeit, Groesse und Richtung an.
  - **Filter:** Aendere Farbe, Intensitaet und Geschwindigkeit von Shadern.
- **Vorschau:** Nutze den **Vorschau** Button, um deinen Mix live auf der Szene zu testen, ohne ihn direkt zu speichern.
- **Favoriten:** Speichere deinen perfekten Sturm in deiner Favoritenliste fuer sofortigen Zugriff.

### 7. Pathfinder 2e Synchronisation

Dieses Modul bietet eine nahtlose 1-Klick-Integration mit der nativen Weltuhr von Pathfinder 2e.

1. Oeffne den **Setup-Assistenten** (startet beim ersten Laden automatisch oder jederzeit ueber **Moduleinstellungen** -> **Setup Assistent neu starten**).
2. Waehle **Golarion** als Kalendersystem aus.
3. Wenn Pathfinder 2e aktiv ist, zeigt der Assistent automatisch den Bereich **Pathfinder 2e Weltuhr-Abgleich** an.
4. Klicke auf **PF2e ↔ PDNC Zeiten vergleichen & synchronisieren**, um den Live-Vergleich zu oeffnen.
5. Klicke auf **PF2e jetzt synchronisieren**, um das Erstellungsdatum der PF2e-Weltuhr direkt an das PDNC Master-Datum anzupassen, ohne `game.time.worldTime` zu veraendern (alle Zauberdauern, Effekte und Tagebucheintraege bleiben zu 100% erhalten).
6. Falls der Wochentag abweicht, klicke auf **PDNC Wochenstart angleichen**, um auch die Wochentage perfekt abzugleichen.
7. Fertig! Beide Systeme sind synchronisiert.

### 8. Makros und API

Du kannst die Uhr auch ueber Makros steuern. Erstelle dafuer ein neues Makro vom Typ **Script** und fuege den jeweiligen Code ein.

**Uhr einblenden oder ausblenden**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggle();
```

**Zeit setzen**

```js
// Change the time below (Hour, Minute)
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.setTime(12, 0);
```

**Position der Uhr zuruecksetzen**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.resetPosition();
```

**Dungeon Mode umschalten**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggleDungeonMode();
```

**Integration von Wetter-Regeln**

Andere Systeme oder Setting-Module koennen einen Provider registrieren und systemeigene Regelhinweise in die Wetterkarte einfuegen, ohne dass die Kernlogik dieses Moduls angepasst werden muss.

Der Provider erhaelt jetzt ein `weather`-Objekt, das visuelle Effekte und Regelbedeutung trennt:

```js
{
  fx: "storm",
  fxList: ["storm"],
  tags: ["hazard:storm", "wind:strong", "temperature:cold-mild"],
  tempMin: 0,
  tempMax: 6
}
```

```js
Hooks.once("ready", () => {
  if (!window.PhilsDayNightCycle?.registerWeatherRulesProvider) return;

  window.PhilsDayNightCycle.registerWeatherRulesProvider("mein-modul", ({ weather }) => {
    if (!weather.tags.includes("wind:strong")) return null;

    return {
      title: "Wettereffekte meines Systems",
      audience: "gm",
      entries: [
        "Fernangriffe jenseits mittlerer Distanz erhalten einen Malus.",
        "Offene Flammen gehen aus, wenn sie nicht geschuetzt sind."
      ]
    };
  });
});
```

Fuer einfache synchrone Integrationen kannst du alternativ den Hook `pdnc.collectWeatherRules` nutzen. Ein Provider darf einen einzelnen Abschnitt oder ein Array von Abschnitten zurueckgeben. Ein Abschnitt kann an `gm` oder `public` gehen, gedacht ist das Feature aber primaer fuer SL-Hinweise.
Wenn dein eigenes Modul Klimaeintraege importiert oder generiert, kannst du dort direkt ein `tags`-Array mitgeben und PDNC reicht es an alle Wetter-Regelprovider weiter.

**Simple-Calendar-Migration**

PDNC bringt ausserdem ein eingebautes Migrationstool fuer das Modul `foundryvtt-simple-calendar` mit.

- Oeffne die **Moduleinstellungen** und nutze **Aus Simple Calendar importieren**.
- Das Tool liest den aktuell aktiven Simple-Calendar-Kalender, legt daraus einen PDNC-Kalender an und kann kompatible Notizen als PDNC-Ereignisse uebernehmen.
- Wenn du mehrere Simple-Calendar-Kalender nutzt, aktiviere zuerst dort den gewuenschten Quellkalender und starte danach den Import in PDNC.
- Die Synchronisation von aktuellem Datum und Uhrzeit wird nur angeboten, wenn die Quelle ein Standard-Zeitschema mit `24 / 60 / 60` verwendet.

<br>

---


<br>

## Custom Calendar JSON Example / Beispiel Kalender JSON

<br>

_If you want to import a calendar manually, you can use this structure:_
<br>
_Falls du einen Kalender manuell importieren moechtest, kannst du diese Struktur verwenden:_

```json
{
  "name": "My Fantasy Calendar",
  "description": "A custom calendar for my world.",
  "months": [
    { "name": "Frostfall", "days": 30, "leap": 0 },
    { "name": "Sunrise", "days": 31, "leap": 0 },
    { "name": "Goldenleaf", "days": 30, "leap": 1 }
  ],
  "weekdays": [
    "Starday",
    "Moonday",
    "Sunth",
    "Middas",
    "Windsday"
  ],
  "leapYearRule": "every4", 
  "yearZero": 0,
  "weekdayStart": 1
}
```

- **leapYearRule:** `none`, `gregorian`, or `every4`.
- **leap:** Number of extra days added to this month in a leap year (0 for none).

---

## License

This module uses a dual license structure.

- **Code:** GNU GPLv3
- **Assets:** CC BY-NC-ND 4.0

See `LICENSE` file for details.

<br>

<div align="center">
    <h2>Support the Development</h2>
    <p>If you enjoy this module and want to support open source development for Foundry VTT check out my Patreon.</p>
    <p>Gefaellt dir das Modul? Unterstuetze die Weiterentwicklung auf Patreon.</p>
    <a href="https://www.patreon.com/PhilsModules">
        <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron" width="200" />
    </a>
    <br><br>
    <p><i>Made for the Foundry VTT Community</i></p>
</div>
