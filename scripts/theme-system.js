export class ThemeSystem {
    static MODULE_ID = "phils-day-night-cycle";

    static DEFAULT_PHASES = [
        { id: "dawn", label: "PDNC.Phases.Dawn", start: 1.5, end: 4.5, default: "modules/phils-day-night-cycle/assets/clock/Dawn.webp" },
        { id: "morning", label: "PDNC.Phases.Morning", start: 4.5, end: 7.5, default: "modules/phils-day-night-cycle/assets/clock/Morning.webp" },
        { id: "late_morning", label: "PDNC.Phases.Forenoon", start: 7.5, end: 10.5, default: "modules/phils-day-night-cycle/assets/clock/Late_morning.webp" },
        { id: "noon", label: "PDNC.Phases.Noon", start: 10.5, end: 13.5, default: "modules/phils-day-night-cycle/assets/clock/Noon.webp" },
        { id: "afternoon", label: "PDNC.Phases.Afternoon", start: 13.5, end: 16.5, default: "modules/phils-day-night-cycle/assets/clock/Afternoon.webp" },
        { id: "evening", label: "PDNC.Phases.Evening", start: 16.5, end: 19.5, default: "modules/phils-day-night-cycle/assets/clock/Evening.webp" },
        { id: "late_evening", label: "PDNC.Phases.LateEvening", start: 19.5, end: 22.5, default: "modules/phils-day-night-cycle/assets/clock/Late_evening.webp" },
        { id: "night", label: "PDNC.Phases.Night", start: 22.5, end: 1.5, default: "modules/phils-day-night-cycle/assets/clock/Night.webp" }
    ];

    static get PHASES() {
        const definitions = game.settings.get(this.MODULE_ID, "phaseDefinitions");
        
        // If definitions is an array and not empty, use it as the source of truth
        if (Array.isArray(definitions) && definitions.length > 0) {
            return definitions;
        }

        // Fallback or migration: If it's the old object map, we should ideally migrate it, 
        // but for now let's just use the default array as the base and apply map overrides
        const defMap = (!Array.isArray(definitions) && typeof definitions === "object") ? definitions : {};

        return this.DEFAULT_PHASES.map(p => {
            const def = defMap[p.id] || {};
            return {
                ...p,
                label: def.label || p.label,
                start: def.start !== undefined ? def.start : p.start,
                end: def.end !== undefined ? def.end : p.end
            };
        });
    }

    /**
     * Converts HH:MM string to decimal hours.
     * @param {string} timeStr "HH:MM"
     * @returns {number} decimal hours
     */
    static parseTimeToDecimal(timeStr) {
        if (!timeStr || !timeStr.includes(":")) return 0;
        const [h, m] = timeStr.split(":").map(Number);
        return h + (m / 60);
    }

    /**
     * Converts decimal hours to HH:MM string.
     * @param {number} decimal 
     * @returns {string} "HH:MM"
     */
    static formatDecimalToTime(decimal) {
        const h = Math.floor(decimal);
        const m = Math.round((decimal % 1) * 60);
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }

    static PRESETS = {
        "fantasy": {
            label: "Standard Fantasy",
            config: {
                "dawn": "modules/phils-day-night-cycle/assets/clock/Dawn.webp",
                "morning": "modules/phils-day-night-cycle/assets/clock/Morning.webp",
                "late_morning": "modules/phils-day-night-cycle/assets/clock/Late_morning.webp",
                "noon": "modules/phils-day-night-cycle/assets/clock/Noon.webp",
                "afternoon": "modules/phils-day-night-cycle/assets/clock/Afternoon.webp",
                "evening": "modules/phils-day-night-cycle/assets/clock/Evening.webp",
                "late_evening": "modules/phils-day-night-cycle/assets/clock/Late_evening.webp",
                "night": "modules/phils-day-night-cycle/assets/clock/Night.webp"
            }
        },
        "standard_v2": {
            label: "Standard v2",
            config: {
                "dawn": "modules/phils-day-night-cycle/assets/clockv2/Dawn.webp",
                "morning": "modules/phils-day-night-cycle/assets/clockv2/Morning.webp",
                "late_morning": "modules/phils-day-night-cycle/assets/clockv2/Late_morning.webp",
                "noon": "modules/phils-day-night-cycle/assets/clockv2/Noon.webp",
                "afternoon": "modules/phils-day-night-cycle/assets/clockv2/Afternoon.webp",
                "evening": "modules/phils-day-night-cycle/assets/clockv2/Evening.webp",
                "late_evening": "modules/phils-day-night-cycle/assets/clockv2/Late_evening.webp",
                "night": "modules/phils-day-night-cycle/assets/clockv2/Night.webp"
            }
        },
        "mwangi": {
            label: "Mwangi Jungle",
            config: {
                "dawn": "modules/phils-day-night-cycle/assets/clockmw/Dawn.webp",
                "morning": "modules/phils-day-night-cycle/assets/clockmw/Morning.webp",
                "late_morning": "modules/phils-day-night-cycle/assets/clockmw/Late_morning.webp",
                "noon": "modules/phils-day-night-cycle/assets/clockmw/Noon.webp",
                "afternoon": "modules/phils-day-night-cycle/assets/clockmw/Afternoon.webp",
                "evening": "modules/phils-day-night-cycle/assets/clockmw/Evening.webp",
                "late_evening": "modules/phils-day-night-cycle/assets/clockmw/Late_evening.webp",
                "night": "modules/phils-day-night-cycle/assets/clockmw/Night.webp"
            }
        },
        "vikingar": {
            label: "Víkingar",
            config: {
                "dawn": "modules/phils-day-night-cycle/assets/clockvik/Dawn.webp",
                "morning": "modules/phils-day-night-cycle/assets/clockvik/Morning.webp",
                "late_morning": "modules/phils-day-night-cycle/assets/clockvik/Latee_Morning.webp",
                "noon": "modules/phils-day-night-cycle/assets/clockvik/Noon.webp",
                "afternoon": "modules/phils-day-night-cycle/assets/clockvik/Afternoon.webp",
                "evening": "modules/phils-day-night-cycle/assets/clockvik/Evening.webp",
                "late_evening": "modules/phils-day-night-cycle/assets/clockvik/Late_Evening.webp",
                "night": "modules/phils-day-night-cycle/assets/clockvik/Night.webp"
            }
        }
    };

    static init() {
        this.registerSettings();
    }

    static registerSettings() {
        game.settings.register(this.MODULE_ID, "themePreset", {
            name: "Theme Preset",
            hint: "Select a predefined theme to automatically configure all phase images.",
            scope: "world",
            config: true,
            type: String,
            choices: Object.fromEntries(Object.entries(this.PRESETS).map(([k, v]) => [k, v.label])),
            default: "fantasy",
            onChange: (value) => {
                this.applyPreset(value);
            }
        });

        // Dependency: Register phaseDefinitions BEFORE themeConfig because getDefaultConfig() needs it
        game.settings.register(this.MODULE_ID, "phaseDefinitions", {
            name: "Phase Definitions",
            scope: "world",
            config: false,
            type: Object,
            default: {},
            onChange: () => {
                Hooks.callAll("pdnc.themeUpdated");
            }
        });

        // We store the mapping in a single object
        game.settings.register(this.MODULE_ID, "themeConfig", {
            name: "Theme Configuration",
            scope: "world",
            config: false,
            type: Object,
            default: this.getDefaultConfig(),
            onChange: () => {
                Hooks.callAll("pdnc.themeUpdated");
            }
        });
    }

    static async applyPreset(presetKey) {
        const preset = this.PRESETS[presetKey];
        if (!preset) return;

        // Clone to avoid reference issues
        const newConfig = { ...preset.config };
        
        await game.settings.set(this.MODULE_ID, "themeConfig", newConfig);
        ui.notifications.info(`Theme Preset '${preset.label}' applied.`);
        // Trigger update
        Hooks.callAll("pdnc.themeUpdated");
    }

    static getDefaultConfig() {
        const config = {};
        this.PHASES.forEach(p => {
            config[p.id] = p.default;
        });
        return config;
    }


    /**
     * Resolves the image to use for a phase, propagating from previous phases if empty.
     * @param {Object} config The themeConfig settings object
     * @param {string} phaseId The phase ID to resolve
     * @returns {string} The path to the image
     */
    static resolvePhaseImage(config, phaseId) {
        const phases = this.PHASES;
        const phaseIndex = phases.findIndex(p => p.id === phaseId);
        
        // 1. Direct hit?
        if (config && config[phaseId]) return config[phaseId];

        // 2. Circular Propagation (Backwards)
        for (let i = 1; i < phases.length; i++) {
            const idx = (phaseIndex - i + phases.length) % phases.length;
            const prevId = phases[idx].id;
            if (config && config[prevId]) return config[prevId];
        }

        // 3. Absolute Fallback: Module Default or First Available
        const currentPhase = phases.find(p => p.id === phaseId);
        if (currentPhase && currentPhase.default) return currentPhase.default;
        
        // If it's a new custom phase with no image and no propagation possible, 
        // try to find ANY default from the DEFAULT_PHASES just to have something.
        return this.DEFAULT_PHASES[0].default;
    }

    static getBackgroundImage() {
        const time = game.time.worldTime;
        // Apply Offsets (same logic as main.v2.js / weather-hud.js)
        const offsetMinutes = game.settings.get(this.MODULE_ID, "timeOffset") || 0;
        const offsetDays = game.settings.get(this.MODULE_ID, "dayOffset") || 0;
        
        let adjustedTime = time + (offsetMinutes * 60) + (offsetDays * 86400);

        const dayLength = 86400; 
        const secondsOfDay = adjustedTime % dayLength;
        const hours = secondsOfDay / 3600;

        // Find Phase
        const phase = this.PHASES.find(p => {
            if (p.start < p.end) {
                return hours >= p.start && hours < p.end;
            } else {
                // Wrap around (Night)
                return hours >= p.start || hours < p.end;
            }
        });

        const config = game.settings.get(this.MODULE_ID, "themeConfig");
        
        if (phase) {
            return this.resolvePhaseImage(config, phase.id);
        }

        return this.resolvePhaseImage(config, "noon");
    }

    static getPhaseSectors() {
        const config = game.settings.get(this.MODULE_ID, "themeConfig");
        
        return this.PHASES.map(phase => {
            // Calculate Angles (00:00 is Top = -90 degrees in standard circle math)
            // But we can simplify by just generating paths relative to a 0-100 coordinate system
            
            // Start and End hours
            let start = phase.start;
            let end = phase.end;
            
            // Handle wrap-around (Night: 22 -> 4)
            if (end < start) end += 24;

            return {
                id: phase.id,
                imageUrl: this.resolvePhaseImage(config, phase.id),
                startHour: start,
                endHour: end
            };
        });
    }
}
