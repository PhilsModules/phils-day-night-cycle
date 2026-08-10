## v5.1.9 - Toggle Macro Repair & Macro Directory Folder Organization

- **⏰ Reliable Clock Toggle Macro:** Fixed an issue where the clock visibility macro stopped hiding and showing the clock widget. The macro now works reliably across all scenes.
- **📁 Organized Macro Directory Folder:** All module macros (*Toggle Day/Night Clock*, *Toggle Clock Face (Fold)*, *Reset Clock Position*, *Set Time (Day/Night)*, *Toggle Calendar Window*, and *Dungeon Mode*) are now automatically created and neatly organized inside a dedicated **Phil's Day & Night Cycle** folder in your Macro Directory.
- **⏱️ Clock Face Fold Macro:** Added a handy new macro to quickly fold or expand the circular clock face with a single click, keeping the main time bar in view.


## v5.1.8 - Collapsed Widget Pointer & Arrow Fix

- **⏰ Clean Collapsed Widget:** Restored pointer arrow hiding when the clock face is folded closed. The widget now collapses cleanly into a dark, rounded container without any stray arrows or side bars sticking out in any orientation.


## v5.1.7 - Climate Data Wizard & Window Scrolling Fix

- **☀️ Climate Data Wizard:** Gamemasters can now access the **Climate Data Wizard** directly from the left toolbar under **Lighting Controls** (light bulb icon 💡). This tool allows GMs to easily browse preset weather conditions for any climate zone and season, and apply them instantly to the game world with a single click.
- **📜 Smooth Window Scrolling:** Fixed scrolling behavior inside the Climate Data Wizard so all weather entries can be cleanly scrolled through down to the very bottom of the window.
- **🌐 Full Localization:** Added full English and German translations for the Climate Data Wizard titles and controls.


## v5.1.6 - Clock Fold State Persistence & Fixed Positioning Anchor

- **⏰ Persistent Clock Fold State:** The clock now remembers whether it was expanded or collapsed across session restarts and reloads.
- **⚓ Fixed Widget Position Anchor:** The main widget bar now remains firmly fixed in its place when opening or closing the clock face, opening smoothly without any layout shifting or jumping regardless of orientation.


## v5.1.5 - Clock Orientation & Positioning Fix

- **🧭 Clock Icon Orientation Menu:** Resolved an issue where right-clicking the small clock icon opened the "Orientation" menu at the top-right corner of the screen. The menu now opens cleanly attached right next to the small clock icon.
- **📐 Instant Clock Face Positioning:** Selecting a direction (*Above*, *Below*, *Left*, *Right*, or *Smart Auto*) now immediately shifts the clock face to the chosen side around the control panel.
- **🏹 Dynamic Pointer Alignment:** The small pointer arrow on the time display now automatically aligns towards the open clock face.
- **🌐 Complete Localization:** Added full English and German translations for all direction menu options and titles.


## v5.1.4 - Pathfinder 2e World Clock Window Auto-Open Fix

- **⏱️ Pathfinder 2e World Clock Fix:** Fixed an issue where Pathfinder 2e's native World Clock window ("Weltuhr") was forced open automatically on every world load during background time synchronization. The window now remains closed on startup and only refreshes when explicitly opened by the user.

## v5.1.3 - Weather Mixer UI Repair, Visual Shader Enhancements & Climate Data Audit

- **🎛️ Weather Mixer & UI Control Fixes:** Restored smooth layout alignment and fixed button click handling in the Weather Mixer. Deleting layers and saving favorite presets now work seamlessly without closing or interrupting active dialogs.
- **✨ Enhanced Particle Dynamics:** Upgraded particle movements with natural, multi-harmonic wind eddies for falling leaves, petals, snow, pollen, and ash, paired with immersive 3D depth parallax scaling.
- **🌌 Volumetric Visual Shaders:** Upgraded visual weather filters with realistic multi-strike lightning physics, organic rolling mist tendrils for fog and cloud cover, and golden dust motes floating in sunbeams.
- **🌐 Comprehensive Climate Data Audit:** Audited over 13,000 lines of climate data across both English and German datasets. Corrected broken weather effect links, fixed mismatched weather descriptions (such as fog appearing during stifling heat), and seamlessly linked visual effects for dry lightning storms, sandstorms, blizzards, fireflies, and autumn leaves.
- **🎨 Quest Tracker Window Theme Alignment:** Unified window headers, titles, and control buttons across all module windows to match **Phils Quest Tracker**'s sleek, dark obsidian aesthetic.

## v5.1.2 - Quest Tracker Theme Alignment, Legibility & Performance Improvements

- **🎨 Quest Tracker & Module Theme Alignment:** Unified the look of all module windows (calendar, day viewer, event editor, season config, theme config, moon phase config, time machine, etc.) with the dark matte aesthetic of Phils Quest Tracker.
- **✨ Enhanced Text Legibility:** Fixed pitch-black titles, headings, help notes, labels, and table cells across all dialogs to provide high contrast and readability on dark backgrounds.
- **🛠️ Header Control Icon Restoration:** Resolved an issue where window header control icons (close 'X', menu controls) were rendered as missing font glyph boxes by preserving Font Awesome 6 font rendering.
- **🎛️ Form Controls & Layouts:** Polished input fields, dropdown selects, primary/secondary action buttons, file pickers, and scrollable container areas for clean, responsive alignment.
- **✨ Permanent Date Display:** Month and year names in the calendar header (e.g., *Abadius 4447*) now remain clearly visible in gold at all times without needing to hover over them.
- **🚀 Smooth Window Animations:** Optimized window rendering so opening and closing calendar windows runs butter-smooth without any stuttering or frame drops.
- **🌙 Restored Moon Phase Displays:** Repaired the moon phase badges in the calendar grid, ensuring moon phases once again show in the top right corner of each day.
- **🛡️ Clean Layout Protection:** Isolated the calendar's visual design so module windows look great while leaving standard Foundry sheets and windows completely untouched.

## v5.1.1 - Quest Tracker Integration & Season Configuration Fixes

- **📜 Quest Tracker Integration:** Clicking a quest event in the calendar now directly opens the quest sheet or quest overview from the **Phils Quest Tracker** module. If the Quest Tracker module is not installed, the calendar smoothly uses its built-in quest editor.
- **🌋 Season Configuration Fix:** Fixed an issue where the "Configure Seasons" window failed to open in Pathfinder 2e (Golarion) calendar worlds. Gamemasters can now set start dates for all seasons across all calendar systems.
- **🛡️ Stability & Dialog Handling:** Resolved unexpected crashes when closing or re-rendering calendar windows, ensuring smooth window positioning and background updates.
- **💬 Foundry v13 Compatibility:** Updated internal chat card rendering to prevent compatibility warnings in Foundry v13 while maintaining full support for Foundry v12.
- **🌐 Localization & Setup Wizard Fixes:** Corrected the day header in the Setup Wizard (now displaying *Tag* in German and *Day* in English) and updated missing translations across all dialogs.

## v5.1.0 - Pathfinder 2e Synchronization & Refactored Setup Wizard

> [!IMPORTANT]
> **Important Note Regarding Weekday Display:**  
> Aligning the week start offset with the Pathfinder 2e System may shift the displayed weekday name in the PDNC calendar accordingly. Date, time, and all saved calendar events remain completely untouched and safe!

- **🧭 Universal Setup Wizard:** The Setup Wizard now dynamically adapts to any game system (e.g., DnD 5e, Pathfinder 2e, DSA, Generic) and guides GMs with clean, intuitive explanations.
- **⚖️ Pathfinder 2e World Clock Integration:** When running Pathfinder 2e, the Setup Wizard provides a dedicated integration panel to compare and align with Pathfinder 2e's World Clock.
- **⏱️ Safe 1-Click Time Synchronization:** Gamemasters can compare Pathfinder 2e's native World Clock date, time, and weekday side-by-side with PDNC Master Time and sync them with one click. Active spell durations, status effect timers, and journal logs are preserved 100% without loss.
- **🗓️ Weekday Start Alignment:** Includes a handy 1-click alignment tool to adjust the week start offset so weekdays match between the system and calendar seamlessly.
- **✨ Pixel-Perfect Comparison Layout:** The comparison window layout has been visually polished with pixel-perfect vertical alignment for all metrics.


## v5.0.0 - Smart Clock Orientation & Direct Positioning Control

- **🧭 Smart Clock Positioning:** The clock widget now dynamically detects screen boundaries when dragged. If placed at the top of the screen, the clock face automatically opens below the time display. If dragged to the left or right edges, it opens on the opposite side to prevent overflowing off-screen.
- **💎 Direct Orientation Controls (Right-Click Selector):** Right-clicking the clock icon on the widget now opens a sleek 3x3 diamond popover menu directly on screen (`Above ⬆️`, `Below ⬇️`, `Left ⬅️`, `Right ➡️`, or `Smart Auto 🪄`). This allows GMs and players to manually pin the clock face direction instantly with one click.
- **🎯 Arrow Pointer Hiding:** When the clock face is collapsed or hidden, the top arrow pointer is now cleanly hidden so no stray icon artifacts remain on screen.
- **Lighting Synchronization for All Scenes:** Fixed an issue where automatic scene lighting updates would fail to update when a Gamemaster was viewing an unactivated scene. Lighting updates now reliably apply to whichever scene the Gamemaster is currently viewing.
- **Instant Scene Lighting Sync:** Scene lighting now automatically updates and synchronizes to match the current world time as soon as a scene finishes loading or switching.
- **Dungeon Mode Shortcut:** Fixed an issue where clicking the top-left Dungeon Mode icon failed to open the configuration window. The Dungeon Mode window now opens cleanly as expected.

## v4.9.4 - 12-Hour Time Format

- **12-Hour Format Option:** Added a new setting to toggle the clock and UI times to a 12-hour AM/PM format. This updates the digital clock, hover tooltips, and weather reports while preserving the internal 24-hour cycle logic for compatibility.
- **Localization:** Added full English and German translations for the new 12-hour format setting.

## v4.9.3 - Climate Data Overhaul & Temperature Fixes

- **Temperature Calculation Fix:** Fixed a critical bug (Issue #35) where negative world times or offsets caused the temperature sine-wave to invert, resulting in extreme temperatures before sunrise. Temperatures now correctly reach their minimum just before dawn.
- **Climate Data Rebalancing:** Capped extreme temperature spikes across all 15 climate zones (e.g., lowered Marine West Coast max from 40°C to 34°C, Ice Cap min from -60°C to -40°C) to improve realism and prevent instant death in survival games.
- **Weather FX Synchronization:** Repaired the German climate weather tables to ensure all particle weather effects (like rain and sandstorms) correctly trigger for German language settings.
- **Immersive Climate Data Overhaul:** Completely rewrote the weather descriptions for all 12 climate zones across all seasons in both English and German. Replaced thousands of overly technical meteorological terms (e.g., "Inversionswetterlage", "Evapotranspiration") with highly atmospheric, RPG-friendly text focusing on immersion, extreme weather, and survival conditions.
- **Weather Favorites:** Fixed an issue where saved weather favorites could fail to load properly.

## v4.9.2 - V14 Lighting Fixes & Smart UI

- **V14 Lighting System:** Fixed an issue where automated lighting updates would fail silently in Foundry V14 due to updated scene lighting properties. The module now reliably sets the darkness level across all supported Foundry versions.
- **Smart Time Jump Button:** The "Next Sunrise/Sunset" button has been overhauled. It now dynamically displays a Moon or Sun icon depending on whether the next celestial event is dusk or dawn based on your active climate zone.
- **Time Rewind Logic:** Holding `Ctrl` over the jump button now correctly shows the opposite event icon in red, indicating a jump backward in time. Furthermore, lighting is now correctly updated when rewinding time.
- **Weather Performance Fix:** Fixed a severe lag and rendering crash in Foundry V14 caused by conflicts with native weather and fog rendering. The module now correctly routes weather changes to its own custom particle engine without interfering with Foundry's core rendering pipeline.

## v4.9.1 - Bug Fixes & Stability

- **UI Disappearance Fix:** Resolved a critical issue in Foundry v12 strict mode where a template loading warning would crash the module's initialization, causing the entire clock UI to disappear.
- **Time Travel Fix:** Fixed an error (NaN) that occurred when clicking the "Next Sunrise/Sunset" button, caused by the new calendar system architecture.
- **Encoding & Localization:** Fixed missing German umlauts (ä, ö, ü) in weather descriptions and corrected the temperature symbol displaying as Â°C instead of °C.

## v4.9.0 - Feature Expansion

- **Astronomical Moon Visualization:** Implemented a robust SVG-based moon badge system in the calendar grid. Moon phases are calculated in real-time based on the astronomical cycle.
- **Lighting & Stability Fixes:** Resolved critical errors in the lighting system related to dawn/dusk transitions and moon brightness calculations.
- **UI Polish:** Added a direct "Manage Custom Calendars" shortcut to the calendar header for quicker configuration. (Removed based on user feedback to keep UI clean).

## v4.7.6 - PF2e Sync for All Calendars

- **PF2e Sync Expansion:** Pathfinder sync can now be used with Golarion, Víkingar, and custom calendars.
- **Wizard Sync Mapping:** Enabling PF2e Sync in the Startup Wizard now pre-fills date and time using the currently selected calendar system.
- **Stability Improvement:** Removed the restrictive calendar guard that could disable PF2e Sync during setup.

## v4.7.5 - Calendar Sync & Time Navigation Fixes

- **Date Flow Fix:** Startup Wizard now initializes year, month, day, and time from live world time plus active offsets to keep Quick Setup aligned with the displayed calendar.
- **PF2e Sync Availability:** Pathfinder sync can now be used with Golarion, Víkingar, and custom calendars without disabling the feature.
- **Offset Save Order:** Wizard save flow now writes day and time offsets first, then derives Pathfinder 2e sync from the resulting state to prevent accidental epoch overrides.
- **Time Navigation Stability:** Quick Setup and Time Machine now stay consistent when switching between custom dates and PF2e sync behavior.

## v4.7.4

- **Compatibility**: Auf V14 gepusht.

## 4.7.3 - Bug Fixes

- **Bug Fixes:** Bug fixes.

## 4.7.2 - Simple Calendar Import Hardening

- **ðŸ› Wrapped Note Import:** Fixed an additional Simple Calendar import case where events were listed in the migration window but not copied because note data was wrapped in a different object shape.
- **ðŸ“… Day Index Correction:** Fixed a remaining day-index conversion issue so imported Simple Calendar events land on the correct PDNC date keys.
- **ðŸ§ª Migration Coverage:** Added test coverage for wrapped Simple Calendar notes and verified the migration payload generation path.

## 4.7.1 - Migrator Fix & Offset Corrected

- **ðŸ› Simple Calendar Migration:** Fixed a critical bug where notes/events were found but not copied due to missing data wrappers in the SC API results.
- **ðŸ“… Import Precision:** Resolved a 1-day offset issue where imported events were shifted by one day.
- **ðŸ›¡ï¸ Visibility Logic:** Improved permission handling for imported notes to ensure "GM-only" and "Player" visibility is correctly mapped.

## 4.7.0 - Weather Rules, Migration & Vikingar Integration


- **Weather Rules API:** Added a new integration layer so other systems or setting modules can inject weather rule notes into PDNC weather chat cards, including GM-only notes directly inside the same weather card.
- **Semantic Weather Tags:** Weather now separates visual `fx` from semantic `weather.tags`, allowing generic PDNC guidance and system-specific rule integrations to work from stable rule markers instead of display effects.
- **Provider Documentation:** Expanded the README with integration examples for external modules, including how imported or generated climate entries can pass semantic `tags` into PDNC.
- **Simple Calendar Migration:** Added and documented the built-in importer that converts the currently active Simple Calendar setup into a PDNC custom calendar and migrates compatible notes/events.


## 4.6.7 - Hotfix

- **ðŸ› Custom Calendar Preservation:** Fixed an issue where the calendar system setting reverted to standard "Gregorian" upon a server restart when a custom calendar was selected.

## 4.6.6 - VÃ­kingar Design & Bugfixes

- **ðŸŽ¨ VÃ­kingar Preset:** Added new "VÃ­kingar" high-quality clock preset.
- **ðŸ› Bug Fixes:** Stability improvements and bug fixes in the theme system.

## 4.6.5 - Dynamic Phases & UI Polish

- **ðŸ•’ Dynamic Day Phases:** You can now add, delete, and rename all time slots in the Theme Configuration! 
- **âœ¨ Smart Clock Mapping:** The clock face now automatically maps any number of phases (even just 2 or 4) to its 8 visual segments using time-based windowing.
- **ðŸ–¼ï¸ Image Propagation:** "Smart Fill" logic for images. If you leave a phase image empty, it intelligently inherits the image from the previous phase.
- **â±ï¸ HH:MM Format:** Time inputs in the Theme Configuration now use standard HH:MM format for a more intuitive setup.
- **ðŸ› Stability Fixes:**
  - Resolved a critical "race condition" error during module registration.
  - Fixed an issue where empty phase images were not correctly rendered in the config UI.

## 4.6.4 - VÃ­kingar Calendar & Teaser

- **ðŸ“… VÃ­kingar Calendar Preset:** Added the historical Norse lunisolar calendar (Misseri).
  - **Two-Season Structure:** Split into Summer (NÃ¡ttleysi) and Winter (Skammdegi).
  - **Leap Logic:** Correctly implements the 364-day year and 371-day leap year (Sumarauki).
  - **Localization:** Full German and English support for all Norse month and weekday names.
- **ðŸ›¡ï¸ Teaser:** Sneak preview for the upcoming **Viking Pathfinder 2 Supplement**!
  - 24 Classes, 31 Backgrounds, 1974 Feats, 939 Spells, 22 Ancestries, 483 Items.

## 4.6.3 - Custom Calendar Restoration

- **ðŸ“… Custom Calendars:** Restored the ability to create and manage custom calendars!
  - **New UI:** Added a dedicated "Custom Calendars" menu in settings with a modern, darker interface.
  - **Editor:** A full-featured editor allows you to define Months, Weekdays, and Leap Year rules (None/Gregorian/Every 4 Years).
  - **Integration:** Custom calendars now appear natively in the Startup Wizard dropdown.
  - **JSON Import:** Added support for importing/exporting calendar definitions via JSON.
- **ðŸŽ¨ UI Polish:**
  - **Standard Headers:** Reverted custom window headers to standard Foundry VTT headers for better consistency with the core UI.
  - **Styling:** Fixed the appearance of the "Close" button on premium windows to align with the new solid background style.
- **ðŸŒ Localization:** Added missing translation keys for the custom calendar interface and common button actions (`Save`, `Cancel`).

## 4.6.2 - Hotfix

- **ðŸ› Bugfixes:** Multiple bug fixes.

## 4.6.1 - UI Polish & Hotfixes

- **UI Polish:**
  - **Theme Configuration:** Completely redesigned for compactness. Fixed window size (400px), cleanly formatted times (e.g., "16:30"), and implemented custom "Trash Can" file pickers for a premium feel.
  - **Season Configuration:** Added the missing gold header to match other premium windows.
- **Bug Fixes:**
  - **Window Interaction:** Fixed an issue where opening _Custom Climate Zones_ would unexpectedly close the _Season Configuration_ window.
  - **Clock Face:** Improved image scaling on the composite clock face to prevent adjacent sector corners from being visible.

## 4.6.0 - Composite Clock & Themes

- **Composite Clock Face**: The clock now behaves like a true graphical sundial/composite clock, displaying 8 distinct phase images simultaneously in a segmented layout.
- **Automatic Mapping**: Your customized phase images (from "Theme Configuration") are now automatically inserted into the clock sectors. You pick the image, we handle the layout!
- **Theme Presets**: Added a new settings lookup to instantly switch between themes. Includes "Standard Fantasy", "Standard v2", and the new "Mwangi Jungle".
- **Refined Geometry**: Phases are now exactly 3 hours long and aligned with the cardinal directions (Noon = Bottom, Night = Top).
- **Visual Improvements**: Optimized image scaling and positioning within the clock frame.
- **Fixes**: Resolved issues with dynamic background updates in the new clock mode.

## 4.5.3 - Keybind & Weather Preview Button

- **Feature:** Added "Toggle Calendar Window" macro and `Alt + C` keybind.
- **Feature:** Weather Preview Button now toggles the window (Open/Close) and swaps icons (+/-).
- **Improvement:** Weather Configuration button is now always visible (even without active weather).
- **Dev:** Exposed `setPreviewIconState` API.

---

# 4.5.2 - Wizard Scroll Fix

- **ðŸŽ¨ UI Fix:** The **Startup Wizard** is now scrollable! Fixed an issue where the "Finish" button was unreachable on smaller screens by enforcing a maximum height and enabling vertical scrolling.

## 4.5.1 - Inverted Arc Hotfix

- **ðŸ› Bugfix:** Fixed a visual glitch where the Sun and Moon Arcs were rendered upside down (inverted) for players or when the HUD controls were hidden. The geometry now correctly calculates the arc peak regardless of UI state.

## 4.5.0 - Event Rescheduling & Quest Sync

- **ðŸ“… New Feature: Event Date Editing**
  - **Move Events:** You can finally change the date of an existing event! Just open the event editor and adjust the day/month/year fields.
  - **Smart Updates:** If you move an event, the calendar automatically handles the move, keeping all data intact.

- **âš”ï¸ Quest Tracker Sync:**
  - **Two-Way Sync:** If you move a calendar event that is linked to a **Phils Quest Tracker** quest, the quest's start date acts accordingly!
  - **Example:** Dragging a "Goblin Raid" event from Monday to Friday in the calendar effectively postpones the quest in the Quest Log too.

- **ðŸ§ª Advanced Weather Mixer:**
  - **Full Control:** You can now manually tweak every aspect of your weather! Adjust **Particle Density**, **Speed**, **Size**, **Direction** and more to create the perfect storm.
  - **Live Preview:** Added a **"Preview" button**. Test your particle/filter combinations directly on the canvas without saving.
  - **Fixes:** Fixed an issue where the Fog Filter color wasn't applying correctly.

- **ðŸ› ï¸ Fixes:**
  - **Security:** Added missing translation keys for permission warnings (`PDNC.Warning.NoPermission`).
  - **Testing:** Implemented a robust Unit Test suite (`tests/quest-sync.test.js`) to ensure calendar logic remains stable.

## 4.4.1 - Dungeon Mode Logic & Test Suite

- **ðŸ›¡ï¸ Security & Logic:**
  - **Dungeon Mode Security:** The "Dungeon Mode" button in the clock widget is now **strictly restricted to GMs only**. It will no longer appear for players, and its functionality is secured on the backend.
  - **Correction:** Fixed a logic error in the automatic lighting calculation where the transition from Night to Dawn caused a sudden jump in brightness. It is now perfectly smooth.

- **ðŸŒ Localization:**
  - Added missing German translation keys for the Setup Wizard.

## 4.4.0 - Dungeon Mode & Polish

- **ðŸ° New Feature: One-Click Dungeon Mode**
  - Added a dedicated **Dungeon Button** (Gate Icon) directly to the top-left of the Clock Widget.
  - One click instantly opens the **Dungeon Mode Configuration**, allowing you to quickly **disable global weather and lighting updates** for the current scene (perfect for indoor maps or tactical combat).
  - This is no longer hidden in sub-menus but available right where you need it!

- **ðŸ§™â€â™‚ï¸ Setup Wizard:**
  - Added a new **"Weekday Offset"** field directly to the Wizard for easier calendar alignment (especially for Pathfinder 2e).
  - Complete visual overhaul of the Wizard UI: Cleaner headers, better spacing, and "Premium" styling.

- **ðŸŽ¨ UI Refinement:**
  - **Premium Design:** Completely restyled the **Weather Configuration** window to match the module's premium "Gold & Dark" theme.
  - **Fixed Layouts:** Resolved alignment issues in the Dungeon Mode config and ensured buttons are perfectly sized.
  - **CSS Scoping:** Implemented strict class scoping to prevent styles from leaking into the core Foundry UI.

- **ðŸŒ Localization:**
  - Added the **Pathfinder 2e Synchronization Guide** to the README (English & German).
  - Fixed duplicate translation keys and missing subtitles.

## 4.3.0 - Cinematic Night Update

- **ðŸŒ™ Cinematic Moon:** The moon now adheres to strict "Cinematic Rules", ensuring it is visible primarily at night (Standard Offset: 9h+). No more confusion with "Daytime Moons" looking like night.
- **ðŸ’¡ Dynamic Lighting:** The moon now actively contributes to scene lighting! A full moon night is significantly brighter (~0.65 darkness) than a new moon night (0.95 darkness). The light intensity fades realistically as the moon rises and sets.
- **ðŸ“– Documentation:** Updated `Climate Zones` documentation (English & German) with detailed brightness levels and new moon phase timings.
- **ðŸ› Fixes:** Resolved character encoding issues in the German documentation.

## 4.2.0 - New Moon Cycle

- **ðŸŒ• New Feature: Moon Cycle:** The Moon Cycle has been completely implemented! The moon phase now accurately tracks the calendar date (e.g. Full Moon on the 15th) and displays the correct phase visual.
- **ðŸŽ¢ Animations:** Fixed the "Flying Sun" and "Flying Moon" glitch. The celestial bodies now invisibly snap to the horizon when setting, preventing them from flying back across the screen when they rise again.
- **ðŸŽ¨ Visuals:** Added a CSS transition to the Moon element to ensure it moves as smoothly as the Sun.
- **ðŸ› Bugfix:** Fixed a CSS syntax error in the `style.css` file.

## 4.1.1 - Localization & Polish

- **ðŸ‡©ðŸ‡ª Localization:** Fixed a duplicate translation for "Sunbeams". It is now correctly labeled as "LichtbÃ¼ndel" to distinguish it from "Sonnenstrahlen" (Sun Rays).
- **â­ Improvement:** Saved **Weather Mixer Favorites** now automatically appear in the main "Visual Effects" dropdown in the Weather Configuration window, making it much easier to apply your custom mixes.
- **âœ¨ UX:** Creating a new mix now effectively uses the custom name provided in the input field.

## 4.1.0 - Weather Mixer

**ðŸ”¥ New Feature: Mix & Match Weather**

By popular request, you can now **combine multiple weather effects** into your own custom mix!
Want "Heavy Rain" AND "Fog"? Or perhaps "Snow" + "Wind" + "Cold"? Now you can!

- **ðŸ§ª The Mixer:** Click the new **Flask Icon** in the Weather Configuration window to open the Mixer.
- **âœ¨ Layering:** Select as many effects as you want. The system will intelligently layer their particles and filters.
- **â­ Favorites:** Save your best combinations as "Favorites" (e.g. "My Perfect Storm") for instant access later. Favorites are stored individually for each world.

**Improvements & Fixes:**

- **ðŸ‡©ðŸ‡ª Localization:** Full German support for the new Mixer interface.
- **ðŸ§ª UI:** Added a dedicated Flask button to the weather config for quick access.
- **ðŸŽ¨ Layout:** Cleaned up the Weather Config UI to ensure buttons align perfectly with dropdowns.

## 4.0.0 - Weather Suppression Update

**Major Fix:** This update addresses critical issues with visual effect masking for both Shaders and Particles.

- **ðŸ›¡ï¸ Global Region Support:**
  - **Shaders (Thick Fog/Heatwave):** Now properly acknowledge **V12/V13 Region Polygons** (including Complex Shapes & Holes).
  - **Particles (Rain/Snow):** Improved detection logic ensures weather is correctly suppressed in all region types.
- **âœ¨ Polish:**
  - Shaders now strictly cover the entire canvas (Infinite Bounds), preventing "Edge gaps".
  - Fixed "Black Screen" issues on Heatwave/Rainbow effects.
  - Reverted experimental screen-space changes to keep the beloved "Move with Map" particle behavior.

## 3.9.1 - Performance & Polish

- **ðŸš€ Critical Performance Fix:** Implemented an aggressive "Debounce" and "Lazy Save" architecture for the Core Loop. The system now intelligently waits for user input to settle before writing to the database, completely eliminating the "Lag/Freeze" that occurred when rapidly advancing time.
- **ðŸ’¾ Memory Caching:** The `CalendarDB` and `CalendarSystem` now use smart in-memory caching. This reduces the computational load of checking events/config from ~15ms per frame to nearly 0ms, effectively fixing the "Rain Stutter" issue during time advancement.
- **ðŸŒ§ï¸ Weather Fix:** Fixed a logic error where the **Weather Preview** background would fail to update if the weather animation was paused.
- **ðŸ› Bugfix:** Fixed an issue where the **Weather Report** saved to the calendar would display incorrect or negative times (e.g. `-8:-14`) by correctly accounting for time offsets and day wrapping.
- **ðŸ–¼ï¸ UI Fix:** The **Weather Preview** now correctly updates its background image in real-time as the day progresses, ensuring the visualized time of day always matches the actual world time.
- **ðŸ“… UI Fix:** Fixed a mismatch where the Calendar Grid and List View ignored the **Weekday Offset** setting (showing incorrect weekdays), while the Clock Widget displayed them correctly. They now align perfectly.

## 3.9.0 - Calendar Precision & UI

- **ðŸ“… Weekday Offset:** Added a new **Weekday Offset** setting. You can now shift the weekday alignment without changing the date, allowing for perfect sync with systems like Golarion/PF2e.
- **ðŸŒ Magaambya Fixes:** Corrected the Magaambya calendar to have 365 days and localized month names, fixing issues with year calculation.
- **ðŸ” UI Improvements:** Hovering over abbreviated weekday names in the calendar now shows the full name via tooltip.
- **ðŸ›¡ï¸ Stability:** Implemented a dynamic year estimation to prevent freezes on calendars with very short years (e.g. 10 days).
- **ðŸ•°ï¸ Time Machine:** The Time Machine now correctly respects all day and time offsets when displaying the target date.

## 3.8.1 - Quality of Life

- **â„ï¸ Feature:** **Global Pause:** The pause button in the **Weather Preview/HUD** now globally pauses the weather effects for you (Client Setting). This allows you to "freeze" the rain/snow in the background and in the preview window - perfect for dramatic moments or taking screenshots ("Standbild").
- **ðŸ› Bugfix:** Fixed a `TypeError` that could occur when closing the weather preview window after disabling the weather system.

## 3.8.0 - User Experience Update

- **ðŸ§™â€â™‚ï¸ Startup Wizard:** A brand new, beautiful Setup Wizard that guides new users (and GMs) through the first-time setup! It handles Clock Image, Calendar System (PF2e/Gregorian/etc.), Time Settings, and Permissions in a simple step-by-step UI.
- **ðŸŒ PF2e Sync Improved:** The "Sync Pathfinder 2e" setting now works much more reliably, correctly handling the Golarion epoch offset to match the official system time.
- **ðŸŒ¦ï¸ Climate Data Refined:** Massive update to both English and German climate data. Lighting times (Dawn/Dusk) are now perfectly calculated for diverse biomes like "Ice Cap" or "Tropics" based on realistic latitude simulations.
- **ðŸ› Fix:** Fixed a regression where the "Climate Zone" dropdown in Settings would sometimes show English names even when the system language was German.

## 3.7.3 - Bugfix & Stability

- **ðŸ› Critical Fix:** Fixed a critical bug where formerly deleted Custom Climate Zones would persist as the "Active Climate", causing the weather generation to fail silently or produce errors.
- **ðŸ›¡ï¸ Stability:** Added a self-healing validation check on startup that automatically detects if the active climate zone is invalid (e.g. was deleted) and resets it to the default "Marine West Coast" to prevent broken states.

## 3.7.2 - Testing & Cleanup

- **ðŸ› ï¸ Stability:** Removed the "Simple" calendar system which was causing initialization issues. Users who had this selected will automatically be switched to "Gregorian".
- **ðŸŒ Localization:** Fixed missing translation keys for Settings buttons (`Save`, `Reset`) and the Weather HUD `Close` button.
- **ðŸ’¡ Lighting:** Fixed a minor inaccuracy in the "Marine West Coast" lighting calculation which caused "Noon" to not be perfectly bright (0.0 darkness).

## 3.7.1 - Hotfix Collection

- **ðŸŽ¨ Layout:** Widened the **List View** date column for better readability.
- **ðŸŽ¨ CSS:** Refined spacing for context icons and applied minor CSS adjustments.
- **ðŸ› Fix:** Fixed **List View** showing raw HTML for weekdays (Real Names).
- **ðŸ› Fix:** Fixed **Weather Chat Card** showing raw HTML for dates (Real Names).

## 3.7.0 - Controls & Polish

- **âœ¨ Feature:** **Smart Shortcuts:** Holding `Ctrl` now inverts the time control buttons (e.g., `+1h` becomes `-1h`), allowing for quick rewinds.
- **ðŸŽ¨ Visuals:** Adjusted the Solar Arc to sit higher and look cleaner above the text.
- **ðŸŽ¨ Layout:** Date text now correctly breaks into two lines when "Real Names" are enabled for better readability.
- **ðŸ› Bugfix:** Fixed localization for tooltips (`ToggleGlobalWeather`, `PausePreview`).
- **ðŸ› Bugfix:** Resolved an issue where date names with "Real Names" enabled would show raw HTML tags in the calendar.
- **â¤ï¸ Credits:** Special thanks to the community for the feature request! ;-p

## 3.6.1 - Oopsie Localization

- **ðŸ› Hotfix:** Fixed a regression where German localization for the Time Unit dropdown was accidentally reverted to English. Sorry!

## 3.6.0 - UI Polish & Shortcuts

- **âœ¨ Feature:** Added handy **Quick Time Buttons** (+10m, +1h, +1d, +1w) directly to the HUD for rapid time adjustment.
- **ðŸŽ¨ UI Refinement:** Massive visual overhaul of the Clock Widget.
  - **Compact Mode:** The widget is now significantly tighter and takes up less screen space while displaying more info.
  - **Solar Arc:** Re-engineered the solar arc geometry to sit perfectly above the text without clipping.
  - **Layout:** Optimized spacing and alignment for a cleaner, "Premium" look.
- **ðŸ› Localization:** Fixed an issue where the Time Unit dropdown (Min, Hour, Day) would sometimes show mixed language abbreviations. It now consistently uses the correct localized terms (or English standards where requested).

## 3.5.0 - Personal Notes & Code Quality

- **ðŸ“ Personal Notes:** Added a new "Personal (Private)" event type.
  - These events are **only visible to the GM and the specific player who created them**.
  - Useful for private reminders, character-specific journal entries, or secret GM tracking.
  - Personal notes appear with a distinct **Purple** color theme in all views.
  - Includes a unique "Lock" icon in the event editor.
- **ðŸ› ï¸ Code Quality:** Massive refactor of the Calendar HTML templates.
  - Moved complex conditional logic from HTML attributes into the JavaScript controller.
  - Resolved 15+ strict HTML linter warnings, producing cleaner and more robust code.
- **ðŸ› Localization Fix:** Fixed missing translations for the "Quest" event type and "Year View" in German.
- **ðŸŽ¨ UI Fix:** Fixed missing icons and incorrect color coding for Quests, Weather, and Personal events in the "Day Details" view.
- **ðŸŽ¨ Layout Fix:** The "Year View" and "Event List" now properly resize and become scrollable when needed, ensuring all content is accessible.

## 3.4.0 - Performance & Features

- **ðŸš€ Performance:** Implemented a smart caching system for the calendar engine. Checking valid dates and calculating recurring events is now **orders of magnitude (O(1)) faster**. This completely eliminates the "freeze" when opening the calendar or jumping between years.
- **ðŸ“… New Views:**
  - **Year View:** A complete 12-month overview grid to see your entire year at a glance.
  - **List View:** A chronological list of all upcoming events, filterable by category.
- **ðŸ‘€ View Switcher:** Added a sleek switcher to easily toggle between Month, Year, and List views.
- **ðŸŒ Magaambya Calendar:** Full support for the Magaambya (Mwangi) calendar system including localized month names.
- **âœ¨ Enhancements:**
  - **"Real Names" Mode:** Option to show real-world month/weekday names (e.g., "January", "Monday") alongside fantasy names.
  - **Jump Date:** The "Set Current Date" context menu now calculates the difference in days and asks for confirmation in a localized, immersive way.
  - **Localization:** Fixed missing translations for the "None" weather option and added German translations for new features.

## 3.3.0 - Pathfinder 2e Sync

- **âœ¨ Feature:** Added a **"Sync Pathfinder 2e"** checkbox in the module settings. Enabling this automatically sets the day offset to `1,725,556`, perfectly aligning the calendar with the Golarion epoch used by the PF2e system.

## 3.2.6 - Calendar & Weather Fixes

- **ðŸ› Bugfix:** Resolved an issue where resetting the world time to Year 0 (or jumping back significantly) would block notifications due to spam protection. The system now detects "World Resets" (> 1 year backward jump) and correctly resets the notification state.
- **ðŸ› Logic Fix:** Calendar reminders for the "current day" are no longer blocked by the initialization check. You can now reliably get notifications for events happening today, even after reloads.
- **âœ¨ Weather Spam Fix:** Weather reports (which are stored as calendar events) are now correctly filtered out from the generic "New Calendar Event" notifications.
- **ðŸ”— Feature:** "Event Created" chat cards now include a **clickable link** to the specific day in the calendar, matching the behavior of reminders.
- **ðŸ› Chat Fix:** Fixed an unclosed HTML tag in the Calendar notification system that could cause chat scrolling issues.

## 3.2.5 - Maintenance

- **Log Cleanup:** Removed excessive debug logging from Calendar and Weather systems to keep the console clean.

## 3.2.4 - V13 Compatibility Update

- **ðŸ”§ Compatibility:** Resolved multiple deprecation warnings for Foundry V13.
- **ðŸ› ï¸ Refactor:** Updated `loadTemplates`, `renderTemplate`, and `Draggable` usages to their new V13 namespaced locations.

## 3.2.3 - Weather Render Stability

- **ðŸ› Bugfix:** Resolved an issue where custom weather particles (leaves, snow, etc.) would sometimes be invisible due to a texture packing error.
- **ðŸ› Bugfix:** Fixed a race condition where rapid weather changes could cause destroyed weather engines to throw errors or incorrectly reset the global weather visibility ("Zombie Engines").
- **ðŸ› Bugfix:** Default Foundry weather is now correctly suppressed (alpha 0) instead of hidden, preserving the animation loop for custom effects.

## 3.2.2 - Weather Interaction Fix

- **ðŸ› Bugfix:** Fixed an issue where weather effects (like Rain) were blocking mouse interactions with tokens and other canvas elements.

## 3.2.1 - Quest Tracker Compatibility

- **ðŸ¤ Phils Quest Tracker Compatibility:** Updated event filtering logic to support the new dynamic visibility features in Phils Quest Tracker v1.0.0. Hidden quests now remain correctly hidden in both the Calendar view and Day Details view.
- **ðŸ› Bugfix:** Fixed an issue where "GM Only" events could sometimes be viewed by players in the Day Details window.

## 3.2.0 - Calendar Power Update

**ðŸŽ‰ MAJOR FEATURE: Advanced Calendar Events!**

It is finally here! A massive update to the Calendar logic, making it a fully featured campaign management tool.

- **ðŸ“… Recurring Series Events:** You can now create events that repeat daily, weekly, monthly, or yearly!
  - **Smart Deletion:** When deleting a series, you can choose to delete "Only this instance", "This and following", or "The entire series".
  - **Exceptions:** Moving or modifying a single instance of a series correctly creates an exception while keeping the rest of the series intact.
- **ðŸ”” Reminder System:** Set reminders (in days) for your events!
  - **Automatic Notifications:** When a reminder is due, a chat card is automatically posted for the GM.
- **ðŸ’¬ Enhanced Chat Cards:**
  - **Interactive Links:** Chat cards for Events and Reminders now contain **clickable buttons** that take you directly to the specific day in the calendar.
  - **Rich Icons:** Events and Reminders have distinct icons for quick visual identification.
- **ðŸ—‘ï¸ Logic Overhaul:**
  - **Ghost Busting:** Fixed a critical bug where deleted events would sometimes reappear ("Zombie Events").
  - **Duplicate Cleanup:** Implemented aggressive logic to clean up duplicate events that might have accumulated from previous bugs.
- **ðŸŽ¨ UI Polish:**
  - **Grid Header:** The calendar header layout is now rock-solid and doesn't jump around when months change.
  - **Styling:** Improved button styles and interaction feedback throughout the calendar.

## 3.1.1

- Manifest cleanup and normalization.

## 3.1.0 - Visual Overhaul & True Randomness

**Visuals & Engine:**

- **High-Quality Assets:** Replaced all generic leaf and petal particles with **20+ high-resolution, natural textures**.
- **True Randomness Engine:** Implemented a new "Re-Roll on Wrap" logic.
  - Unlike standard particle engines where a particle keeps its texture forever, our particles now **pick a new random texture every time they wrap around the screen**.
  - This ensures infinite variety even with low particle counts (no more "same leaf" syndromes!).
- **Aesthetic Tuning:** Fine-tuned the scale (`0.2`) and speed of nature effects for a more realistic, less intrusive look.
- **Code Quality:** Massive cleanup of specialized comments to strictly professional standards.

**Immersive Fixes:**

- **Climate Data Polish:** Massive audit of English and German climate data. Fixed logical inconsistencies where visual effects didn't match descriptions (e.g., "storm" vs "breeze").
- **Localization Fixes:** Corrected spelling errors in German (e.g., "Raureif") and English (e.g., "Croaking").
- **Systematic Fixes:** Fixed a data generator error where English temperatures used the German "bis" instead of "to".
- **FX Standardization:** Ensured all biomes now strictly use the new V3 FX keys.

## 3.0.0 - Weather Effects Overhaul

**ðŸš€ MAJOR FEATURE: 60+ New Weather Effects!**

- **Massive Weather Library:**
  - Completely overhauled the weather engine with over **60 high-quality effects**.
  - **New Categories:** Rain, Snow, Atmosphere, Nature, Arcane, and Sci-Fi.
  - **Reordered & Detailed:** All effects are now cleanly numbered (01-61) and sorted by category in the dropdown.
  - **Cleanup:** Removed legacy "Fog" and "Soot" effects.
- **Solar Day/Night Cycle Arc:** Added a new dynamic visual arc to the clock UI showing the sun's position.
  - **Dynamic Progression:** The arc adapts to the actual Dawn, Noon, and Dusk times defined by the lighting system.
  - **Visuals:** A golden sun icon travels along a curved path, rising at dawn and setting at dusk.
- **Documentation:** Updated `fxeffects.md` to serve as the definitive source of truth for all weather effects.

## 2.4.1 - Stability Hotfix

**Bugfixes & Improvements:**

- **CRITICAL:** Fixed a crash when saving Season Configuration or using the Time Machine.
- **Improved:** Season Configuration and Time Machine now use the new Actions API to completely prevent page reloads on save.
- **Fixed:** Season Configuration month names now correctly update immediately when switching calendar systems.
- **New:** Added a "Reset Defaults" button to the Season Configuration window.
- **Credit:** Huge thanks to **@TheFirel** for reporting the crash and helping debug the issue!

## 2.4.0 - Advanced Lighting Strategies

**New Features:**

- **Lighting Strategies:** Added a new "Strategy" selection to Custom Climate Zones.
  - **Standard:** Normal day/night cycle.
  - **Bright Night:** Never gets fully dark (e.g., White Nights).
  - **Polar Day:** The sun never sets (Constant daylight).
  - **Polar Night:** The sun never rises (Constant darkness/twilight).
    This allows for fully realistic arctic/antarctic circles or fantasy sub-terranean climates.

## 2.3.0 - Custom Lighting

**New Features:**

- **Custom Climate Lighting:** You can now configure the lighting times (Dawn, Noon, Dusk, Night) for each season within your Custom Climate Zones. This allows for polar days/nights or other unique lighting cycles per climate.

## 2.2.1 - Hotfix

**Bugfixes:**

- Fixed a `TypeError` when deleting custom climates.
- Fixed a deprecation warning for `Dialog.confirm` by migrating to the new V2 API for V13 compatibility.

## 2.2.0 - Custom Climates & UX Overhaul

**Improvements:**

- **New Custom Climate Editor:** The editor for custom climate zones has been completely redesigned!
  - **Row-Based Editing:** Properly edit weather entries row-by-row instead of handling raw JSON.
  - **Better Validation:** Direct inputs for Description, Temperature Range (e.g. "10-20"), and FX selection.
  - **Real-time Updates:** Creating or editing a custom climate now immediately updates the main settings menu without needing a reload.
- **Weather Config UI:** The GM Weather Configuration window has been restyled for better readability and a more compact layout.
- **Localization:** Added missing German translations for the new editor features.

**Bugfixes:**

- Fixed an issue where the "Add Row" button in the Custom Climate Editor would sometimes disappear or not update the view.
- PROPER handling of deprecated `FormData` usage for V12/V13 compatibility.

## 2.1.0 - Climate Data Overhaul

**Improvement:**

- **Climate Data Refinement:** The German and English climate data has been massively improved!
  - **Tropical Rainforest:** Now has realistic rain probabilities (~90%) and rewritten descriptions.
  - **Realism Audit:** Adjusted rain/fog frequency for Marine West Coast and Temperate Rainforest to better reflect their real-world counterparts.
  - **Detailed Descriptions:** Expanded many short, generic weather descriptions in Desert and Savanna biomes to be more immersive.
- **Bugfixes:** Fixed an issue where some weather effects (`storm`, `wind`) were not triggering the correct visual FX on the scene.

## 2.0.0 - Big Feature Update

**New Features:**

- **Weather System:** Completely new weather engine! Uses a realistic simulation (humidity, temperature, wind) based on "climate zones" (Marine, Tundra, Desert, Savanna, etc.).
- **Automatic FX:** Weather now applies FX to the scene automatically (Rain, Snow, Clouds, Fog, etc.).
- **Automatic Lighting:** Scene darkness is now automatically adjusted based on the current season, time of day, and weather conditions (clouds/storms darken the sky!).
- **Calendar Logging:** Daily weather reports are automatically logged into the calendar as events, creating a history of your world's climate.
- **Season Configuration:** Configure exactly when Spring, Summer, Autumn, and Winter start for your world.
- **Compact UI:** Redesigned the clock UI to be cleaner and more compact, integrating weather information directly into the main display.

**Technical:**

- **Codebase Refactor:** Migrated to Foundry VTT Application V2 for better performance and future-proofing.
- **Robustness:** Improved data handling for calendar events using Journal Entry Flags.

## 1.0.0

**New Features:**

- **Custom Clock Image:** You can now upload your own image for the clock face in the module settings! (Thanks for the suggestion!)
- **Stable Positioning:** Fixed a bug where the clock would shift slightly after every reload. It now stays exactly where you put it.







