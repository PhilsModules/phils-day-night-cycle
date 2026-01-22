import { WeatherEffectsRegistry } from "../weather-effects.js";

const MODULE_ID = "phils-day-night-cycle";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class WeatherMixerApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.onSubmitCallback = options.callback;
    }

    static get DEFAULT_OPTIONS() {
        return {
            tag: "form",
            window: {
                title: "PDNC.WeatherMixer.Title",
                icon: "fas fa-flask",
                resizable: true,
                width: 600,
                height: 500
            },
            classes: ["pdnc-app", "pdnc-weather-mixer-window"],
            position: { width: 600, height: 500 },
            actions: {
                "save-favorite": WeatherMixerApp.prototype._onSaveFavorite,
                "delete-favorite": WeatherMixerApp.prototype._onDeleteFavorite,
                "load-favorite": WeatherMixerApp.prototype._onLoadFavorite,
                "create-mix": WeatherMixerApp.prototype._onCreateMix
            }
        };
    }

    static get PARTS() {
        return {
            content: {
                template: `modules/${MODULE_ID}/templates/weather-mixer.hbs`,
                scrollable: [".effects-list", ".favorites-list"]
            }
        };
    }

    async _prepareContext(options) {
        // Helper to Convert keys (e.g. "heavy_rain" or "heavyRain") to PascalCase ("HeavyRain")
        const toPascalCase = (str) => {
            return str
                .replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase()) // snake_case/kebab-case to camelCase
                .replace(/^(\w)/, (_, c) => c.toUpperCase()); // first char to Upper
        };

        // 1. Get all available effects
        const effects = {};
        if (CONFIG.Weather && CONFIG.Weather.effects) {
            for (const [key, config] of Object.entries(CONFIG.Weather.effects)) {
                // Skip existing custom mixes to prevent recursion/clutter
                if (key.startsWith("custom_mix_")) continue;

                // 1. Get original label (might have prefix "01. Rain")
                let originalLabel = config.label ? game.i18n.localize(config.label) : key;

                // 2. Extract Prefix (e.g. "01. ")
                const prefixMatch = originalLabel.match(/^(\d+\.?\s*)/);
                const prefix = prefixMatch ? prefixMatch[1] : "";

                // 3. Try to find a localized name using our PascalCase key
                const pascalKey = toPascalCase(key);
                const i18nKey = `PDNC.WeatherEffects.${pascalKey}`;
                
                let translatedName = originalLabel;
                
                // If we have a translation for the semantic name (e.g. "Rain" -> "Regen")
                // We use that, but we must prepend the prefix back.
                if (game.i18n.has(i18nKey)) {
                    translatedName = game.i18n.localize(i18nKey);
                    // If the translation itself doesn't have the number (it shouldn't), add it
                    if (!translatedName.startsWith(prefix)) {
                        translatedName = prefix + translatedName;
                    }
                }

                effects[key] = translatedName;
            }
        }
        
        // Sort by LABEL (which now includes "01.", "02." etc so it sorts numerically)
        const sortedEffects = Object.fromEntries(
            Object.entries(effects).sort(([,a], [,b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        );

        // 2. Get Favorites
        const favorites = game.settings.get(MODULE_ID, "weatherMixerFavorites") || {};

        return {
            effects: sortedEffects,
            favorites: favorites
        };
    }

    async _onSaveFavorite(event, target) {
        const input = this.element.querySelector('input[name="favoriteName"]');
        const name = input.value.trim();
        if (!name) return ui.notifications.warn("PDNC.WeatherMixer.WarnNoName", { localize: true });

        // Get selected checks
        const formData = new FormData(this.element);
        const selectedKeys = formData.getAll("effects");

        if (selectedKeys.length === 0) return ui.notifications.warn("PDNC.WeatherMixer.WarnNoEffects", { localize: true });

        const favorites = game.settings.get(MODULE_ID, "weatherMixerFavorites") || {};
        favorites[name] = selectedKeys;

        await game.settings.set(MODULE_ID, "weatherMixerFavorites", favorites);
        
        // Register immediately so it appears in Config Dropdown
        WeatherEffectsRegistry.loadFavorites();
        
        ui.notifications.info(game.i18n.format("PDNC.WeatherMixer.SavedFavorite", { name }));
        
        input.value = "";
        this.render();
    }

    async _onDeleteFavorite(event, target) {
        const key = target.dataset.key;
        const favorites = game.settings.get(MODULE_ID, "weatherMixerFavorites") || {};
        
        if (favorites[key]) {
            delete favorites[key];
            await game.settings.set(MODULE_ID, "weatherMixerFavorites", favorites);
            
            // Unregister from CONFIG
            const safeKey = key.toLowerCase().replace(/[^a-z0-9]/g, "_");
            const id = `fav_${safeKey}`;
            if (CONFIG.Weather.effects[id]) {
                delete CONFIG.Weather.effects[id];
            }

            this.render();
        }
    }

    async _onLoadFavorite(event, target) {
        const key = target.dataset.key;
        const favorites = game.settings.get(MODULE_ID, "weatherMixerFavorites") || {};
        const selectedKeys = favorites[key];

        if (selectedKeys) {
            // Uncheck all
            this.element.querySelectorAll('input[type="checkbox"]').forEach(box => box.checked = false);
            
            // Check saved
            selectedKeys.forEach(k => {
                const box = this.element.querySelector(`input[value="${k}"]`);
                if (box) box.checked = true;
            });
        }
    }

    async _onCreateMix(event, target) {
        event.preventDefault();

        const formData = new FormData(this.element);
        const selectedKeys = formData.getAll("effects");

        if (selectedKeys.length === 0) return this.close();

        // Use input name if provided, otherwise default
        const input = this.element.querySelector('input[name="favoriteName"]');
        const name = input ? input.value.trim() : "";
        const label = name || `Custom Mix (${selectedKeys.length})`;

        // MERGE LOGIC
        const compositeConfig = {
            id: `custom_mix_${Date.now()}`,
            label: label,
            filters: [],
            effects: []
        };

        for (const key of selectedKeys) {
            const config = CONFIG.Weather.effects[key];
            if (!config) continue;

            if (config.filters) {
                compositeConfig.filters.push(...config.filters);
            }
            if (config.effects) {
                compositeConfig.effects.push(...config.effects);
            }
        }

        // Register
        WeatherEffectsRegistry.registerEffect(compositeConfig.id, compositeConfig);

        // Notify Parent
        if (this.onSubmitCallback) {
            this.onSubmitCallback(compositeConfig.id);
        }

        this.close();
    }
}
