import { LIGHTING_DATA } from "./lighting-data.js";
import { WeatherSystem } from "./weather-system.js";

const MODULE_ID = "phils-day-night-cycle";

export const MOON_DATA = {
    cycle_length: 30,
    base_night_darkness: 0.95,
    phases: [
        { id: 0, name: "PDNC.MoonPhase.New", days: [1, 2, 29, 30], solar_offset_hours: 0, illumination: 0.0, icon_state: "empty", desc: "PDNC.MoonPhaseDesc.New" },
        { id: 1, name: "PDNC.MoonPhase.WaxingCrescent", days: [3, 4, 5, 6], solar_offset_hours: 9, illumination: 0.05, icon_state: "crescent", desc: "PDNC.MoonPhaseDesc.WaxingCrescent" },
        { id: 2, name: "PDNC.MoonPhase.FirstQuarter", days: [7, 8, 9, 10], solar_offset_hours: 10, illumination: 0.1, icon_state: "half", desc: "PDNC.MoonPhaseDesc.FirstQuarter" },
        { id: 3, name: "PDNC.MoonPhase.WaxingGibbous", days: [11, 12, 13, 14], solar_offset_hours: 11, illumination: 0.2, icon_state: "gibbous", desc: "PDNC.MoonPhaseDesc.WaxingGibbous" },
        { id: 4, name: "PDNC.MoonPhase.Full", days: [15, 16], solar_offset_hours: 12, illumination: 0.3, icon_state: "full", desc: "PDNC.MoonPhaseDesc.Full" },
        { id: 5, name: "PDNC.MoonPhase.WaningGibbous", days: [17, 18, 19, 20], solar_offset_hours: 13, illumination: 0.2, icon_state: "gibbous", desc: "PDNC.MoonPhaseDesc.WaningGibbous" },
        { id: 6, name: "PDNC.MoonPhase.LastQuarter", days: [21, 22, 23, 24], solar_offset_hours: 14, illumination: 0.1, icon_state: "half", desc: "PDNC.MoonPhaseDesc.LastQuarter" },
        { id: 7, name: "PDNC.MoonPhase.WaningCrescent", days: [25, 26, 27, 28], solar_offset_hours: 15, illumination: 0.05, icon_state: "crescent", desc: "PDNC.MoonPhaseDesc.WaningCrescent" }
    ]
};

export const REGIONAL_VISUALS = {
    northern_hemisphere: {
        fill_direction: "right-to-left",
        rotation: 0,
        zones: [
            "Tundra", "Boreal Forest / Taiga", "Mixed Forest / Humid Continental",
            "Cold Desert", "Semiarid / Steppe", "Marine West Coast", 
            "Humid Subtropical", "Hot Desert", "Temperate Rainforest", "Highland / Alpine"
        ]
    },
    southern_hemisphere: {
        fill_direction: "left-to-right",
        rotation: 180,
        zones: ["Ice Cap"]
    },
    equator: {
        fill_direction: "bottom-to-top",
        rotation: 90,
        zones: ["Tropical Rainforest", "Wet Savanna", "Dry Savanna", "Thorn Savanna"]
    }
};

export class LightingSystem {
    // Static State for Debouncing
    static _debounceTimer = null;

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

    static getMoonData(worldTime) {
        // Calculate Day Number (1-30)
        // Try to sync with the visual Calendar System first
        let dayInCycle = 1;
        
        if (window.PhilsDayNightCycle && window.PhilsDayNightCycle.calendar) {
            // Get the visual date from the calendar system
            const date = window.PhilsDayNightCycle.calendar.getDate(worldTime);
            
            dayInCycle = date.day % MOON_DATA.cycle_length;
            if (dayInCycle === 0) dayInCycle = 30;
            
        } else {
            // Fallback: Use Global Settings for Day Offset to assume "Current Day"
            const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
            const currentAbsoluteDay = Math.floor(worldTime / 86400) + offsetDays;
            
            // 1-based day for the cycle (1 to 30)
            dayInCycle = (currentAbsoluteDay % MOON_DATA.cycle_length) + 1;
        }
        
        // Calculate Smooth Cycle Age (for continuous offset)
        // Cycle Length = 30 days.
        // We need (DayIndex - 1) + (TimeOfDay / 24h).
        // 1-based day -> 0-based index.
        const secondsInDay = worldTime % 86400; // This might ignore offset?
        // We should use the same visual consistency.
        // Actually, let's just use the `secondsInDay` derived from the passed `worldTime`.
        // Note: worldTime passed in here is already adjusted for timeOffset in main.v2.js?
        // Let's check main.v2.js call site: 
        // const globalTime = game.time.worldTime + (timeOffset * 60);
        // So yes, it represents visual time.
        
        // Calculate fraction of day passed (0.0 to 0.99)
        const dayLength = 86400;
        let timeOfDay = worldTime % dayLength; 
        if (timeOfDay < 0) timeOfDay += dayLength;
        const dayFraction = timeOfDay / dayLength;
        
        const smoothCycleAge = (dayInCycle - 1) + dayFraction;
        
        // Check if Custom Moon Phases are enabled
        const useCustom = game.settings.get(MODULE_ID, "useCustomMoonPhases");
        let phases = MOON_DATA.phases;
        
        if (useCustom) {
            try {
                const customJSON = game.settings.get(MODULE_ID, "customMoonPhases");
                const customData = JSON.parse(customJSON);
                if (Array.isArray(customData) && customData.length > 0) {
                    phases = customData;
                }
            } catch (e) {
                console.error("PDNC | Invalid Custom Moon Phase JSON:", e);
            }
        }
        
        const phase = phases.find(p => p.days.includes(dayInCycle));
        const activePhase = phase || phases[0];
        
        // Determine Hemisphere/Region Visuals
        const climate = game.settings.get(MODULE_ID, "climateZone") || "marine_west_coast";
        
        // Find region
        let region = REGIONAL_VISUALS.northern_hemisphere; // Default
        for (const [key, data] of Object.entries(REGIONAL_VISUALS)) {
            if (data.zones) {
                const normalizedClimate = climate.toLowerCase().replace(/_/g, " ");
                const match = data.zones.some(z => normalizedClimate.includes(z.toLowerCase().split('/')[0].trim()));
                if (match) {
                    region = data;
                    break;
                }
            }
        }

        return {
            phase: activePhase,
            dayInCycle: dayInCycle,
            smoothCycleAge: smoothCycleAge,
            region: region
        };
    }


    static calculateMoonBrightness(currentMinutes, moonData, noonMinutes) {
        // 1. Calculate Peak Time (Moon Zenith)
        // Formula: Peak = Noon + Offset
        // Example: Full Moon (+12h) -> Peak = Noon + 12h = Midnight
        const offsetMinutes = moonData.phase.solar_offset_hours * 60;
        let peakParams = noonMinutes + offsetMinutes;
        
        // Normalize to 0-1440 cycle for distance check
        // But for "Window" check, it's easier to keep absolute relative to noon and unwrap currentMinutes
        
        const dayLength = 1440;
        
        // Define Visibility Window (Rise to Set)
        // Assuming ~12 hours visibility (Rise 6h before peak, Set 6h after)
        const riseMinutes = peakParams - 360; // -6h
        const setMinutes = peakParams + 360;  // +6h
        
        // We need to check if 'currentMinutes' is inside [riseMinutes, setMinutes]
        // Handling wrapping: simpler to "unwrap" currentMinutes relative to the window
        
        let adjustedCurrent = currentMinutes;
        
        // If the window wraps around a day boundary, we might need to check multiple versions of currentMinutes
        // Strategy: Normalize everything relative to Noon being 0 for easier math? 
        // Or simpler: Check distance from Peak.
        
        // Distance from Peak (Shortest path on 1440 circle)
        // 1. Normalize Peak to 0-1440
        let normalizedPeak = peakParams % dayLength; 
        if (normalizedPeak < 0) normalizedPeak += dayLength;
        
        let dist = Math.abs(currentMinutes - normalizedPeak);
        if (dist > 720) dist = 1440 - dist; // Wrap around distance
        
        // 2. Check Height (Intensity)
        // If distance < 360 (6 hours), it is "up".
        // 0 distance = Zenith (100%)
        // 360 distance = Horizon (0%)
        
        if (dist >= 360) return 0.0;
        
        // 3. Calculate Intensity Factor (Sine Wave for smooth arc)
        // cos(0) = 1, cos(PI/2) = 0.
        // Map dist 0..360 -> 0..PI/2
        const rad = (dist / 360) * (Math.PI / 2);
        const heightFactor = Math.cos(rad);
        
        // 4. Apply Phase Max Illumination
        // e.g. Full Moon (0.3) * heightFactor
        
        // 5. Sun Glare Rule (Optional but requested)
        // If Moon is effectively "New Moon" or very close to Sun, it's invisible.
        // The Solar Offset itself tells us distance from sun.
        // 0 = New Moon (With Sun). 12 = Full Moon (Opposite).
        // If offset is small (< 2h?), brightness is negligible anyway (New Moon is 0.0).
        // Our MOON_DATA.phases already handle this:
        // New Moon has illumination 0.0.
        // Waxing Crescent (4h offset) has 0.05.
        // So explicit glare check might be redundant for brightness, but good for completeness.
        
        return moonData.phase.illumination * heightFactor;
    }

    static calculateDarkness(worldTime) {
        const params = this.getClimateParams();
        if (!params) return 0.0;
        if (params.type === "polar_day") return 0.0;
        if (params.type === "polar_night") return 1.0;

        // Validation for missing times
        if (!params.dawn || !params.noon || !params.dusk) {
             // console.warn("PDNC | LightingSystem: Missing dawn/noon/dusk parameters.");
             return 0.0;
        }

        // Current time in minutes
        const dayLength = 86400;
        const timeOffset = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const adjustedTime = worldTime + (timeOffset * 60);

        const currentSeconds = ((adjustedTime % dayLength) + dayLength) % dayLength;
        const currentMinutes = Math.floor(currentSeconds / 60);

        const dawn = this.parseTime(params.dawn);
        const noon = this.parseTime(params.noon);
        const dusk = this.parseTime(params.dusk);
        let night = this.parseTime(params.night); 

        if (dawn === null || noon === null || dusk === null) return 0.0;
        
        // --- Calculate Moon Brightness (Dynamic) ---
        let moonDim = 0.0;
        if (game.settings.get(MODULE_ID, "enableMoonLighting")) {
             const moonData = this.getMoonData(worldTime);
             moonDim = this.calculateMoonBrightness(currentMinutes, moonData, noon);
        }

        // --- Standard Solar Cycle ---
        
        // 1. Before Dawn (Night)
        if (currentMinutes < dawn) {
            const baseNight = MOON_DATA.base_night_darkness;
            return Math.max(0, baseNight - moonDim);
        }

        // 2. Dawn -> Noon (Brightening)
        if (currentMinutes >= dawn && currentMinutes < noon) {
            const progress = (currentMinutes - dawn) / (noon - dawn);
            // Moon might still satisfy darkness if it's visible during day (often overpowered by sun)
            // We usually just take Sun brightness.
            // Darkness 1.0 -> 0.0
            return 1.0 - progress;
        }

        // 3. Noon -> Dusk (Transition to sunset)
        if (currentMinutes >= noon && currentMinutes < dusk) {
            const progress = (currentMinutes - noon) / (dusk - noon);
            return progress * 0.5; // Target 0.5 at sunset
        }

        // 4. Dusk -> Night (Twilight) or End of Day
        if (night !== null) {
            const baseNight = MOON_DATA.base_night_darkness;
            const targetDarkness = Math.max(0, baseNight - moonDim);

            if (currentMinutes >= dusk && currentMinutes < night) {
                // Transition Dusk (0.5) -> Night (Target)
                const progress = (currentMinutes - dusk) / (night - dusk);
                return 0.5 + (progress * (targetDarkness - 0.5));
            }
            // After Night
            if (currentMinutes >= night) {
                return targetDarkness;
            }
        } else {
            // "Bright Night" support
            if (params.type === "bright_night") {
                const midnight = 1440;
                if (currentMinutes >= dusk) {
                   const progress = (currentMinutes - dusk) / (midnight - dusk);
                   let sunDarkness = 0.5 + (progress * 0.35); // Max 0.85
                   return Math.max(0, sunDarkness - moonDim);
                }
            } else {
                 // Pre-Dawn Logic Fallback (should be covered by < dawn, but for safety)
                 const baseNight = MOON_DATA.base_night_darkness;
                 return Math.max(0, baseNight - moonDim);
            }
        }
        
        return 0; 
    }

    static async update(worldTime) {
        // Debounce Logic: Wait for 250ms of silence before updating
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
        
        this._debounceTimer = setTimeout(() => {
            this._performUpdate(worldTime);
        }, 250);
    }

    static async _performUpdate(worldTime) {
        try {
            // Check setting
            if (!game.settings.get(MODULE_ID, "autoLighting")) return;

            // Only GM updates scene darkness to ensure synchronization and permissions
            if (!game.user.isGM) return;

            const darkness = this.calculateDarkness(worldTime);
            
            // Validate Result
            if (isNaN(darkness) || darkness < 0 || darkness > 1) {
                // console.warn(`PDNC | LightingSystem computed invalid darkness: ${darkness}. Skipping update.`);
                return;
            }

            // Update current scene if valid and ready
            if (canvas && canvas.ready && canvas.scene && canvas.scene.active) {
                // Dungeon Mode Check
                if (canvas.scene.getFlag(MODULE_ID, "disableLighting")) {
                    // console.log("PDNC | Dungeon Mode Active: Lighting disabled for this scene.");
                    return;
                }

                const currentDarkness = canvas.scene.environment?.darknessLevel ?? canvas.scene.darkness ?? 0;
                
                // Apply update
                if (Math.abs(currentDarkness - darkness) > 0.005) {
                    await canvas.scene.update({ darkness: darkness }, { animate: true });
                }
            }
        } catch (err) {
            console.error("PDNC | LightingSystem.update Error:", err);
        }
    }
}
