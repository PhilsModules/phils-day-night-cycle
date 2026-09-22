<div align="center">

# Phil's Day and Night Cycle

![Foundry v14 Compatible](https://img.shields.io/badge/Foundry-v14-brightgreen?style=flat-square) ![Foundry v12 Compatible](https://img.shields.io/badge/Foundry-v12-green?style=flat-square) ![License](https://img.shields.io/badge/License-GPLv3_%2F_CC_BY--NC--ND-blue?style=flat-square)
[![Version](https://img.shields.io/badge/Version-7.2.0-blue?style=flat-square)](https://github.com/PhilsModules/phils-day-night-cycle/releases) [![Patreon](https://img.shields.io/badge/SUPPORT-Patreon-ff424d?style=flat-square&logo=patreon)](https://www.patreon.com/PhilsModules)

<br>

**Bring your world to life with a beautiful, immersive clock widget.**
<br>
_Erwecke deine Welt zum Leben mit einem wunderschönen und immersiven Uhr Widget._

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
> ### Kompatibilität / Compatibility
>
> **English:** This module works **standalone** and includes a full calendar system. It manages time and date natively using the reliable time tracking built into Foundry. No other calendar modules are required.
>
> **Deutsch:** Dieses Modul funktioniert **eigenständig** und enthält ein vollwertiges Kalendersystem. Es verwaltet Zeit und Datum nativ über die eingebaute Zeiterfassung von Foundry. Es werden keine weiteren Module für den Kalender benötigt.
>
> ---
>
> ### Vikingar Preview / Sneak Peek
>
> **English:** This version includes the new **Vikingar** calendar preset. This is a sneak preview of my upcoming **Viking Pathfinder 2 Supplement** featuring: **24** Classes, **31** Backgrounds, **1974** Feats, **939** Spells, **22** Ancestries, and **483** Items.
>
> **Deutsch:** Diese Version enthält das neue **Vikingar** Kalender-Preset. Dies ist eine Sneak Preview auf mein kommendes **Wikinger Pathfinder 2 Supplement** mit: **24** Klassen, **31** Hintergründen, **1974** Talenten, **939** Zaubern, **22** Abstammungen und **483** Gegenständen.

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

Phil's Day and Night Cycle adds a visually appealing clock that automatically syncs with the Foundry World Time. It shows not just the time but the current phase of day like Morning, Noon, Evening or Night in a beautiful design.

-> **[Detailed Climate Zone Guide](climate_zones.md)** - Learn about the different climates and their lighting times.

## Key Features

- **🌪️ Revolutionary 360° Wind & Precipitation Physics (Real-Time Kinematics):**
  - *True 360° Wind Trajectory:* Raindrops and snow no longer fall in rigid vertical video loops. Every single drop is physically propelled across the canvas according to the active 360° wind angle and Beaufort velocity (e.g. howling southwest storms sweep rain diagonally from bottom-left to top-right, while dead calm produces heavy vertical downpours).
  - *Directional Ground Splashes:* Every droplet calculates its precise terrain impact coordinate, exploding into fine water droplets distributed along the droplet's flight vector—with authentic surface ripples and spray on water bodies.
  - *Needle-Fine Clarity at Any Zoom:* Raindrops stay razor-sharp, luminous water streaks from micro 5 ft tavern encounters up to 20,000-pixel regional overviews without pixelation or blur.
- **☁️ Volumetric Cloud Deck Breakthrough & Living Cloud Shadows:**
  - *Cinematic High-Altitude Cloud Decks:* On continental and regional maps, cameras hover above thick, volumetric 3D cloud formations and drifting storm fronts.
  - *Smooth Cloud Deck Breakthrough:* As you zoom down into streets and buildings, the camera **smoothly breaks through the cloud ceiling**—the white cloud bodies vanish so your tokens, furniture, and tactical 5 ft battle maps stay 100% visible, bright, and unobstructed!
  - *Synchronized Cloud-Rain Coupling (Natural Rain Lulls):* Rain falls dynamically where cloud shadows pass overhead! As cloud fronts drift across the landscape, localized downpours sweep over the terrain and give way to organic rain pauses and breaking sunlight.
  - *Solar Arc Sun-Position Shadow Engine:* Ambient ground shadows of trees and buildings dynamically shift their length and angle in real time according to the time of day (long dawn shadows stretching westward, overhead noon shadows, and long eastward evening shadows).
- **🎚️ Configurable Particle & Effect Scaling (Live Preview):** Fine-tune raindrop, snow, and splash size from 40% to 300% via a live slider with instantaneous real-time preview on your active battle map.
- **⚡ Multi-Pulse Thunderstorms with Flash Shield Mode (Accessibility):** Organic lightning intervals (14–20s) with rumbling thunder, cinematic soft violet-blue sky glow, and a dedicated individual client toggle to disable screen flashing for photosensitive players.
- **🧭 Live Wind Compass in Clock Widget & Calendar Integration:** Real-time rotating wind compass in the clock widget with Beaufort color coding and automatic daily chronicle weather logging.
- **🚀 Hardware Performance Profiles & Viewport-Focused Rendering:** Viewport culling engine concentrates particles strictly in the visible camera viewport, maintaining smooth 60+ FPS on massive 20,000-pixel canvas maps across 4 selectable hardware profiles (Ultra 135%, Balanced 100%, Laptop Saver 45%, Atmosphere Only 0%).
- **🎛️ Interactive On-Canvas Weather & Cloud Calibrator (v7.2.0):** A dedicated tool group on Foundry's left toolbar lets you tune clouds, sun rays, rain particles, and cloud breakthrough height in real time with live sliders — directly on the canvas, no menus required. Save per-scene or apply as global defaults with a single click.
- **☀️ Day-Aware Sunbeams & Night-Only Aurora (v7.2.0):** Golden sun rays now fade and extinguish as scene darkness rises — they never burn through a midnight sky. The aurora borealis awakens only after true darkness falls and vanishes completely in daylight, making sunbeams and northern lights mutually exclusive as nature intended. Aurora curtains are now narrower, softer, and confined to the upper portion of the battlemap for a realistic distant shimmer.
- **🗺️ Strict Battlemap Boundaries for All Atmospheric Effects (v7.2.0):** Sun rays, auroras, rainbows, heat waves, divine light shafts, halos, underwater ripples, and ambient lightning are now strictly clipped to the active battlemap borders — no bleed into the dark canvas padding.
- **🎭 Complete Multi-Genre Weather Narrator (v7.0.0):** 1,200 handcrafted weather events across all 15 global climate zones with 4,800 unique narrative weather reports in 4 distinct styles (Fantasy, Modern, Sci-Fi, Classic) in German and English.

- **🎨 Cinematic Overcast Day-Grading:** Smooth daylight desaturation and cool atmospheric slate grading during rainstorms, with built-in indoor suppression masking for bright, warm building interiors and caves.
- **🌍 Universal Unit & Grid Normalizer:** Automatically supports any grid size and unit (feet, miles, kilometers, meters, leagues, yards, and hexes).
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

### 4. Living Weather Engine, Atmospheric Physics & Multi-Genre Narrators

Phil's Day and Night Cycle features a next-generation weather simulation that turns atmospheric conditions from a passive visual overlay into an active, immersive storytelling tool.

#### 🎭 Multi-Genre Weather Narrators (v7.0.0)
Instead of generic, one-size-fits-all weather messages, PDNC introduces **4 fully realized, handcrafted narrative styles**. Every single one of the **15 global climate zones** features **1,200 unique handcrafted weather reports** across all 4 seasons (4,800 reports per language!):

1. 🏰 **Fantasy / Historical:**
   - *Tone & Style:* Dramatic, diegetic announcements delivered directly to the populace by town criers, heralds, watch captains, and caravan leaders.
   - *Example:* > *"Hear ye, all citizens, wanderers, and travelers! A violent gale sweeps from the northern crags, secure your shutters, tether the beasts, and avoid the open pass until the storm subsides!"*
   - *Best For:* D&D 5e, Pathfinder 2e, The Dark Eye (DSA), Warhammer Fantasy, and medieval-historical campaigns.

2. 📻 **Modern / Realistic:**
   - *Tone & Style:* Natural, professional radio and TV weather forecasts featuring realistic temperature spans, wind velocities, barometric pressure notes, and actionable travel warnings—completely free of robotic boilerplate.
   - *Example:* > *"Local weather update: Overcast morning with intermittent showers tapering off by midday. Temperatures ranging from 12°C to 16°C with moderate westerly gusts up to 35 km/h."*
   - *Best For:* Call of Cthulhu, Delta Green, World of Darkness, modern urban fantasy, and post-apocalyptic survival games.

3. 🤖 **Sci-Fi / Cyberpunk:**
   - *Tone & Style:* Crisp, technical atmospheric telemetry, orbital scanner readings, ionospheric particle density reports, and environmental hazard warnings without bureaucratic clutter or meaningless brackets.
   - *Example:* > *"Atmospheric Telemetry: Sub-zero cold front advancing across sector 04. Wind speeds sustained at 65 km/h with heavy crystalline precipitation. Exosuit thermal regulation recommended."*
   - *Best For:* Cyberpunk RED, Starfinder, Mothership, Alien RPG, Lancer, and space exploration adventures.

4. 📜 **Classic / Minimalist:**
   - *Tone & Style:* Atmospheric, single-sentence scene descriptions crafted for rapid Gamemaster improvisation and instant table immersion.
   - *Example:* > *"A thick morning fog rolls silently over the marshlands, muffling all sound under a damp white veil."*
   - *Best For:* Quick GM reference, minimalist systems, and traditional tabletop style.

🎮 **1-Click Welcome Chat Card:**
On your first session with v7.0.0, the Gamemaster automatically receives an interactive private welcome chat card in Foundry VTT. Simply click on your preferred genre button (*Fantasy*, *Modern*, *Sci-Fi*, or *Classic*) to set the narrator tone for your entire campaign with a single click. You can also switch styles anytime in the module settings.

---

#### 🌧️ Kinematic Top-Down Rain Physics & Real 360° Wind Trajectory
Traditional VTT weather effects simply scroll a flat, vertical transparent video over your screen. PDNC completely replaces this with a **custom GPU-accelerated kinematic particle engine**:
- 🧭 **True 360° Wind-Driven Flight:** Raindrops, snowflakes, and ash are physically carried across the screen by the active wind angle. A blustering southwest gale sweeps rain dynamically from bottom-left to top-right, while dead calm produces steep, heavy vertical downpours.
- 💧 **Directional Ground Impact Splashes:** Every single raindrop calculates its precise ground collision point and bursts into organic splash droplets that spray naturally in the droplet's flight direction.
- 🔍 **Dynamic Zoom-LOD & Needle-Fine Streaks:** Whether viewing a tiny 5 ft tavern brawl or a giant 500 ft district map, raindrops adapt to your camera magnification. They stay needle-thin and crisp rather than turning into thick, pixelated bars when zooming in.
- 🎯 **Viewport-Focused Particle Clustering:** Rather than wasting GPU power calculating rain over unseen miles of a 20,000-pixel canvas, particles are generated exclusively within your active camera viewport for silky-smooth 60+ FPS.

---

#### ☁️ Cloud Deck Breakthrough & Real-Time Solar Arc Shadows
- ✈️ **Atmospheric Altitude Simulation:** When zoomed out on high-altitude regional and continental maps, you see majestic volumetric cloud formations rolling across the landscape from above.
- 🪂 **Seamless Ground Breakthrough:** As you zoom in to inspect tactical battle maps, your camera smoothly dives *through* the cloud deck. The white cloud tops gently fade away, guaranteeing 100% crystal-clear visibility for tokens, rooms, and furniture.
- ☀️ **Real-Time Sun Position Shadows:** Soft ambient cloud shadows glide across the ground, and their length and angle are dynamically driven by the real-time sun position from the Solar Arc clock widget!
- 🎨 **Cinematic Overcast Grading & Indoor Masking:** Stormy weather applies a smooth overcast slate daylight filter to outdoor areas, while indoor building interiors, taverns, and caves stay warm, bright, and dry.

---

#### ⚡ Multi-Pulse Thunderstorms & Accessibility Flash Shield
- 🌩️ **Realistic Storm Cadence:** Thunderstorms feature realistic 14–20 second pauses with rumbling thunder and rain lulls rather than disorienting rapid strobes.
- 💜 **Soft Violet-Blue Sky Illumination:** Blinding, eye-straining pure white flashes are replaced with a soft, cinematic violet-blue ambient illumination that lights up the scene dramatically without blinding the players.
- 🛡️ **Personal Flash Shield (Accessibility):** Players with epilepsy, migraines, or light sensitivity can toggle off screen flashes individually in client settings without affecting other players or disabling rain, clouds, or storm audio.

---

#### 🧭 Live Wind Compass & Widget Integration
- 🧭 **Dynamic Wind Pointer:** An elegant golden pointer in the clock widget displays the active wind direction and wind velocity in real time.
- 🎨 **Beaufort-Scale Color Coding:** The pointer dynamically shifts colors to reflect wind intensity:
  - 🟡 *Soft Gold:* Light breeze (Calm to Gentle).
  - 🟠 *Warm Amber:* Moderate to Strong wind.
  - 🔴 *Vivid Alarm-Red:* Gales, Blizzards, and Storms.
- 📜 **Calendar Logbook Integration:** Wind direction and Beaufort strength are automatically recorded in the daily calendar log for historical tracking and travel calculations.

---

#### 🚀 Hardware Performance Profiles
Tailor the rendering engine to your exact hardware setup with 4 pre-tuned performance profiles:
- 🚀 **Ultra / Cinema (135% Particle Density):** Maximum atmospheric saturation for high-end gaming desktops.
- ⚖️ **Balanced (100% Particle Density • Default):** The recommended standard profile for smooth performance and rich visuals.
- 🥔 **Laptop / Battery Saver (45% Particle Density):** Lightweight rendering optimized for integrated graphics, older laptops, and mobile devices.
- ⚡ **Atmosphere Only (0% Particles):** Completely turns off active particle simulations while preserving cloud shadows, color grading, and lighting transitions.

---

#### 🎛️ Interactive On-Canvas Weather & Cloud Calibrator (v7.2.0)
A brand-new dedicated tool group on Foundry's left toolbar gives you full live control over every atmospheric visual — directly on the canvas without opening a single menu:
- 🎚️ **Real-Time Cloud & Particle Sliders:** Adjust cloud breakthrough height, particle size, sun ray intensity, and more with live sliders that update the scene instantly in the current frame.
- 📌 **Draggable Altitude Pin:** Slide the integrated red pin along the camera altitude bar to set exactly where the cloud deck opens up — or click **"Set Current Zoom as Breakthrough"** to lock in your current camera height.
- 💾 **Per-Scene or Global Defaults:** Save your calibrations permanently for the active scene with one click, or apply them as the default for all future maps in your world.
- ☀️ **Day-Aware Sun Rays:** Golden sunbeams only appear when the sky is bright. As the world grows dim — through the darkness slider or the natural day/night cycle — the light shafts gently fade and extinguish, just like real sunlight at dusk. They will never burn through a midnight sky.
- 🌌 **Night-Only Northern Lights:** The aurora borealis awakens only as true darkness falls and vanishes completely in daylight. Auroras and sun rays are mutually exclusive — as it should be in nature. The curtains are now narrower, more delicate, and confined to the upper portion of the battlemap for a realistic distant shimmer.
- 🗺️ **Strict Battlemap Clipping:** Sun rays, auroras, rainbows, heat waves, divine light shafts, halos, and all other atmospheric effects are now strictly clipped to the active battlemap borders — no bleed into the dark canvas padding.

---

#### ⚙️ Configuring Weather
- Every morning, a configuration window automatically opens for the GM to set or inspect the day's weather.
- Change the weather manually anytime by clicking the small **Cloud Icon** on the clock widget.
- The **Post Weather GM Notes** setting embeds system-specific rule notes (e.g. visibility or movement penalties) directly into the generated chat card.

> [!IMPORTANT]
> **Note on Weather Changes & Effects:**  
> Newly selected weather effects, modified climate zones, or custom climate settings take effect upon the **next generated weather cycle** (e.g. advancing to the next day or clicking the **Cloud Icon** in the clock widget to generate/re-roll the weather).

### 5. Custom Climate Zones

1.  Open the **Module Settings**.
2.  Click the **Manage Custom Climates** button.
3.  Create a new climate zone such as Desert or Ice World.
4.  Add weather entries for each season (Spring, Summer, Autumn, Winter).
    - **Text:** The description posted to chat (example "A sandy wind is blowing").
    - **Temp:** The temperature range (example "30 to 40").
    - **FX:** The visual effect (example "FOG" for sandstorms).
    - **Weather Traits (optional):** Special weather traits such as storm, strong wind, or fog.
5.  Save your climate zone.
6.  Select it in the main settings under **Climate Zone**.

### 6. Weather Mixer & Composer

Want to create your own unique weather? Open the **Weather Mixer** by clicking the Flask Icon in the Weather Configuration window.

- **Layering:** Combine multiple effects (e.g. Rain + Fog + Wind).
- **Customization:** Fully control every aspect of the simulation:
  - **Particles:** Adjust Density, Speed, Size, and Direction.
  - **Visual Effects:** Tweak Color, Intensity, and Speed of atmospheric filters.
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

### 8. Macros

You can control the clock using Script Macros. Create a new Macro, set the type to **Script**, and paste the code below.

**Toggle Clock Visibility**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggle();
```

**Toggle Clock Face (Fold / Expand)**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggleClockFace();
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

**Eine elegante Uhr per Drag and Drop für Foundry VTT.**

Phil's Day and Night Cycle fügt eine visuell ansprechende Uhr hinzu welche sich automatisch mit der Weltzeit in Foundry synchronisiert. Sie zeigt nicht nur die Uhrzeit an sondern visualisiert auch die aktuelle Tagesphase wie Morgen, Mittag, Abend oder Nacht in einem wunderschönen Design.

-> **[Detaillierter Guide zu Klimazonen](klimazonen.md)** - Erfahre alles über die verschiedenen Klimate und ihre Lichtzeiten.

## Funktionen

- **🌪️ Revolutionäre 360° Wind- & Niederschlags-Physik (Echtzeit-Kinematik):**
  - *Echte 360°-Windflugbahn:* Regentropfen, Schnee und Asche fallen nicht mehr als starre senkrechte Video-Schleife. Jeder einzelne Tropfen wird physikalisch exakt entlang des aktuellen 360°-Windwinkels und der Beaufort-Geschwindigkeit über das Spielfeld getrieben (z. B. peitschender Südwest-Sturm von unten links nach oben rechts oder senkrechter Tropenguss bei Windstille).
  - *Richtungsabhängige Bodenspritzer:* Jeder Tropfen berechnet seinen genauen Aufprallpunkt am Boden und zerplatzt in feine Wassertröpfchen, die sich dynamisch entlang des Flugvektors verteilen – inklusive realistischer Gischt und Wellenkreise auf Wasserflächen.
  - *Nadelfeine Schärfe bei jedem Zoom:* Ob 5-Fuß-Kneipenkampf oder 20.000-Pixel-Weltkarte: Regentropfen bleiben gestochen scharf und nadelfein, ohne beim Hineinzoomen zu dicken Pixelbalken zu verschwimmen.
- **☁️ Volumetrischer Wolkendecken-Durchbruch & Lebendige Wolkenschatten:**
  - *Majestätische Höhen-Wolkendecke:* Auf Kontinent-, Regional- und Stadtkarten schwebt die Kamera über dichten, dreidimensionalen Wolkenbänken und ziehenden Sturmfronten.
  - *Fließender Wolkendurchbruch:* Zoomt der Spielleiter oder die Gruppe auf das Spielfeld hinab, **durchbricht die Kamera geschmeidig die Wolkendecke**! Die weiße Wolkendecke löst sich auf – Räume, Möbel, Tokens und taktische Kampffelder bleiben zu 100% frei, hell und unverdeckt sichtbar!
  - *Gekoppelte Wolken-Regen-Physik (Natürliche Regenpausen):* Regen fällt realistisch dort, wo Wolkenschatten über das Land ziehen! Wandert eine Wolke über die Karte, setzt der Schauer ein – zieht sie weiter, entstehen organische Regenpausen mit durchbrechendem Sonnenlicht.
  - *Solar-Arc Sonnenstands-Schattenengine:* Schatten von Gebäuden und Bäumen wandern im Tagesverlauf dynamisch mit dem echten Sonnenstand (lange Morgenschatten nach Westen, steile Mittagsschatten, lange Abendschatten nach Osten).
- **🎚️ Einstellbare Partikel- & Effektgröße (Live-Vorschau):** Passe die Größe von Regentropfen, Schnee und Spritzern von 40% bis 300% per Schieberegler mit sofortiger Live-Vorschau auf deiner aktiven Karte an.
- **⚡ Multi-Puls-Gewitter mit Blitz-Schutzmodus (Barrierefreiheit):** Atmosphärische Blitzintervalle (14–20s) mit fernem Donnergrollen, weichem blau-violettem Himmelsleuchten und eigenem Client-Schalter für fotosensible Spieler zur Deaktivierung von Bildschirmblitzen.
- **🧭 Live-Windkompass im Zeit-Widget & Kalender:** Echtzeit-rotierende Windrose im Zifferblatt mit Beaufort-Farbkodierung und automatischer Protokollierung in den täglichen Kalender-Chroniken.
- **🚀 Hardware-Leistungsprofile & Viewport-Culling:** Frustum-Culling berechnet Partikel ausschließlich im sichtbaren Bildschirmfenster für 60+ FPS auf 20.000px-Karten über 4 Leistungsprofile (Ultra 135%, Ausgewogen 100%, Laptop-Sparmodus 45%, Nur Atmosphäre 0%).
- **🎛️ Interaktiver Karten-Wetter-Kalibrator (v7.2.0):** Eine neue Werkzeuggruppe in der linken Foundry-Leiste ermöglicht die Live-Anpassung von Wolken, Sonnenstrahlen, Regenpartikeln und Wolkendurchbruch-Höhe direkt auf der Karte — ohne ein einziges Menü zu öffnen. Speicherbar pro Szene oder als globale Voreinstellung.
- **☀️ Tagesabhängige Sonnenstrahlen & Nur-Nacht-Polarlichter (v7.2.0):** Goldene Sonnenstrahlen verblassen mit zunehmender Dunkelheit und erlöschen bei Nacht vollständig. Das Nordlicht erwacht erst, wenn echte Dunkelheit einbricht, und verschwindet tagsüber — Sonnenstrahlen und Polarlichter schließen sich gegenseitig aus. Die Vorhänge sind schmaler, gedämpfter und auf den oberen Kartenbereich begrenzt.
- **🗺️ Strikte Battlemap-Grenzen für alle Atmosphären-Effekte (v7.2.0):** Sonnenstrahlen, Polarlichter, Regenbögen, Hitzewellen, Lichtsäulen, Halos und Unterwasser-Verzerrungen bleiben nun strikt auf die aktive Battlemap begrenzt — kein Ausbluten mehr in den schwarzen Rand.
- **🎭 Multi-Genre Wetter-Erzähler (v7.0.0):** 1.200 handgeschriebene Wetterlagen über alle 15 weltweiten Klimazonen mit 4.800 einzigartigen Erzählerberichten in 4 Stilen (Fantasy, Modern, Sci-Fi, Klassisch) in Deutsch und Englisch.

- **🎨 Atmosphärische Regentag-Lichtstimmung:** Sanfte Entsättigung und kühle Tageslicht-Stimmung bei Regen, mit automatischer Innenraum-Maskierung für warme, helle und trockene Gebäude und Höhlen.
- **🌍 Universeller Einheiten- & Gitter-Normalisierer:** Unterstützt automatisch alle Gitter-Größen und Einheiten (Fuß, Meilen, Kilometer, Meter, Seemeilen, Yards und Hexes).
- **Regel-Integration für Wetter:** Andere Systeme oder Content-Module können SL-exklusive Wetter-Regelhinweise in die erzeugten Wetterkarten einspeisen.
- **Simple-Calendar-Migration:** Importiert den aktuell aktiven Simple-Calendar-Kalender als PDNC-Kalender und übernimmt kompatible Notizen oder Ereignisse.
- **Dynamische Phasen:** Beliebig viele Phasen erstellen, löschen oder umbenennen in der Theme-Konfiguration.
- **Intelligentes Uhr-Mapping:** Das Zifferblatt mappt automatisch jede Phasenanzahl (auch nur 2 oder 4) auf die 8 visuellen Segmente.
- **Automatische Effekte:** Das Wetter erzeugt automatisch passende Effekte für Regen, Schnee, Nebel oder Sturm in deiner Szene.
- **Intelligente Beleuchtung:** Die Helligkeit der Szene passt sich automatisch an Tageszeit, Jahreszeit und Bewölkung an.
- **Wunderschönes Design:** Ein hochwertiges Widget im Premium Look mit integrierter Wetteranzeige.
- **Mondzyklus:** Die Uhr zeigt die aktuelle Mondphase (Zunehmend, Voll, Abnehmend, Neu) synchron zum Kalenderdatum an.
- **Benutzerdefinierte Bilder:** Lade ganz einfach dein eigenes Bild für das Zifferblatt hoch.
- **Drag and Drop:** Platziere die Uhr frei an jeder beliebigen Stelle auf deinem Bildschirm.
- **Integration des Kalenders:** Ein Klick öffnet den vollwertigen Kalender mit automatischem Logbuch als Wetterbericht.
- **Notizen und Events:** Erstelle öffentliche Ereignisse sowie Notizen für den GM oder die ganze Gruppe.
- **Zeitreise:** Nutze die Zeitmaschine um zu jedem beliebigen Datum zu springen (nur für den GM).
- **Unterstützung vieler Systeme:** Unterstützt Golarion für PF2e, Harptos für D&D 5e, den Gregorianischen Kalender sowie den neuen **Vikingar** Kalender.

## Installation

1.  Öffne Foundry VTT.
2.  Gehe zum Reiter **Addon Modules**.
3.  Klicke auf **Install Module**.
4.  Füge die folgende **Manifest URL** unten ein:
    ```
    https://github.com/PhilsModules/phils-day-night-cycle/releases/latest/download/module.json
    ```
5.  Klicke auf **Install**.

## Bedienung

### 1. Die Uhr

Du findest die Uhr standardmäßig unten rechts.

- **Verschieben:** Ziehe das Widget einfach mit der Maus an jeden beliebigen Bildschirmrand.
- **Intelligente Ausrichtung (Smart Positioning):** Im *Automatisch (Smart)*-Modus erkennt die Uhr Bildschirmränder selbstständig. Am oberen Rand öffnet sich das Zifferblatt z. B. unter dem Bedienfeld, am linken Rand rechts davon usw.
- **Schnell-Ausrichtung per Rechtsklick:** Mache einen **Rechtsklick auf das Uhr-Icon** im Bedienfeld, um ein diamantförmiges Schnellmenü zu öffnen. Dort kannst du mit 1 Klick bestimmen, wo das Zifferblatt aufklappen soll (`Oben ⬆️`, `Unten ⬇️`, `Links ⬅️`, `Rechts ➡️` oder `Smart Auto 🪄`).
<div align="center">
<img src="https://github.com/PhilsModules/phils-day-night-cycle/blob/main/3x3.png" alt="Preview" width="400">
</div>

- **Ausblenden:** Klicke auf das Uhr-Icon, um das Zifferblatt ein- oder auszuklappen (der Pfeil wird dabei sauber ausgeblendet).
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
- **Aus Simple Calendar importieren:** Öffnet das eingebaute Migrationstool, um den aktuell aktiven Simple-Calendar-Kalender nach PDNC zu übernehmen und optional Notizen oder Ereignisse zu migrieren.

### 4. Lebendige Wetter-Engine, Atmosphären-Physik & Multi-Genre Erzähler

Phil's Day and Night Cycle bietet eine simulationsstarke Wetter-Engine der nächsten Generation, die atmosphärische Wetterlagen von einer rein passiven Video-Überlagerung in ein lebendiges, immersives Spielleitungs- und Erzählwerkzeug verwandelt.

#### 🌪️ Kinematische 360° Wind- & Niederschlags-Physik
Herkömmliches VTT-Wetter scrollt meist nur ein starres, senkrechtes Video über den Bildschirm. PDNC ersetzt dies durch eine **vollwertige GPU-beschleunigte Partikel-Physikengine**:
- 🧭 **Echte 360°-Windflugbahn:** Regentropfen, Schneeflocken und Aschepartikel werden in Echtzeit physikalisch von der Windrichtung über das Spielfeld getrieben. Weht beispielsweise Südwestwind, fliegt der Regen dynamisch von unten links nach oben rechts; bei Windstille fällt er steil und kraftvoll nach unten.
- 💧 **Organische Richtungs-Wasserspritzer:** Jeder einzelne Regentropfen berechnet seinen exakten Aufprallpunkt am Boden und zerplatzt in filigrane Wassertröpfchen, die sich dynamisch in Flugrichtung des Tropfens verteilen – inklusive realistischer Gischt und Wellen auf Gewässern!
- 🔍 **Dynamischer Zoom-LOD & Nadelfeine Linien:** Ob 5-Fuß-Kneipenkampf oder 500-Fuß-Stadtviertelkarte: Regentropfen passen sich automatisch der Kameravergrößerung an. Sie bleiben immer gestochen scharf und nadelfein, statt beim Hineinzoomen zu dicken Pixelbalken zu mutieren.
- 🎯 **Viewport-Fokussiertes Clustering:** Statt Partikel ungesehen über meilenweite 20.000-Pixel-Karten zu verschwenden, werden sie ausschließlich im sichtbaren Bildschirmfenster gerendert – für butterweiche 60+ FPS.

---

#### ☁️ Wolkendecken-Durchbruch, Lebendige Wolkenschatten & Organische Regenpausen
- ✈️ **Majestätische Höhen-Wolkendecke:** Auf großen Regions- und Kontinentalkarten schwebt die Kamera über einer dichten, dreidimensionalen Wolkendecke mit ziehenden Sturmfronten.
- 🪂 **Geschmeidiger Wolkendurchbruch beim Hineinzoomen:** Zoomt man an das Spielgeschehen heran, taucht die Kamera geschmeidig *durch* die Wolkendecke ab. Die weiße Wolkenschicht löst sich auf, sodass Spielfiguren, Möbel und Räume auf taktischen Kampfkarten zu 100% frei und unverdeckt sichtbar bleiben!
- 🌧️ **Synchronisierte Wolken-Regen-Physik:** Regen fällt realistisch dort, wo gerade ein Wolkenschatten über das Spielfeld zieht! Zieht eine Wolkenfront weiter, entstehen **natürliche Regenpausen mit durchbrechendem Sonnenlicht**.
- ☀️ **Echtzeit-Kopplung an den Sonnenstand:** Weiche, wandernde Wolkenschatten gleiten über den Boden – ihre Richtung und Länge werden in Echtzeit durch den echten Sonnenstand aus dem Zeituhr-Widget gesteuert (Morgenschatten nach Westen, Mittagsschatten, Abendschatten nach Osten).
- 🎨 **Kinematisches Regentags-Licht & Innenraum-Maskierung:** Regenwetter erzeugt automatisch eine stimmungsvolle Tageslicht-Dämpfung auf Außenkarten, während Tavernen, Gebäudeinnenräume und Höhlen hell, warm und trocken bleiben.

---

#### ⚡ Lebendiges Multi-Puls-Gewitter & Blitz-Schutzmodus
- 🌩️ **Realistische Gewitterpausen:** Blitze entladen sich nicht stroboskopartig im Sekundentakt. PDNC nutzt atmosphärische 14–20 Sekunden Pausen mit fernem Donnergrollen, prasselndem Regen und feinen Nachblitzen.
- 💜 **Weiches blau-violettes Himmelsleuchten:** Grelle, blendende Weißblitze wurden durch ein kinematisches, blau-violettes Aufleuchten der Szene ersetzt, das dramatisch wirkt, ohne die Augen der Spieler zu überanstrengen.
- 🛡️ **Persönlicher Blitz-Schutzmodus (Barrierefreiheit):** Spieler mit Lichtempfindlichkeit, Migräne oder Epilepsie können Blitzeffekte für ihren eigenen Bildschirm in den Einstellungen deaktivieren, während Regen, Wolken und Gewittersound aktiv bleiben.

---

#### 🧭 Live Wind-Kompass im Zeit-Widget & Kalender
- 🧭 **Dynamischer Windpfeil im Widget:** Ein eleganter goldener Zeiger zeigt in Echtzeit die aktuelle Windrichtung und Windstärke direkt im Zeituhr-Widget an.
- 🎨 **Beaufort-Farbstufen:** Der Pfeil passt seine Farbe dynamisch an die Windstärke an:
  - 🟡 *Sanftes Gold:* Leichte Brise (Windstille bis mäßig).
  - 🟠 *Warmes Bernstein:* Frischer bis starker Wind.
  - 🔴 *Feuriges Alarm-Rot:* Stürme, Blizzards und Orkane.
- 📜 **Kalender-Protokollierung:** Windrichtung und Beaufort-Stärke werden automatisch in den täglichen Kalenderberichten dokumentiert.

---

#### 🚀 Hardware-Leistungsprofile
Passe die Rendering-Engine mit 4 vordefinierten Leistungsprofilen an deine Hardware an:
- 🚀 **Ultra / Kino (135% Partikeldichte):** Maximale Dichte und visuelle Brillanz für leistungsstarke Gaming-PCs.
- ⚖️ **Ausbalanciert (100% Partikeldichte • Standard):** Die empfohlene Standard-Einstellung für reibungslose Performance und schöne Optik.
- 🥔 **Laptop / Stromsparmodus (45% Partikeldichte):** Ressourcenschonende Berechnung für integrierte Grafikkarten und Mobilgeräte.
- ⚡ **Nur Atmosphäre (0% Partikel):** Schaltet bewegte Partikel ab und behält nur Wolkenschatten, Lichtstimmungen und Farbfilter bei.

---

#### 🎛️ Interaktiver Karten-Wetter-Kalibrator (v7.2.0)
Eine völlig neue Werkzeuggruppe in Foundrys linker Werkzeugleiste gibt dir vollständige Live-Kontrolle über alle atmosphärischen Effekte — direkt auf der Karte, ohne ein einziges Menü:
- 🎚️ **Echtzeit-Schieberegler:** Passe Wolkendurchbruch-Höhe, Partikelgröße, Sonnenstrahl-Intensität und mehr per Schieberegler an — die Szene aktualisiert sich sofort im laufenden Betrieb.
- 📌 **Verschiebbarer Höhen-Pin:** Schiebe den roten Pin auf der Kamera-Höhenleiste genau dorthin, wo die Wolkendecke aufbrechen soll — oder klicke **„Aktuellen Zoom als Durchbruch setzen"**, um die aktuelle Kamerahöhe zu übernehmen.
- 💾 **Pro-Szene oder global speichern:** Speichere deine Einstellungen dauerhaft für die aktive Szene oder übernimm sie als Standard für alle zukünftigen Karten der Welt.
- ☀️ **Tagesabhängige Sonnenstrahlen:** Goldene Lichtstrahlen erscheinen nur bei hellem Tageslicht. Mit steigender Dunkelheit verblassen sie sanft und erlöschen vollständig — wie echtes Sonnenlicht in der Dämmerung. Bei Nacht leuchtet kein Sonnenstrahl mehr.
- 🌌 **Polarlichter nur bei Nacht:** Das Nordlicht erwacht erst, wenn echte Dunkelheit einfällt, und verschwindet tagsüber vollständig. Sonnenstrahlen und Polarlichter schließen sich gegenseitig aus — genau wie in der Natur. Die Vorhänge sind nun schmaler, gedämpfter und auf den oberen Bereich der Battlemap begrenzt.
- 🗺️ **Strikte Battlemap-Begrenzung:** Sonnenstrahlen, Polarlichter, Regenbögen, Hitzewellen, göttliche Lichtsäulen, Halos und alle weiteren atmosphärischen Effekte sind nun strikt auf die aktive Battlemap begrenzt — kein Ausbluten in den schwarzen Rand.

---

#### ⚙️ Konfiguration des Wetters
- Jeden Morgen öffnet sich automatisch ein Fenster für den Spielleiter, in dem das Wetter für den neuen Tag bestimmt werden kann.
- Du kannst das Wetter auch jederzeit manuell ändern, indem du auf das kleine **Wolken-Icon** in der Zeituhr klickst.
- Die Einstellung **SL-Wetternotizen im Chat** bettet systemspezifische Regelhinweise (z. B. Sicht- oder Bewegungsmali) direkt in die erzeugte Wetterkarte ein.

> [!IMPORTANT]
> **Hinweis zu Wetter-Effekten & Änderungen:**  
> Neu ausgewählte oder geänderte Wetter-Effekte, Klimazonen oder eigene Klimaeinstellungen greifen erst beim **nächsten neu generierten Wetter** (z. B. beim Weiterschalten auf den nächsten Tag oder beim manuellen Neugenerieren über das **Wolken-Icon** im Zeituhr-Widget).

### 5. Eigene Klimazonen erstellen

1.  Öffne die **Moduleinstellungen**.
2.  Klicke auf den Button **Manage Custom Climates**.
3.  Erstelle eine neue Klimazone wie zum Beispiel Wüste oder Eiswelt.
4.  Füge für jede Jahreszeit (Frühling, Sommer, Herbst, Winter) Einträge für das Wetter hinzu.
    - **Text:** Die Beschreibung die im Chat gepostet wird (zum Beispiel "Ein sandiger Wind weht").
    - **Temp:** Der Temperaturbereich (zum Beispiel "30 bis 40").
    - **FX:** Der visuelle Effekt (zum Beispiel "FOG" für Sandsturm).
    - **Wetter-Merkmale (optional):** Besondere Wettermerkmale wie Sturm, Wind oder Nebel.
5.  Speichere deine Klimazone ab.
6.  Wähle sie nun in den Haupteinstellungen unter **Climate Zone** aus.

### 6. Wetter Mixer & Komponist

Möchtest du dein ganz eigenes Wetter erschaffen? Öffne den **Wetter Mixer** über das Reagenzglas-Icon im Wetter-Konfigurationsmenü.

- **Schichten:** Kombiniere mehrere Effekte (z.B. Regen + Nebel + Wind).
- **Anpassung:** Volle Kontrolle über jeden Aspekt der Simulation:
  - **Partikel:** Passe Dichte, Geschwindigkeit, Größe und Richtung an.
  - **Visuelle Effekte:** Passe Farbe, Intensität und Geschwindigkeit der Effekte an.
- **Vorschau:** Nutze den **Vorschau** Button, um deinen Mix live auf der Szene zu testen, ohne ihn direkt zu speichern.
- **Favoriten:** Speichere deinen perfekten Sturm in deiner Favoritenliste für sofortigen Zugriff.

### 7. Pathfinder 2e Synchronisation

Dieses Modul bietet eine nahtlose 1-Klick-Integration mit der nativen Weltuhr von Pathfinder 2e.

1. Öffne den **Setup-Assistenten** (startet beim ersten Laden automatisch oder jederzeit über **Moduleinstellungen** -> **Setup Assistent neu starten**).
2. Wähle **Golarion** als Kalendersystem aus.
3. Wenn Pathfinder 2e aktiv ist, zeigt der Assistent automatisch den Bereich **Pathfinder 2e Weltuhr-Abgleich** an.
4. Klicke auf **PF2e ↔ PDNC Zeiten vergleichen & synchronisieren**, um den Live-Vergleich zu öffnen.
5. Klicke auf **PF2e jetzt synchronisieren**, um das Erstellungsdatum der PF2e-Weltuhr direkt an das PDNC Master-Datum anzupassen, ohne `game.time.worldTime` zu verändern (alle Zauberdauern, Effekte und Tagebucheinträge bleiben zu 100% erhalten).
6. Falls der Wochentag abweicht, klicke auf **PDNC Wochenstart angleichen**, um auch die Wochentage perfekt abzugleichen.
7. Fertig! Beide Systeme sind synchronisiert.

### 8. Makros

Du kannst die Uhr auch über Makros steuern. Erstelle dafür ein neues Makro vom Typ **Script** und füge den jeweiligen Code ein.

**Uhr einblenden oder ausblenden**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggle();
```

**Zifferblatt ein-/ausklappen**

```js
if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggleClockFace();
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

**Integration von Wetter-Regeln**

Andere Systeme oder Setting-Module können einen Provider registrieren und systemeigene Regelhinweise in die Wetterkarte einfügen, ohne dass die Kernlogik dieses Moduls angepasst werden muss.

Der Provider erhält jetzt ein `weather`-Objekt, das visuelle Effekte und Regelbedeutung trennt:

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
        "Offene Flammen gehen aus, wenn sie nicht geschützt sind."
      ]
    };
  });
});
```

Für einfache synchrone Integrationen kannst du alternativ den Hook `pdnc.collectWeatherRules` nutzen. Ein Provider darf einen einzelnen Abschnitt oder ein Array von Abschnitten zurückgeben. Ein Abschnitt kann an `gm` oder `public` gehen, gedacht ist das Feature aber primär für SL-Hinweise.
Wenn dein eigenes Modul Klimaeinträge importiert oder generiert, kannst du dort direkt ein `tags`-Array mitgeben und PDNC reicht es an alle Wetter-Regelprovider weiter.

**Simple-Calendar-Migration**

PDNC bringt außerdem ein eingebautes Migrationstool für das Modul `foundryvtt-simple-calendar` mit.

- Öffne die **Moduleinstellungen** und nutze **Aus Simple Calendar importieren**.
- Das Tool liest den aktuell aktiven Simple-Calendar-Kalender, legt daraus einen PDNC-Kalender an und kann kompatible Notizen als PDNC-Ereignisse übernehmen.
- Wenn du mehrere Simple-Calendar-Kalender nutzt, aktiviere zuerst dort den gewünschten Quellkalender und starte danach den Import in PDNC.
- Die Synchronisation von aktuellem Datum und Uhrzeit wird nur angeboten, wenn die Quelle ein Standard-Zeitschema mit `24 / 60 / 60` verwendet.

<br>

---


<br>

## Custom Calendar JSON Example / Beispiel Kalender JSON

<br>

_If you want to import a calendar manually, you can use this structure:_
<br>
_Falls du einen Kalender manuell importieren möchtest, kannst du diese Struktur verwenden:_

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
    <p>Gefällt dir das Modul? Unterstütze die Weiterentwicklung auf Patreon.</p>
    <a href="https://www.patreon.com/PhilsModules">
        <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron" width="200" />
    </a>
    <br><br>
    <p><i>Made for the Foundry VTT Community</i></p>
</div>
