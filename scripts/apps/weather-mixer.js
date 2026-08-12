import { WeatherEffectsRegistry } from "../weather-effects.js";
import { WeatherSystem } from "../weather-system.js";

const MODULE_ID = "phils-day-night-cycle";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class WeatherMixerApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.onSubmitCallback = options.callback;
        
        // Local State
        this.currentLayers = []; 
        this.currentMixName = "";
    }

    static get DEFAULT_OPTIONS() {
        return {
            tag: "form",
            window: {
                title: "PDNC.WeatherMixer.Title",
                icon: "fas fa-flask",
                resizable: true,
                width: 900,
                height: 700
            },
            classes: ["pdnc-app-v2", "pdnc-weather-mixer-window"],
            position: { width: 900, height: 700 },
            actions: {
                "remove-layer": WeatherMixerApp.prototype._onRemoveLayer,
                "add-component": WeatherMixerApp.prototype._onAddComponent,
                "remove-component": WeatherMixerApp.prototype._onRemoveComponent,
                "save-favorite": WeatherMixerApp.prototype._onSaveFavorite,
                "load-favorite": WeatherMixerApp.prototype._onLoadFavorite,
                "delete-favorite": WeatherMixerApp.prototype._onDeleteFavorite,
                "create-mix": WeatherMixerApp.prototype._onCreateMix,
                "preview-mix": WeatherMixerApp.prototype._onPreviewMix,
                "add-layer": WeatherMixerApp.prototype._onAddLayer,
                "update-param": WeatherMixerApp.prototype._onUpdateParam,
                "toggle-collapse": WeatherMixerApp.prototype._onToggleCollapse
            }
        };
    }

    async _onClose(options) {
        if (this.isPreviewing) {
            const weather = game.settings.get(MODULE_ID, "currentWeather");
            const fx = weather?.fx || "none";
            WeatherEffectsRegistry.applyWeatherFilters(fx);
            this.isPreviewing = false;
        }
        return super._onClose(options);
    }

    async _onPreviewMix(event, target) {
        event.preventDefault();
        
        // Toggle State
        this.isPreviewing = !this.isPreviewing;

        const btn = target.closest("button");
        if (this.isPreviewing) {
            // Start Preview
            const composite = this._buildCompositeConfig("preview_temp", "Preview");
            
            // Register Temp
            WeatherEffectsRegistry.registerEffect("preview_temp", composite);
            
            // Apply Locally
            WeatherEffectsRegistry.applyWeatherFilters("preview_temp");

            // Update UI
            if (btn) {
                btn.classList.add("active");
                btn.innerHTML = `<i class="fas fa-stop"></i> Stop`;
            }
            ui.notifications.info("PDNC.WeatherMixer.PreviewStarted", { localize: true });
        } else {
            // Stop Preview
            // Revert to global weather
            const weather = game.settings.get(MODULE_ID, "currentWeather");
            const fx = weather?.fx || "none";
            WeatherEffectsRegistry.applyWeatherFilters(fx);
            
            // Update UI
            if (btn) {
                btn.classList.remove("active");
                btn.innerHTML = `<i class="fas fa-eye"></i> ${game.i18n.localize("PDNC.WeatherMixer.Preview")}`;
            }
        }
    }

    static get PARTS() {
        return {
            content: {
                template: `modules/${MODULE_ID}/templates/weather-mixer.hbs`,
                scrollable: [".pdnc-preset-list", ".pdnc-layers-scroll"]
            }
        };
    }

    async _prepareContext(options) {
        const toPascalCase = (str) => {
            return str
                .replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
                .replace(/^(\w)/, (_, c) => c.toUpperCase());
        };

        // 1. Get all available effects for the sidebar
        const effects = {};
        if (CONFIG.Weather && CONFIG.Weather.effects) {
            for (const [key, config] of Object.entries(CONFIG.Weather.effects)) {
                if (key.startsWith("custom_mix_")) continue;
                if (key.startsWith("fav_")) continue;

                let originalLabel = config.label ? game.i18n.localize(config.label) : key;
                const prefixMatch = originalLabel.match(/^(\d+\.?\s*)/);
                const prefix = prefixMatch ? prefixMatch[1] : "";

                const pascalKey = toPascalCase(key);
                const i18nKey = `PDNC.WeatherEffects.${pascalKey}`;
                
                let translatedName = originalLabel;
                if (game.i18n.has(i18nKey)) {
                    translatedName = game.i18n.localize(i18nKey);
                    if (!translatedName.startsWith(prefix)) {
                        translatedName = prefix + translatedName;
                    }
                }
                effects[key] = translatedName;
            }
        }
        
        const sortedEffects = Object.fromEntries(
            Object.entries(effects).sort(([,a], [,b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        );

        const favorites = game.settings.get(MODULE_ID, "weatherMixerFavorites") || {};

        return {
            effects: sortedEffects,
            favorites: favorites,
            layers: this.currentLayers,
            mixName: this.currentMixName,
            isPreviewing: this.isPreviewing
        };
    }

    // --- Action Handlers ---

    async _onAddLayer(event, target) {
        const key = target.dataset.key;
        const config = CONFIG.Weather?.effects?.[key];
        if (!config) return;

        const nameSpan = target.querySelector(".preset-name");
        const labelText = nameSpan ? nameSpan.innerText.trim() : target.innerText.trim();

        const layer = {
            id: foundry.utils.randomID(),
            sourceKey: key,
            label: labelText,
            collapsed: false,
            components: this._generateComponentData(config)
        };

        this.currentLayers.push(layer);
        this.render();
    }

    _onRender(context, options) {
        super._onRender(context, options);

        // Bind 'change' and 'input' for parameters since data-action is mainly for clicks
        const inputs = this.element.querySelectorAll('[data-action="update-param"]');
        inputs.forEach(input => {
            input.addEventListener("change", (ev) => this._onUpdateParam(ev, input));
            input.addEventListener("input", (ev) => this._onUpdateParam(ev, input));
        });
    }

    async _onRemoveLayer(event, target) {
        event.stopPropagation();
        const index = parseInt(target.dataset.index);
        if (!isNaN(index) && this.currentLayers[index]) {
            this.currentLayers.splice(index, 1);
            this.render();
        }
    }

    async _onAddComponent(event, target) {
        const layerIndex = parseInt(target.dataset.layer);
        const type = target.dataset.type; // "particles" or "filter"
        const layer = this.currentLayers[layerIndex];

        if (type === "particles") {
            // Default particle config (e.g., light rain)
            const defaultConfig = {
                type: "rain",
                density: 0.5,
                speed: 1.0,
                scale: 1.0,
                direction: 180,
                tint: [0.5, 0.6, 0.7]
            };
            layer.components.push(...this._generateComponentData({ effects: [{ type: "particles", config: defaultConfig }] }));
        } else if (type === "filter") {
            const subType = target.dataset.sub;
            
            // Define Default Configs for New Filters to ensure params exist!
            let defaultConfig = { type: subType, intensity: 0.5, speed: 1.0 };
            
            if (subType === "fog") {
                defaultConfig.density = 0.5;
                defaultConfig.color = [0.8, 0.85, 0.9]; // Fix: Default Fog Color
            }
            if (subType === "cloud_cover") {
                defaultConfig.scale = 1.0;
                defaultConfig.alpha = 0.5;
                defaultConfig.color = [0.2, 0.2, 0.25];
            }
            if (subType === "old_film") {
                defaultConfig.sepia = 0.3;
                defaultConfig.noise = 0.3;
            }

            layer.components.push(...this._generateComponentData({ filters: [defaultConfig] }));
        }
        this.render();
    }

    async _onRemoveComponent(event, target) {
        const layerIndex = parseInt(target.dataset.layer);
        const compIndex = parseInt(target.dataset.component);
        this.currentLayers[layerIndex].components.splice(compIndex, 1);
        this.render();
    }

    async _onToggleCollapse(event, target) {
        if (event.target.closest(".remove-layer") || event.target.closest(".layer-controls")) return;
        const index = parseInt(target.dataset.index);
        if (!isNaN(index) && this.currentLayers[index]) {
            this.currentLayers[index].collapsed = !this.currentLayers[index].collapsed;
            this.render();
        }
    }

    async _onUpdateParam(event, target) {
        if (!target) target = event.currentTarget || event.target;
        const layerIndex = parseInt(target.dataset.layer);
        const compIndex = parseInt(target.dataset.component);
        const paramId = target.dataset.param;
        if (isNaN(layerIndex) || isNaN(compIndex) || !paramId) return;

        let value = target.type === "checkbox" ? target.checked : target.value;

        // Numeric conversion
        if (target.type === "range" || target.type === "number") {
           value = parseFloat(value);
        }

        const component = this.currentLayers[layerIndex]?.components?.[compIndex];
        if (!component) return;

        const param = component.params.find(p => p.id === paramId);
        if (param) {
            param.value = value;
            
            // If it's a color input, update the adjacent label immediately
            if (target.type === "color") {
                const label = target.nextElementSibling;
                if (label && label.classList.contains("color-code")) {
                    label.textContent = value;
                }
            }
        }
        
        // If previewing, update the preview
        if (this.isPreviewing) {
            const composite = this._buildCompositeConfig("preview_temp", "Preview");
            WeatherEffectsRegistry.registerEffect("preview_temp", composite);
            WeatherEffectsRegistry.applyWeatherFilters("preview_temp");
        }
    }

    async _onSaveFavorite(event, target) {
        const input = this.element.querySelector('input[name="favoriteName"]');
        const name = input ? input.value.trim() : "";
        if (!name) return ui.notifications.warn("PDNC.WeatherMixer.WarnNoName", { localize: true });

        if (this.currentLayers.length === 0) return ui.notifications.warn("PDNC.WeatherMixer.WarnNoEffects", { localize: true });

        const favorites = game.settings.get(MODULE_ID, "weatherMixerFavorites") || {};
        
        const composite = this._buildCompositeConfig(`fav_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`, name);
        
        favorites[name] = composite; // Store the whole config object!

        await game.settings.set(MODULE_ID, "weatherMixerFavorites", favorites);
        
        WeatherEffectsRegistry.loadFavorites();
        ui.notifications.info(game.i18n.format("PDNC.WeatherMixer.SavedFavorite", { name }));
        this.render();
    }
    
    async _onDeleteFavorite(event, target) {
         event.stopPropagation();
         const key = target.dataset.key;
         const favorites = game.settings.get(MODULE_ID, "weatherMixerFavorites") || {};
         if (favorites[key]) {
             delete favorites[key];
             await game.settings.set(MODULE_ID, "weatherMixerFavorites", favorites);
             
             // Unregister
             const safeKey = key.toLowerCase().replace(/[^a-z0-9]/g, "_");
             const id = `fav_${safeKey}`;
             if (CONFIG.Weather?.effects?.[id]) delete CONFIG.Weather.effects[id];

             this.render();
         }
    }

    async _onLoadFavorite(event, target) {
        const key = target.dataset.key;
        const favorites = game.settings.get(MODULE_ID, "weatherMixerFavorites") || {};
        const savedData = favorites[key]; // Could be Array (old) or Object (new)

        this.currentLayers = []; 
        this.currentMixName = key;
        
        if (Array.isArray(savedData)) {
            // Old format: List of Keys. Convert to Layers.
            for (const k of savedData) {
                const config = CONFIG.Weather.effects[k];
                if (config) {
                    this.currentLayers.push({
                        id: foundry.utils.randomID(),
                        sourceKey: k,
                        label: k, // Should try to localize
                        collapsed: false,
                        components: this._generateComponentData(config)
                    });
                }
            }
        } else if (savedData && typeof savedData === 'object') {
             if (savedData._layers) {
                 this.currentLayers = foundry.utils.deepClone(savedData._layers);
             } else {
                 this.currentLayers.push({
                     id: foundry.utils.randomID(),
                     sourceKey: "custom",
                     label: key,
                     collapsed: false,
                     components: this._generateComponentData(savedData)
                 });
             }
        }
        
        this.render();
    }

    async _onCreateMix(event, target) {
        event.preventDefault();
        const input = this.element.querySelector('input[name="favoriteName"]');
        const name = input ? input.value.trim() : "";
        const label = name || `Custom Mix (${this.currentLayers.length})`;
        
        const id = `custom_mix_${Date.now()}`;
        const composite = this._buildCompositeConfig(id, label);
        
        WeatherEffectsRegistry.registerEffect(id, composite);
        
        if (this.onSubmitCallback) {
            this.onSubmitCallback(id);
        }
        this.close();
    }

    // --- Helpers ---

    _rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + toHex(r) + toHex(g) + toHex(b);
    }

    _hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : [1, 1, 1];
    }

    _generateComponentData(config) {
        const components = [];

        // 1. Particles
        if (config.effects) {
            config.effects.forEach((eff, idx) => {
                // Determine Type
                let type = eff.type;
                let cfg = eff.config || {};
                
                // If using the wrapper 'particles' type
                if (type === "particles") {
                    type = cfg.type || "particles";
                } else {
                    // Direct (old format)
                    cfg = eff.config || { ...eff }; // fallback
                }

                const params = [];

                // Common Params
                if (cfg.density !== undefined) params.push({ id: "density", label: "Density", type: "range", min: 0.1, max: 10, step: 0.1, value: cfg.density });
                if (cfg.speed !== undefined) params.push({ id: "speed", label: "Speed", type: "range", min: 0, max: 20, step: 0.1, value: cfg.speed });
                if (cfg.scale !== undefined) params.push({ id: "scale", label: "Scale", type: "range", min: 0.1, max: 5, step: 0.1, value: cfg.scale });
                if (cfg.direction !== undefined) params.push({ id: "direction", label: "Direction", type: "range", min: 0, max: 360, step: 1, value: cfg.direction, unit: "deg" });
                
                // Color
                if (cfg.tint) {
                    params.push({ id: "tint", label: "Color", type: "color", value: this._rgbToHex(cfg.tint[0], cfg.tint[1], cfg.tint[2]) });
                }

                components.push({
                    type: "particles",
                    label: `Particles: ${type}`,
                    subType: type, // e.g. "rain", "snow"
                    originalConfig: cfg, // Keep ref
                    params: params
                });
            });
        }

        // 2. Filters
        if (config.filters) {
            config.filters.forEach((filt, idx) => {
                 const params = [];
                 
                 if (filt.intensity !== undefined) params.push({ id: "intensity", label: "Intensity", type: "range", min: 0, max: 5, step: 0.1, value: filt.intensity });
                 if (filt.speed !== undefined) params.push({ id: "speed", label: "Speed", type: "range", min: 0, max: 10, step: 0.1, value: filt.speed });
                 if (filt.density !== undefined) params.push({ id: "density", label: "Density", type: "range", min: 0, max: 1, step: 0.05, value: filt.density });
                 
                 // Special cases
                 if (filt.type === "old_film") {
                    if (filt.sepia !== undefined) params.push({ id: "sepia", label: "Sepia", type: "range", min: 0, max: 1, step: 0.1, value: filt.sepia });
                    if (filt.noise !== undefined) params.push({ id: "noise", label: "Noise", type: "range", min: 0, max: 1, step: 0.1, value: filt.noise });
                 }
                 
                 if (filt.color) {
                      params.push({ id: "color", label: "Color", type: "color", value: this._rgbToHex(filt.color[0], filt.color[1], filt.color[2]) });
                 }

                 components.push({
                    type: "filter",
                    label: `Filter: ${filt.type}`,
                    subType: filt.type,
                    originalConfig: filt,
                    params: params
                 });
            });
        }

        return components;
    }

    _buildCompositeConfig(id, label) {
        const composite = { 
            id, 
            label, 
            filters: [], 
            effects: [],
            _layers: this.currentLayers // Store source for editing
        };

        for (const layer of this.currentLayers) {
            for (const comp of layer.components) {
                // Reconstruct Config from Params
                const newConfig = { ...comp.originalConfig };
                
                for (const p of comp.params) {
                    if (p.type === "color") {
                        if (p.id === "tint") newConfig.tint = this._hexToRgb(p.value);
                        if (p.id === "color") newConfig.color = this._hexToRgb(p.value);
                    } else {
                        newConfig[p.id] = p.value;
                    }
                }

                if (comp.type === "particles") {
                    // Wrap back if it was wrapped
                    composite.effects.push({
                        type: "particles",
                        config: newConfig
                    });
                } else if (comp.type === "filter") {
                    composite.filters.push(newConfig);
                }
            }
        }
        return composite;
    }
}
