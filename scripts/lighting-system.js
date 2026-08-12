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

    static calculateMoonPhaseAngle(dayInCycle, cycleLength, dayFraction = 0) {
        const safeCycleLength = Math.max(1, Number(cycleLength) || 1);
        const normalizedAge = ((((Number(dayInCycle) || 1) - 1) + dayFraction) % safeCycleLength + safeCycleLength) % safeCycleLength;
        return (normalizedAge / safeCycleLength) * Math.PI * 2;
    }

    static calculateMoonIlluminationFraction(dayInCycle, cycleLength, dayFraction = 0) {
        const phaseAngle = this.calculateMoonPhaseAngle(dayInCycle, cycleLength, dayFraction);
        return (1 - Math.cos(phaseAngle)) / 2;
    }

    static _buildMoonPolygonPath(points, radius = 49, center = 50) {
        if (!Array.isArray(points) || points.length === 0) return "";

        const scalePoint = ([x, y]) => {
            const px = center + (x * radius);
            const py = center + (y * radius);
            return `${px.toFixed(2)} ${py.toFixed(2)}`;
        };

        return `M ${points.map(scalePoint).join(" L ")} Z`;
    }

    static _sampleMoonShapePoints(phaseAngle, steps = 32) {
        const safeSteps = Math.max(8, Number(steps) || 32);
        const normalizedAngle = ((phaseAngle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
        const cosine = Math.cos(normalizedAngle);
        const isWaxing = normalizedAngle <= Math.PI;

        const terminatorPoints = [];
        for (let i = 0; i <= safeSteps; i++) {
            const y = -1 + ((2 * i) / safeSteps);
            const limbWidth = Math.sqrt(Math.max(0, 1 - (y * y)));
            const x = (isWaxing ? cosine : -cosine) * limbWidth;
            terminatorPoints.push([x, y]);
        }

        const outerPoints = [];
        for (let i = 0; i <= safeSteps; i++) {
            const t = -Math.PI / 2 + (Math.PI * i / safeSteps);
            const x = (isWaxing ? 1 : -1) * Math.cos(t);
            const y = Math.sin(t);
            outerPoints.push([x, y]);
        }

        return isWaxing
            ? [...terminatorPoints, ...outerPoints.reverse()]
            : [...outerPoints, ...terminatorPoints.reverse()];
    }

    static buildMoonBadgeStyle(dayInCycle, cycleLength, dayFraction = 0) {
        if (!dayInCycle || !cycleLength) return "";
        const illuminationFraction = this.calculateMoonIlluminationFraction(dayInCycle, cycleLength, dayFraction);
        const phaseAngle = this.calculateMoonPhaseAngle(dayInCycle, cycleLength, dayFraction);

        let svg;
        const colorMoon = "#f5efda"; // Light
        const colorDark = "#101521"; // Shadow
        
        if (illuminationFraction <= 0.005) {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="${colorDark}"/></svg>`;
        } else if (illuminationFraction >= 0.995) {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="${colorMoon}"/></svg>`;
        } else {
            const pts = this._sampleMoonShapePoints(phaseAngle, 32);
            const pathData = this._buildMoonPolygonPath(pts, 49, 50);
            svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" shape-rendering="geometricPrecision"><circle cx="50" cy="50" r="49" fill="${colorDark}"/><path d="${pathData}" fill="${colorMoon}"/></svg>`;
        }

        const b64 = btoa(svg);
        return `background-image: url('data:image/svg+xml;base64,${b64}'); background-size: contain; background-repeat: no-repeat; background-position: center; border: none !important; box-shadow: none !important;`;
    }

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

        const cycleLength = Math.max(
            1,
            ...phases.flatMap(phase => Array.isArray(phase.days) ? phase.days : [])
        );

        // Calculate Day Number (1..cycleLength) based on absolute world time
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const currentAbsoluteDay = Math.floor(worldTime / 86400) + offsetDays;
        
        const dayInCycle = ((currentAbsoluteDay % cycleLength) + cycleLength) % cycleLength + 1;
        
        // Calculate Smooth Cycle Age (for continuous offset)
        const dayLength = 86400;
        let timeOfDay = worldTime % dayLength; 
        if (timeOfDay < 0) timeOfDay += dayLength;
        const dayFraction = timeOfDay / dayLength;
        const smoothCycleAge = (dayInCycle - 1) + dayFraction;
        
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

        const waxingThreshold = cycleLength / 2;
        const isWaning = dayInCycle > waxingThreshold;
        const phaseLabel = activePhase?.name?.startsWith?.("PDNC.")
            ? game.i18n.localize(activePhase.name)
            : (activePhase?.name || "Moon Phase");
        const phaseDescription = activePhase?.desc?.startsWith?.("PDNC.")
            ? game.i18n.localize(activePhase.desc)
            : (activePhase?.desc || phaseLabel);
        const illuminationFraction = this.calculateMoonIlluminationFraction(dayInCycle, cycleLength, dayFraction);
        const badgeStyle = this.buildMoonBadgeStyle(dayInCycle, cycleLength, dayFraction);

        return {
            phase: activePhase,
            dayInCycle: dayInCycle,
            smoothCycleAge: smoothCycleAge,
            region: region,
            cycleLength: cycleLength,
            illuminationFraction: illuminationFraction,
            isWaxing: !isWaning,
            isWaning: isWaning,
            phaseLabel: phaseLabel,
            phaseDescription: phaseDescription,
            phaseCssClass: `pdnc-moon-phase ${activePhase?.icon_state || "empty"} ${isWaning ? "waning" : "waxing"}`,
            badgeStyle: badgeStyle
        };
    }


    static calculateMoonBrightness(currentMinutes, moonData, noonMinutes) {
        const offsetMinutes = moonData.phase.solar_offset_hours * 60;
        const peakParams = noonMinutes + offsetMinutes;
        const dayLength = 1440;

        let normalizedPeak = peakParams % dayLength; 
        if (normalizedPeak < 0) normalizedPeak += dayLength;

        let dist = Math.abs(currentMinutes - normalizedPeak);
        if (dist > 720) dist = 1440 - dist;

        if (dist >= 360) return 0.0;

        const rad = (dist / 360) * (Math.PI / 2);
        const heightFactor = Math.cos(rad);

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
        // Moon does NOT affect daytime brightness (sun dominates).
        // We blend from (baseNight - moonDim) at dawn toward 0 at noon.
        if (currentMinutes >= dawn && currentMinutes < noon) {
            let progress = (currentMinutes - dawn) / (noon - dawn);
            progress = Math.sin(progress * (Math.PI / 2));
            const baseNight = MOON_DATA.base_night_darkness;
            const dawnDarkness = Math.max(0, baseNight - moonDim); // How dark it still was at dawn
            return Math.max(0, dawnDarkness * (1.0 - progress));
        }

        // 3. Noon -> Dusk (Transition to sunset - sun dominates, moon has no effect)
        if (currentMinutes >= noon && currentMinutes < dusk) {
            let progress = (currentMinutes - noon) / (dusk - noon);
            progress = 1 - Math.cos(progress * (Math.PI / 2));
            return Math.max(0, progress * 0.5); // Target 0.5 at dusk, no moon influence
        }

        // 4. Dusk -> Night (Twilight) or End of Day
        if (night !== null) {
            const baseNight = MOON_DATA.base_night_darkness;
            const targetDarkness = Math.max(0, baseNight - moonDim);
            const duskDarkness = Math.max(0, 0.5 - moonDim);

            if (currentMinutes >= dusk && currentMinutes < night) {
                // Transition Dusk -> Night (Target)
                let progress = (currentMinutes - dusk) / (night - dusk);
                progress = Math.sin(progress * (Math.PI / 2));
                return duskDarkness + (progress * (targetDarkness - duskDarkness));
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

    static refresh() {
        this.update(game.time.worldTime);
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
                console.warn(`PDNC | LightingSystem: Invalid darkness value (${darkness}) – skipping update.`);
                return;
            }

            // Update current scene if valid and ready
            if (canvas && canvas.ready && canvas.scene) {
                // Dungeon Mode Check
                if (canvas.scene.getFlag(MODULE_ID, "disableLighting")) {
                    console.log("PDNC | LightingSystem: Dungeon Mode active – lighting update skipped.");
                    return;
                }

                // --- Robust darkness read: try all known properties across v11/v12/v13/v14 ---
                let currentDarkness = 0;
                let readPath = "default(0)";
                if (typeof canvas.scene.environment?.darknessLevel === "number") {
                    currentDarkness = canvas.scene.environment.darknessLevel;
                    readPath = "scene.environment.darknessLevel";
                } else if (typeof canvas.scene.darknessLevel === "number") {
                    currentDarkness = canvas.scene.darknessLevel;
                    readPath = "scene.darknessLevel";
                } else if (typeof canvas.scene.darkness === "number") {
                    currentDarkness = canvas.scene.darkness;
                    readPath = "scene.darkness";
                }

                // --- Detailed Debug Logging ---
                const params = this.getClimateParams();
                const timeOffset = game.settings.get(MODULE_ID, "timeOffset") || 0;
                const adjustedTime = worldTime + (timeOffset * 60);
                const dayLength = 86400;
                const currentSeconds = ((adjustedTime % dayLength) + dayLength) % dayLength;
                const currentMinutes = Math.floor(currentSeconds / 60);
                const hh = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
                const mm = String(currentMinutes % 60).padStart(2, "0");

                let moonDim = 0.0;
                let moonPhaseLabel = "—";
                let moonIllumination = 0.0;
                if (game.settings.get(MODULE_ID, "enableMoonLighting")) {
                    const moonData = this.getMoonData(worldTime);
                    moonDim = this.calculateMoonBrightness(currentMinutes, moonData, this.parseTime(params?.noon));
                    moonPhaseLabel = moonData.phaseLabel;
                    moonIllumination = moonData.illuminationFraction;
                }

                const delta = Math.abs(currentDarkness - darkness);
                const willUpdate = delta > 0.005;

                if (willUpdate) {
                    const updateData = {
                        "environment.darknessLevel": darkness,
                        "darkness": darkness
                    };
                    await canvas.scene.update(updateData);
                }
            }
        } catch (err) {
            console.error("PDNC | LightingSystem.update Error:", err);
        }
    }

}
