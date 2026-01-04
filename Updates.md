# Update Log

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
