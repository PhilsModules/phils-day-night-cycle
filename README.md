<div align="center">

# Phil's Day&Night Cycle ☀️🌙

![Foundry v13 Compatible](https://img.shields.io/badge/Foundry-v13-brightgreen?style=flat-square) ![Foundry v12 Compatible](https://img.shields.io/badge/Foundry-v12-green?style=flat-square) ![License](https://img.shields.io/badge/License-GPLv3_%2F_CC_BY--NC--ND-blue?style=flat-square)
[![Version](https://img.shields.io/badge/Version-4.4.1-blue?style=flat-square)](https://github.com/PhilsModules/phils-day-night-cycle/releases) [![Patreon](https://img.shields.io/badge/SUPPORT-Patreon-ff424d?style=flat-square&logo=patreon)](https://www.patreon.com/PhilsModules)

<br>

**Bring your world to life with a beautiful, immersive clock widget.**
<br>
_Erwecke deine Welt zum Leben mit einem wunderschönen und immersiven Uhr Widget._

<br>

<a href="#-english-instructions"><img src="https://img.shields.io/badge/%20-English_Instructions-black?style=for-the-badge&logo=united-kingdom&logoColor=white" alt="English Instructions"></a> <a href="#-deutsche-anleitung"><img src="https://img.shields.io/badge/%20-Deutsche_Anleitung-black?style=for-the-badge&logo=germany&logoColor=red" alt="Deutsche Anleitung"></a> <a href="Updates.md"><img src="https://img.shields.io/badge/%20-Update_Logs-black?style=for-the-badge&logo=clock&logoColor=white" alt="Updates"></a>

</div>

<br>

> [!NOTE]
>
> ### ⚠️ Kompatibilität / Compatibility
>
> **English:** This module works **standalone** and includes a full calendar system. It manages time and date natively using the reliable time tracking built into Foundry. No other calendar modules are required.
>
> **Deutsch:** Dieses Modul funktioniert **eigenständig** und enthält ein vollwertiges Kalendersystem. Es verwaltet Zeit und Datum nativ über die eingebaute Zeiterfassung von Foundry. Es werden keine weiteren Module für den Kalender benötigt.

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

Phil's Day/Night Cycle adds a visually appealing clock that automatically syncs with the Foundry World Time. It shows not just the time but the current phase of day like Morning, Noon, Evening or Night in a beautiful design.

👉 **[Detailed Climate Zone Guide](climate_zones.md)** - Learn about the different climates and their lighting times.

## 🚀 Key Features

- 🌦️ **Complete Weather System:** Simulates realistic weather including temperature, wind and humidity based on climate zones with over 1200 unique weather descriptions.
- 🌩️ **Automatic FX:** Weather automatically applies Rain, Snow, Fog or Storm effects to your scene.
- 💡 **Smart Lighting:** Scene darkness automatically adjusts based on time of day, season and cloud cover.
- 🎨 **Beautiful Design:** A high quality widget with a premium look and integrated weather display.
- 🌕 **Moon Cycle:** The widget accurately displays the current moon phase (Waxing, Full, Waning, New) synced to the calendar date.
- 🖼️ **Custom Images:** Upload your own image for the clock face easily.
- 🖱️ **Drag and Drop:** Place the clock anywhere on your screen.
- 📅 **Calendar Integration:** Click to open the fully featured calendar complete with automatic daily Weather Reports.
- 📝 **Notes and Events:** Create public events, GM notes or party notes.
- 🕰️ **Time Machine:** Use the Time Machine to jump to any specific date (GM Only).
- 🌍 **System Support:** Supports Golarion for PF2e, Harptos for D&D 5e and Gregorian calendars.

## 📦 Installation

1.  Open Foundry VTT.
2.  Go to the **Addon Modules** tab.
3.  Click **Install Module**.
4.  Paste the following **Manifest URL** into the field:
    ```
    https://github.com/PhilsModules/phils-day-night-cycle/releases/latest/download/module.json
    ```
5.  Click **Install**.

## 📖 How to Use

### 1. The Clock

The clock is visible in the bottom right by default.

- **Move:** Simply drag it with your mouse to any position.
- **Hide:** Click the small button below the clock to toggle the clock face.
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

### 4. Weather System and Climate Zones

The module automatically simulates weather.

**Configuring Weather**

- Every morning a window automatically opens for the Gamemaster to determine the weather for the new day.
- You can also manually change the weather at any time by clicking the small **Cloud Icon** on the clock widget at the top left.

**Creating Custom Climate Zones**

1.  Open the **Module Settings**.
2.  Click the **Manage Custom Climates** button.
3.  Create a new climate zone such as Desert or Ice World.
4.  Add weather entries for each season (Spring, Summer, Autumn, Winter).
    - **Text:** The description posted to chat (example "A sandy wind is blowing").
    - **Temp:** The temperature range (example "30 to 40").
    - **FX:** The visual effect (example "FOG" for sandstorms).
5.  Save your climate zone.
6.  Select it in the main settings under **Climate Zone**.

### 4. Pathfinder 2e Synchronization

This module offers a "Sync Pathfinder 2e" option, but getting the Golarion calendar perfectly aligned requires a specific workflow to match the official system time.

1.  **Activate** the module first.
2.  Open the **System Clock** located on the left above the Token Controls (world clock).
3.  Inside the **Startup Wizard** or the **Settings Menu** -> **Day & Night Cycle**, select **Golarion** and check the box for **Sync Pathfinder 2e**.
4.  Take a look at the Wizard to see if the **Year** and **Day** are roughly correct.
5.  Change the **Day** in the Wizard or adjust it via the Input Fields until it matches your world time.
6.  Use the **Weekday Offset** field directly in the Wizard to ensure the correct day of the week (the module accepts values like `+8` or `-1` just fine).
7.  Adjust the other settings in the Wizard and click **Finish Setup** (you can skip this if you are working directly in the menu).
8.  Go to the **Module Settings** afterwards because the Wizard sometimes only provides a rough approximation for complex offsets.
9.  Check the **Day Offset** and **Weekday Offset** in the settings again and adjust them if necessary.
10. Press **F5** to refresh the page.
11. Finally, adjust the **Time** (Hour/Minute) via the settings menu or the macro if needed.
12. Voila, done!

### 5. Macros / API

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

<br>

---

<br>

# <img src="https://flagcdn.com/48x36/de.png" width="28" height="21" alt="DE"> Deutsche Anleitung

**Eine elegante Uhr per Drag and Drop für Foundry VTT.**

Phil's Day/Night Cycle fügt eine visuell ansprechende Uhr hinzu welche sich automatisch mit der Weltzeit in Foundry synchronisiert. Sie zeigt nicht nur die Uhrzeit an sondern visualisiert auch die aktuelle Tagesphase wie Morgen, Mittag, Abend oder Nacht in einem wunderschönen Design.

👉 **[Detaillierter Guide zu Klimazonen](klimazonen.md)** - Erfahre alles über die verschiedenen Klimate und ihre Lichtzeiten.

## 🚀 Funktionen

- 🌦️ **Volles Wettersystem:** Simulation von realistischem Wetter inklusive Temperatur, Wind und Luftfeuchtigkeit basierend auf Klimazonen mit über 1200 einzigartigen Wetterbeschreibungen.
- 🌩️ **Automatische Effekte:** Das Wetter erzeugt automatisch passende Effekte für Regen, Schnee, Nebel oder Sturm in deiner Szene.
- 💡 **Intelligente Beleuchtung:** Die Helligkeit der Szene passt sich automatisch an Tageszeit, Jahreszeit und Bewölkung an.
- 🎨 **Wunderschönes Design:** Ein hochwertiges Widget im Premium Look mit integrierter Wetteranzeige.
- 🌕 **Mondzyklus:** Die Uhr zeigt die aktuelle Mondphase (Zunehmend, Voll, Abnehmend, Neu) synchron zum Kalenderdatum an.
- 🖼️ **Benutzerdefinierte Bilder:** Lade ganz einfach dein eigenes Bild für das Zifferblatt hoch.
- 🖱️ **Drag and Drop:** Platziere die Uhr frei an jeder beliebigen Stelle auf deinem Bildschirm.
- 📅 **Integration des Kalenders:** Ein Klick öffnet den vollwertigen Kalender mit automatischem Logbuch als Wetterbericht.
- 📝 **Notizen und Events:** Erstelle öffentliche Ereignisse sowie Notizen für den GM oder die ganze Gruppe.
- 🕰️ **Zeitreise:** Nutze die Zeitmaschine um zu jedem beliebigen Datum zu springen (nur für den GM).
- 🌍 **Unterstützung vieler Systeme:** Unterstützt Golarion für PF2e, Harptos für D&D 5e sowie den Gregorianischen Kalender.

## 📦 Installation

1.  Öffne Foundry VTT.
2.  Gehe zum Reiter **Addon Modules**.
3.  Klicke auf **Install Module**.
4.  Füge die folgende **Manifest URL** unten ein:
    ```
    https://github.com/PhilsModules/phils-day-night-cycle/releases/latest/download/module.json
    ```
5.  Klicke auf **Install**.

## 📖 Bedienung

### 1. Die Uhr

Du findest die Uhr standardmäßig unten rechts.

- **Verschieben:** Ziehe sie einfach mit der Maus an den gewünschten Rand.
- **Ausblenden:** Klicke den kleinen Button unter der Uhr um das Zifferblatt ein oder auszuklappen.
- **Kalender öffnen:** Klicke direkt auf das Zifferblatt oder das Datum.

### 2. Der Kalender

Im Kalender kannst du Tage anklicken um Ereignisse hinzuzufügen.

- **Rechtsklick auf einen Tag:** Öffnet das Menü um einen neuen Termin zu erstellen.
- **Linksklick auf einen Tag:** Zeigt alle Ereignisse dieses Tages an.
- **Ansicht wechseln:** Nutze das Dropdown oben, um zwischen **Jahresansicht** (12 Monate Raster), **Monatsansicht** und **Terminliste** (alle kommenden Events) zu wechseln.

### 3. Einstellungen

In den Moduleinstellungen kannst du diverse Dinge anpassen.

- Das Kalendersystem ändern (Golarion, Harptos und weitere).
- Das Hintergrundbild der Uhr austauschen.
- Versatz für Zeit und Datum einstellen.
- **Wettersystem schalten:** Deaktiviere das gesamte Wetter und Lichtsystem falls du nur die Uhr und den Kalender nutzen möchtest.

### 4. Wettersystem und Klimazonen

Das Modul simuliert das Wetter vollautomatisch.

**Konfiguration des Wetters**

- Jeden Morgen öffnet sich automatisch ein Fenster für den Gamemaster in dem das Wetter für den neuen Tag bestimmt werden kann.
- Du kannst das Wetter auch jederzeit manuell ändern indem du auf das kleine **Wolken Icon** in der Uhr oben links im Widget klickst.

**Erstellung eigener Klimazonen**

1.  Öffne die **Moduleinstellungen**.
2.  Klicke auf den Button **Manage Custom Climates**.
3.  Erstelle eine neue Klimazone wie zum Beispiel Wüste oder Eiswelt.
4.  Füge für jede Jahreszeit (Frühling, Sommer, Herbst, Winter) Einträge für das Wetter hinzu.
    - **Text:** Die Beschreibung die im Chat gepostet wird (zum Beispiel "Ein sandiger Wind weht").
    - **Temp:** Der Temperaturbereich (zum Beispiel "30 bis 40").
    - **FX:** Der visuelle Effekt (zum Beispiel "FOG" für Sandsturm).
5.  Speichere deine Klimazone ab.
6.  Wähle sie nun in den Haupteinstellungen unter **Climate Zone** aus.

### 4. Pathfinder 2e Synchronisation

Dieses Modul bietet eine "Sync Pathfinder 2e" Option, die Einrichtung erfordert jedoch einen bestimmten Workflow um perfekt mit der offiziellen Systemzeit übereinzustimmen.

1.  Aktiviere zuerst das Modul.
2.  Öffne die **Systemuhr** in der linken Leiste über den Token Controls (Weltuhr).
3.  Wähle im **Wizard** oder im **Menü** unter **Day & Night Cycle** die Option **Golarion** aus und setze den Haken bei **Sync Pathfinder 2e**.
4.  Schau im Wizard grob nach, ob das **Jahr** und der **Tag** stimmen.
5.  Ändere den **Tag** im Wizard oder stelle ihn über die Eingabefelder so ein, dass er passt.
6.  Stelle nun direkt im Wizard den **Weekday Offset** (Wochentag-Verschiebung) ein, um den aktuellen Wochentag festzulegen (du kannst dort problemlos Werte wie `+8` oder `-1` eingeben).
7.  Nimm die restlichen Einstellungen im Wizard vor und drücke abschließend auf **Finish Setup** (das kannst du überspringen, wenn du das direkt im Menü machst).
8.  Geh danach in die **Module Settings**, da der Wizard die Werte manchmal nur grob übernimmt.
9.  Kontrolliere den **Day Offset** und den **Weekday Offset** noch einmal und korrigiere sie, falls nötig.
10. Drücke **F5**, um die Seite neu zu laden.
11. Passe zum Schluss bei Bedarf die **Uhrzeit** entweder über das Menü oder über das Makro an.
12. Voila, fertig.

### 5. Makros und API

Du kannst die Uhr auch über Makros steuern. Erstelle dafür ein neues Makro vom Typ **Script** und füge den jeweiligen Code ein.

**Uhr einblenden oder ausblenden**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggle();
```

**Zeit setzen**

```js
// Change the time below (Hour, Minute)
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.setTime(12, 0);
```

**Position der Uhr zurücksetzen**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.resetPosition();
```

**Dungeon Mode umschalten**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggleDungeonMode();
```

<br>

---

## 📜 License

This module uses a dual license structure.

- **Code:** GNU GPLv3
- **Assets:** CC BY-NC-ND 4.0

See `LICENSE` file for details.

<br>

<div align="center">
    <h2>❤️ Support the Development</h2>
    <p>If you enjoy this module and want to support open source development for Foundry VTT check out my Patreon.</p>
    <p>Gefällt dir das Modul? Unterstütze die Weiterentwicklung auf Patreon.</p>
    <a href="https://www.patreon.com/PhilsModules">
        <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron" width="200" />
    </a>
    <br><br>
    <p><i>Made with ❤️ for the Foundry VTT Community</i></p>
</div>

