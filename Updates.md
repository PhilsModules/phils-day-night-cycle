# Update Log

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
