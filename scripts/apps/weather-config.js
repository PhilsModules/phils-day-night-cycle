import { WeatherSystem } from "../weather-system.js";
import { WeatherMixerApp } from "./weather-mixer.js";

const MODULE_ID = "phils-day-night-cycle";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class WeatherConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        // data passed via options.weather
        this.weatherData = options.weather; 
        if (!this.weatherData) {
             this.weatherData = {
                 description: "",
                 tempMin: 10,
                 tempMax: 15,
                 fx: ""
             };
        }
    }

    static get DEFAULT_OPTIONS() {
        return {
            tag: "form",
            window: {
                title: "PDNC.WeatherConfig.Title",
                icon: "fas fa-cloud-sun",
                resizable: true
            },
            position: {
                width: 400,
                height: "auto"
            },
            classes: ["pdnc-app"],
            actions: {
                reroll: WeatherConfigApp.prototype._onReroll,
                apply: WeatherConfigApp.prototype._onApply,
                "open-mixer": WeatherConfigApp.prototype._onOpenMixer
            }
        };
    }

    async _onOpenMixer(event, target) {
        new WeatherMixerApp({
            callback: (mixedKey) => {
                // Determine label (Custom Mix)
                const config = CONFIG.Weather.effects[mixedKey];
                const label = config.label || "Custom Mix";
                
                // We need to inject this into the choices and select it
                // Since this isn't React, we should re-render or hack it into the DOM.
                // Best to re-render.
                
                // We fake it by setting it in our data temporarily? 
                // No, render() rebuilds choices from CONFIG.Weather.effects
                // and we just registered it there. So we just need to select it.
                
                this.weatherData.fx = mixedKey;
                this.render();
            }
        }).render(true);
    }

    static get PARTS() {
        return {
            form: {
                id: "form",
                template: `modules/${MODULE_ID}/templates/weather-config-form.hbs`,
                scrollable: []
            }
        };
    }

    async render(options) {
        if (typeof options === "boolean") options = { force: options };
        return super.render(options);
    }

    async _prepareContext(options) {
        const fxChoices = {
            "rain": game.i18n.localize("PDNC.WeatherFX.Rain"),
            "snow": game.i18n.localize("PDNC.WeatherFX.Snow"),
            "clouds": game.i18n.localize("PDNC.WeatherFX.Clouds")
        };

        // Add custom effects from configuration
        // Helper to Convert keys (e.g. "heavy_rain" or "heavyRain") to PascalCase ("HeavyRain")
        const toPascalCase = (str) => {
            return str
                .replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase()) // snake_case/kebab-case to camelCase
                .replace(/^(\w)/, (_, c) => c.toUpperCase()); // first char to Upper
        };

        // Add custom effects from configuration
        if (CONFIG.Weather && CONFIG.Weather.effects) {
            for (const [key, config] of Object.entries(CONFIG.Weather.effects)) {
                // 1. Try generic method (if label is a translation key)
                let label = config.label ? game.i18n.localize(config.label) : key;
                
                // Check if the original label has a numbering prefix (e.g. "03. Heavy Rain")
                // We want to preserve "03. " if we translate the rest.
                const prefixMatch = label.match(/^(\d+\.?\s*)/);
                const prefix = prefixMatch ? prefixMatch[1] : "";

                // 2. Try to match against our internal PDNC.WeatherEffects list
                // This helps if the source module (e.g. FXMaster) provides English labels but predictable keys
                const pascalKey = toPascalCase(key);
                const pdncKey = `PDNC.WeatherEffects.${pascalKey}`;
                const pdncLoc = game.i18n.localize(pdncKey);
                
                // If we found a translation in our system (and it's not just the key back), prefer it
                if (pdncLoc && pdncLoc !== pdncKey) {
                    label = prefix + pdncLoc;
                }

                fxChoices[key] = label;
            }
        }

        // Sort choices alphabetically by localized label
        const sortedFxChoices = Object.fromEntries(
            Object.entries(fxChoices).sort(([,a], [,b]) => a.localeCompare(b))
        );

        const unit = game.settings.get(MODULE_ID, "temperatureUnit") || "C";
        let displayMin = this.weatherData.tempMin;
        let displayMax = this.weatherData.tempMax;

        if (unit === "F") {
            if (this.weatherData.tempMinF !== undefined) {
                displayMin = this.weatherData.tempMinF;
                displayMax = this.weatherData.tempMaxF;
            } else {
                displayMin = Math.round((this.weatherData.tempMin * 9/5) + 32);
                displayMax = Math.round((this.weatherData.tempMax * 9/5) + 32);
            }
        }

        return {
            weather: {
                ...this.weatherData,
                displayMin: displayMin,
                displayMax: displayMax
            },
            climate: this.weatherData.climateName || "Unknown",
            season: this.weatherData.seasonName || "Unknown",
            fxChoices: sortedFxChoices,
            noneLabel: game.i18n.localize("PDNC.Recurs.none"),
            unit: unit
        };
    }

    async _onReroll(event, target) {
        // Generate new random weather
        const newWeather = WeatherSystem.generateWeather(); 
        
        this.weatherData = {
            ...this.weatherData,
            ...newWeather
        };
        
        this.render();
    }

    async _onApply(event, target) {
        event.preventDefault(); // Stop normal submission if needed, though V2 handles form differently often

        const formData = new FormData(this.element);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        const unit = game.settings.get(MODULE_ID, "temperatureUnit") || "C";
        const inputMin = parseInt(data.tempMin);
        const inputMax = parseInt(data.tempMax);

        let tempMinC = inputMin;
        let tempMaxC = inputMax;
        let tempMinF = inputMin;
        let tempMaxF = inputMax;

        if (unit === "F") {
            // User input F. We store F. We convert to C for legacy.
            tempMinC = Math.round((inputMin - 32) * 5/9);
            tempMaxC = Math.round((inputMax - 32) * 5/9);
        } else {
             // User input C. We convert to F.
             tempMinF = Math.round((inputMin * 9/5) + 32);
             tempMaxF = Math.round((inputMax * 9/5) + 32);
        }

        const finalWeather = {
             ...this.weatherData,
             description: data.description,
             text: data.description,
             tempMin: tempMinC,
             tempMax: tempMaxC,
             tempMinC: tempMinC, // Explicit new structure
             tempMaxC: tempMaxC,
             tempMinF: tempMinF,
             tempMaxF: tempMaxF,
             fx: data.fx || null,
             generated: true
        };

        await WeatherSystem.applyWeather(finalWeather);
        this.close();
    }
}
