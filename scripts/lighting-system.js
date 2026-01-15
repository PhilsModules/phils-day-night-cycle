import { LIGHTING_DATA } from "./lighting-data.js";
import { WeatherSystem } from "./weather-system.js";

const MODULE_ID = "phils-day-night-cycle";

export class LightingSystem {

    static getClimateParams() {
        const climate = game.settings.get(MODULE_ID, "climateZone") || "marine_west_coast";
        
        let season = "spring";
        
        if (window.dayNightCycle && window.dayNightCycle.calendar) {
            const date = window.dayNightCycle.calendar.getDate(game.time.worldTime);
            season = WeatherSystem.getSeason(date.month, date.day);
        }

        // Check if custom climate
        const customClimates = game.settings.get(MODULE_ID, "customClimates") || {};
        if (customClimates[climate]) {
             const customData = customClimates[climate];
             if (customData.lighting && customData.lighting[season]) {
                 return customData.lighting[season];
             }
             // Fallback if lighting is missing in custom data?
             // Maybe return default marine_west_coast for safety
             return LIGHTING_DATA["marine_west_coast"][season];
        }

        const data = LIGHTING_DATA[climate];
        if (!data) return null;
        return data[season];
    }

    static parseTime(timeStr) {
        if (!timeStr) return null;
        const [h, m] = timeStr.split(":").map(Number);
        return (h * 60) + m; // Minutes from midnight
    }

    static calculateDarkness(worldTime) {
        const params = this.getClimateParams();
        if (!params) return 0; // Default to bright if no data

        // Check Types
        if (!params) return 0.0;
        if (params.type === "polar_day") return 0.0;
        if (params.type === "polar_night") return 1.0;

        // Validation for missing times
        if (!params.dawn || !params.noon || !params.dusk) {
             console.warn("PDNC | LightingSystem: Missing dawn/noon/dusk parameters for current climate.");
             return 0.0;
        }

        // Current time in minutes of the day (adjusted by global timeOffset)
        const dayLength = 86400;
        const timeOffset = game.settings.get(MODULE_ID, "timeOffset") || 0; // Minutes
        const adjustedTime = worldTime + (timeOffset * 60);

        // Handle negative time correctly for modulo
        const currentSeconds = ((adjustedTime % dayLength) + dayLength) % dayLength;
        const currentMinutes = Math.floor(currentSeconds / 60);

        const dawn = this.parseTime(params.dawn);
        const noon = this.parseTime(params.noon);
        const dusk = this.parseTime(params.dusk);
        let night = this.parseTime(params.night); 
        // Note: night can be null for 'bright_night'

        if (dawn === null || noon === null || dusk === null) return 0.0; // Safety check

        // Lifecycle: Dawn -> Noon -> Dusk -> Night
        // Standard Day: 00:00 -> Dawn -> Noon -> Dusk -> Night -> 23:59
        
        // 1. Before Dawn (Night)
        if (currentMinutes < dawn) {
            return 1.0;
        }

        // 2. Dawn -> Noon (Brightening)
        // 1.0 -> 0.0
        if (currentMinutes >= dawn && currentMinutes < noon) {
            const progress = (currentMinutes - dawn) / (noon - dawn);
            return 1.0 - progress;
        }

        // 3. Noon -> Dusk (Transition to sunset)
        if (currentMinutes >= noon && currentMinutes < dusk) {
            const progress = (currentMinutes - noon) / (dusk - noon);
            return progress * 0.5; // Target 0.5 at sunset
        }

        // 4. Dusk -> Night (Twilight) or End of Day
        if (night !== null) {
            if (currentMinutes >= dusk && currentMinutes < night) {
                // 0.5 -> 1.0
                const progress = (currentMinutes - dusk) / (night - dusk);
                return 0.5 + (progress * 0.5);
            }
            // After Night (Fully Dark)
            if (currentMinutes >= night) {
                return 1.0;
            }
        } else {
            // Handle "Bright Night" (Mitternachtsdämmerung)
            if (params.type === "bright_night") {
                // Dusk -> Midnight (1440)
                // Interpolate to 0.85 (Deep Twilight) instead of full darkness
                const midnight = 1440;
                if (currentMinutes >= dusk) {
                   const progress = (currentMinutes - dusk) / (midnight - dusk);
                   return 0.5 + (progress * 0.35); 
                }
            } else {
                return 1.0;
            }
        }

        return 0;
    }

    static async update(worldTime) {
        try {
            // Check setting
            if (!game.settings.get(MODULE_ID, "autoLighting")) return;

            // Only GM updates scene darkness to ensure synchronization and permissions
            if (!game.user.isGM) return;

            const darkness = this.calculateDarkness(worldTime);
            
            // Validate Result
            if (isNaN(darkness) || darkness < 0 || darkness > 1) {
                console.warn(`PDNC | LightingSystem computed invalid darkness: ${darkness}. Skipping update.`);
                return;
            }

            // Update current scene if valid
            // Update current scene if valid and ready
            if (canvas && canvas.ready && canvas.scene && canvas.scene.active) {
                const currentDarkness = canvas.scene.environment?.darknessLevel ?? canvas.scene.darkness ?? 0;
                
                // Apply update if change is significant to avoid unnecessary DB operations
                if (Math.abs(currentDarkness - darkness) > 0.005) {
                    await canvas.scene.update({ darkness: darkness }, { animate: true });
                }
            }
        } catch (err) {
            console.error("PDNC | LightingSystem.update Error:", err);
        }
    }
}
