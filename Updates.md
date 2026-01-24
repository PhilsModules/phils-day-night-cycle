## 4.4.0 - Dungeon Mode & Polish

- **🏰 New Feature: One-Click Dungeon Mode**
  - Added a dedicated **Dungeon Button** (Gate Icon) directly to the top-left of the Clock Widget.
  - One click instantly opens the **Dungeon Mode Configuration**, allowing you to quickly **disable global weather and lighting updates** for the current scene (perfect for indoor maps or tactical combat).
  - This is no longer hidden in sub-menus but available right where you need it!

- **🧙‍♂️ Setup Wizard:**
  - Added a new **"Weekday Offset"** field directly to the Wizard for easier calendar alignment (especially for Pathfinder 2e).
  - Complete visual overhaul of the Wizard UI: Cleaner headers, better spacing, and "Premium" styling.

- **🎨 UI Refinement:**
  - **Premium Design:** Completely restyled the **Weather Configuration** window to match the module's premium "Gold & Dark" theme.
  - **Fixed Layouts:** Resolved alignment issues in the Dungeon Mode config and ensured buttons are perfectly sized.
  - **CSS Scoping:** Implemented strict class scoping to prevent styles from leaking into the core Foundry UI.

- **🌍 Localization:**
  - Added the **Pathfinder 2e Synchronization Guide** to the README (English & German).
  - Fixed duplicate translation keys and missing subtitles.

## 4.3.0 - Cinematic Night Update

- **🌙 Cinematic Moon:** The moon now adheres to strict "Cinematic Rules", ensuring it is visible primarily at night (Standard Offset: 9h+). No more confusion with "Daytime Moons" looking like night.
- **💡 Dynamic Lighting:** The moon now actively contributes to scene lighting! A full moon night is significantly brighter (~0.65 darkness) than a new moon night (0.95 darkness). The light intensity fades realistically as the moon rises and sets.
- **📖 Documentation:** Updated `Climate Zones` documentation (English & German) with detailed brightness levels and new moon phase timings.
- **🐛 Fixes:** Resolved character encoding issues in the German documentation.

## 4.2.0 - New Moon Cycle

- **🌕 New Feature: Moon Cycle:** The Moon Cycle has been completely implemented! The moon phase now accurately tracks the calendar date (e.g. Full Moon on the 15th) and displays the correct phase visual.
- **🎢 Animations:** Fixed the "Flying Sun" and "Flying Moon" glitch. The celestial bodies now invisibly snap to the horizon when setting, preventing them from flying back across the screen when they rise again.
- **🎨 Visuals:** Added a CSS transition to the Moon element to ensure it moves as smoothly as the Sun.
- **🐛 Bugfix:** Fixed a CSS syntax error in the `style.css` file.

## 4.1.1 - Localization & Polish

- **🇩🇪 Localization:** Fixed a duplicate translation for "Sunbeams". It is now correctly labeled as "Lichtbündel" to distinguish it from "Sonnenstrahlen" (Sun Rays).
- **⭐ Improvement:** Saved **Weather Mixer Favorites** now automatically appear in the main "Visual Effects" dropdown in the Weather Configuration window, making it much easier to apply your custom mixes.
- **✨ UX:** Creating a new mix now effectively uses the custom name provided in the input field.

## 4.1.0 - Weather Mixer

**🔥 New Feature: Mix & Match Weather**

By popular request, you can now **combine multiple weather effects** into your own custom mix!
Want "Heavy Rain" AND "Fog"? Or perhaps "Snow" + "Wind" + "Cold"? Now you can!

- **🧪 The Mixer:** Click the new **Flask Icon** in the Weather Configuration window to open the Mixer.
- **✨ Layering:** Select as many effects as you want. The system will intelligently layer their particles and filters.
- **⭐ Favorites:** Save your best combinations as "Favorites" (e.g. "My Perfect Storm") for instant access later. Favorites are stored individually for each world.

**Improvements & Fixes:**

- **🇩🇪 Localization:** Full German support for the new Mixer interface.
- **🧪 UI:** Added a dedicated Flask button to the weather config for quick access.
- **🎨 Layout:** Cleaned up the Weather Config UI to ensure buttons align perfectly with dropdowns.

## 4.0.0 - Weather Suppression Update

**Major Fix:** This update addresses critical issues with visual effect masking for both Shaders and Particles.

- **🛡️ Global Region Support:**
  - **Shaders (Thick Fog/Heatwave):** Now properly acknowledge **V12/V13 Region Polygons** (including Complex Shapes & Holes).
  - **Particles (Rain/Snow):** Improved detection logic ensures weather is correctly suppressed in all region types.
- **✨ Polish:**
  - Shaders now strictly cover the entire canvas (Infinite Bounds), preventing "Edge gaps".
  - Fixed "Black Screen" issues on Heatwave/Rainbow effects.
  - Reverted experimental screen-space changes to keep the beloved "Move with Map" particle behavior.

## 3.9.1 - Performance & Polish

- **🚀 Critical Performance Fix:** Implemented an aggressive "Debounce" and "Lazy Save" architecture for the Core Loop. The system now intelligently waits for user input to settle before writing to the database, completely eliminating the "Lag/Freeze" that occurred when rapidly advancing time.
- **💾 Memory Caching:** The `CalendarDB` and `CalendarSystem` now use smart in-memory caching. This reduces the computational load of checking events/config from ~15ms per frame to nearly 0ms, effectively fixing the "Rain Stutter" issue during time advancement.
- **🌧️ Weather Fix:** Fixed a logic error where the **Weather Preview** background would fail to update if the weather animation was paused.
- **🐛 Bugfix:** Fixed an issue where the **Weather Report** saved to the calendar would display incorrect or negative times (e.g. `-8:-14`) by correctly accounting for time offsets and day wrapping.
- **🖼️ UI Fix:** The **Weather Preview** now correctly updates its background image in real-time as the day progresses, ensuring the visualized time of day always matches the actual world time.
- **📅 UI Fix:** Fixed a mismatch where the Calendar Grid and List View ignored the **Weekday Offset** setting (showing incorrect weekdays), while the Clock Widget displayed them correctly. They now align perfectly.

## 3.9.0 - Calendar Precision & UI

- **📅 Weekday Offset:** Added a new **Weekday Offset** setting. You can now shift the weekday alignment without changing the date, allowing for perfect sync with systems like Golarion/PF2e.
- **🌍 Magaambya Fixes:** Corrected the Magaambya calendar to have 365 days and localized month names, fixing issues with year calculation.
- **🔍 UI Improvements:** Hovering over abbreviated weekday names in the calendar now shows the full name via tooltip.
- **🛡️ Stability:** Implemented a dynamic year estimation to prevent freezes on calendars with very short years (e.g. 10 days).
- **🕰️ Time Machine:** The Time Machine now correctly respects all day and time offsets when displaying the target date.

## 3.8.1 - Quality of Life

- **❄️ Feature:** **Global Pause:** The pause button in the **Weather Preview/HUD** now globally pauses the weather effects for you (Client Setting). This allows you to "freeze" the rain/snow in the background and in the preview window - perfect for dramatic moments or taking screenshots ("Standbild").
- **🐛 Bugfix:** Fixed a `TypeError` that could occur when closing the weather preview window after disabling the weather system.

## 3.8.0 - User Experience Update

- **🧙‍♂️ Startup Wizard:** A brand new, beautiful Setup Wizard that guides new users (and GMs) through the first-time setup! It handles Clock Image, Calendar System (PF2e/Gregorian/etc.), Time Settings, and Permissions in a simple step-by-step UI.
- **🌍 PF2e Sync Improved:** The "Sync Pathfinder 2e" setting now works much more reliably, correctly handling the Golarion epoch offset to match the official system time.
- **🌦️ Climate Data Refined:** Massive update to both English and German climate data. Lighting times (Dawn/Dusk) are now perfectly calculated for diverse biomes like "Ice Cap" or "Tropics" based on realistic latitude simulations.
- **🐛 Fix:** Fixed a regression where the "Climate Zone" dropdown in Settings would sometimes show English names even when the system language was German.

## 3.7.3 - Bugfix & Stability

- **🐛 Critical Fix:** Fixed a critical bug where formerly deleted Custom Climate Zones would persist as the "Active Climate", causing the weather generation to fail silently or produce errors.
- **🛡️ Stability:** Added a self-healing validation check on startup that automatically detects if the active climate zone is invalid (e.g. was deleted) and resets it to the default "Marine West Coast" to prevent broken states.

## 3.7.2 - Testing & Cleanup

- **🛠️ Stability:** Removed the "Simple" calendar system which was causing initialization issues. Users who had this selected will automatically be switched to "Gregorian".
- **🌍 Localization:** Fixed missing translation keys for Settings buttons (`Save`, `Reset`) and the Weather HUD `Close` button.
- **💡 Lighting:** Fixed a minor inaccuracy in the "Marine West Coast" lighting calculation which caused "Noon" to not be perfectly bright (0.0 darkness).

## 3.7.1 - Hotfix Collection

- **🎨 Layout:** Widened the **List View** date column for better readability.
- **🎨 CSS:** Refined spacing for context icons and applied minor CSS adjustments.
- **🐛 Fix:** Fixed **List View** showing raw HTML for weekdays (Real Names).
- **🐛 Fix:** Fixed **Weather Chat Card** showing raw HTML for dates (Real Names).

## 3.7.0 - Controls & Polish

- **✨ Feature:** **Smart Shortcuts:** Holding `Ctrl` now inverts the time control buttons (e.g., `+1h` becomes `-1h`), allowing for quick rewinds.
- **🎨 Visuals:** Adjusted the Solar Arc to sit higher and look cleaner above the text.
- **🎨 Layout:** Date text now correctly breaks into two lines when "Real Names" are enabled for better readability.
- **🐛 Bugfix:** Fixed localization for tooltips (`ToggleGlobalWeather`, `PausePreview`).
- **🐛 Bugfix:** Resolved an issue where date names with "Real Names" enabled would show raw HTML tags in the calendar.
- **❤️ Credits:** Special thanks to the community for the feature request! ;-p

## 3.6.1 - Oopsie Localization

- **🐛 Hotfix:** Fixed a regression where German localization for the Time Unit dropdown was accidentally reverted to English. Sorry!

## 3.6.0 - UI Polish & Shortcuts

- **✨ Feature:** Added handy **Quick Time Buttons** (+10m, +1h, +1d, +1w) directly to the HUD for rapid time adjustment.
- **🎨 UI Refinement:** Massive visual overhaul of the Clock Widget.
  - **Compact Mode:** The widget is now significantly tighter and takes up less screen space while displaying more info.
  - **Solar Arc:** Re-engineered the solar arc geometry to sit perfectly above the text without clipping.
  - **Layout:** Optimized spacing and alignment for a cleaner, "Premium" look.
- **🐛 Localization:** Fixed an issue where the Time Unit dropdown (Min, Hour, Day) would sometimes show mixed language abbreviations. It now consistently uses the correct localized terms (or English standards where requested).

## 3.5.0 - Personal Notes & Code Quality

- **📝 Personal Notes:** Added a new "Personal (Private)" event type.
  - These events are **only visible to the GM and the specific player who created them**.
  - Useful for private reminders, character-specific journal entries, or secret GM tracking.
  - Personal notes appear with a distinct **Purple** color theme in all views.
  - Includes a unique "Lock" icon in the event editor.
- **🛠️ Code Quality:** Massive refactor of the Calendar HTML templates.
  - Moved complex conditional logic from HTML attributes into the JavaScript controller.
  - Resolved 15+ strict HTML linter warnings, producing cleaner and more robust code.
- **🐛 Localization Fix:** Fixed missing translations for the "Quest" event type and "Year View" in German.
- **🎨 UI Fix:** Fixed missing icons and incorrect color coding for Quests, Weather, and Personal events in the "Day Details" view.
- **🎨 Layout Fix:** The "Year View" and "Event List" now properly resize and become scrollable when needed, ensuring all content is accessible.

## 3.4.0 - Performance & Features

- **🚀 Performance:** Implemented a smart caching system for the calendar engine. Checking valid dates and calculating recurring events is now **orders of magnitude (O(1)) faster**. This completely eliminates the "freeze" when opening the calendar or jumping between years.
- **📅 New Views:**
  - **Year View:** A complete 12-month overview grid to see your entire year at a glance.
  - **List View:** A chronological list of all upcoming events, filterable by category.
- **👀 View Switcher:** Added a sleek switcher to easily toggle between Month, Year, and List views.
- **🌍 Magaambya Calendar:** Full support for the Magaambya (Mwangi) calendar system including localized month names.
- **✨ Enhancements:**
  - **"Real Names" Mode:** Option to show real-world month/weekday names (e.g., "January", "Monday") alongside fantasy names.
  - **Jump Date:** The "Set Current Date" context menu now calculates the difference in days and asks for confirmation in a localized, immersive way.
  - **Localization:** Fixed missing translations for the "None" weather option and added German translations for new features.

## 3.3.0 - Pathfinder 2e Sync

- **✨ Feature:** Added a **"Sync Pathfinder 2e"** checkbox in the module settings. Enabling this automatically sets the day offset to `1,725,556`, perfectly aligning the calendar with the Golarion epoch used by the PF2e system.

## 3.2.6 - Calendar & Weather Fixes

- **🐛 Bugfix:** Resolved an issue where resetting the world time to Year 0 (or jumping back significantly) would block notifications due to spam protection. The system now detects "World Resets" (> 1 year backward jump) and correctly resets the notification state.
- **🐛 Logic Fix:** Calendar reminders for the "current day" are no longer blocked by the initialization check. You can now reliably get notifications for events happening today, even after reloads.
- **✨ Weather Spam Fix:** Weather reports (which are stored as calendar events) are now correctly filtered out from the generic "New Calendar Event" notifications.
- **🔗 Feature:** "Event Created" chat cards now include a **clickable link** to the specific day in the calendar, matching the behavior of reminders.
- **🐛 Chat Fix:** Fixed an unclosed HTML tag in the Calendar notification system that could cause chat scrolling issues.

## 3.2.5 - Maintenance

- **Log Cleanup:** Removed excessive debug logging from Calendar and Weather systems to keep the console clean.

## 3.2.4 - V13 Compatibility Update

- **🔧 Compatibility:** Resolved multiple deprecation warnings for Foundry V13.
- **🛠️ Refactor:** Updated `loadTemplates`, `renderTemplate`, and `Draggable` usages to their new V13 namespaced locations.

## 3.2.3 - Weather Render Stability

- **🐛 Bugfix:** Resolved an issue where custom weather particles (leaves, snow, etc.) would sometimes be invisible due to a texture packing error.
- **🐛 Bugfix:** Fixed a race condition where rapid weather changes could cause destroyed weather engines to throw errors or incorrectly reset the global weather visibility ("Zombie Engines").
- **🐛 Bugfix:** Default Foundry weather is now correctly suppressed (alpha 0) instead of hidden, preserving the animation loop for custom effects.

## 3.2.2 - Weather Interaction Fix

- **🐛 Bugfix:** Fixed an issue where weather effects (like Rain) were blocking mouse interactions with tokens and other canvas elements.

## 3.2.1 - Quest Tracker Compatibility

- **🤝 Phils Quest Tracker Compatibility:** Updated event filtering logic to support the new dynamic visibility features in Phils Quest Tracker v1.0.0. Hidden quests now remain correctly hidden in both the Calendar view and Day Details view.
- **🐛 Bugfix:** Fixed an issue where "GM Only" events could sometimes be viewed by players in the Day Details window.

## 3.2.0 - Calendar Power Update

**🎉 MAJOR FEATURE: Advanced Calendar Events!**

It is finally here! A massive update to the Calendar logic, making it a fully featured campaign management tool.

- **📅 Recurring Series Events:** You can now create events that repeat daily, weekly, monthly, or yearly!
  - **Smart Deletion:** When deleting a series, you can choose to delete "Only this instance", "This and following", or "The entire series".
  - **Exceptions:** Moving or modifying a single instance of a series correctly creates an exception while keeping the rest of the series intact.
- **🔔 Reminder System:** Set reminders (in days) for your events!
  - **Automatic Notifications:** When a reminder is due, a chat card is automatically posted for the GM.
- **💬 Enhanced Chat Cards:**
  - **Interactive Links:** Chat cards for Events and Reminders now contain **clickable buttons** that take you directly to the specific day in the calendar.
  - **Rich Icons:** Events and Reminders have distinct icons for quick visual identification.
- **🗑️ Logic Overhaul:**
  - **Ghost Busting:** Fixed a critical bug where deleted events would sometimes reappear ("Zombie Events").
  - **Duplicate Cleanup:** Implemented aggressive logic to clean up duplicate events that might have accumulated from previous bugs.
- **🎨 UI Polish:**
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

**🚀 MAJOR FEATURE: 60+ New Weather Effects!**

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
