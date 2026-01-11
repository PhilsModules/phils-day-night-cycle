# Update Log

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
