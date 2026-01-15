const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { WeatherSystem } from "./weather-system.js";
import { CalendarSystem } from "./calendar-system.js";

const MODULE_ID = "phils-day-night-cycle";

export class ClimateDataWizard extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        // Default to current setting or first in list
        this.selectedClimate = game.settings.get(MODULE_ID, "climateZone") || "marine_west_coast";
        
        // Default to current season if possible, else Spring
        try {
            const calendar = new CalendarSystem();
            const dateData = calendar.getDate(game.time.worldTime);
            // WeatherSystem.getSeason requires standard month index
            this.selectedSeason = WeatherSystem.getSeason(dateData.month, dateData.day);
        } catch(e) {
            this.selectedSeason = "spring"; 
        }
    }

    static DEFAULT_OPTIONS = {
        id: "climate-data-wizard",
        tag: "form",
        window: {
            title: "Climate Data Wizard",
            icon: "fas fa-cloud-sun-rain",
            resizable: true,
            controls: []
        },
        position: {
            width: 700,
            height: 600
        },
        classes: ["pdnc-app-v2"],
        actions: {
            applyWeather: function(event, target) {
                 this._applyWeather(target.dataset.index);
            }
        }
    };

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/climate-wizard.hbs`
        }
    };

    /** @override */
    async _prepareContext(options) {
        const climates = WeatherSystem.getClimateList();
        
        // Ensure selected climate is valid
        if (!climates[this.selectedClimate]) {
             const keys = Object.keys(climates);
             if (keys.length > 0) this.selectedClimate = keys[0];
        }

        const climateData = WeatherSystem.getClimateData(this.selectedClimate);
        const seasonsData = climateData.data?.seasons || climateData.seasons || {};
        const entries = seasonsData[this.selectedSeason] || [];

        // Formatting seasons for select
        const seasons = [
            { id: "spring", label: game.i18n.localize("PDNC.Season.spring") },
            { id: "summer", label: game.i18n.localize("PDNC.Season.summer") },
            { id: "autumn", label: game.i18n.localize("PDNC.Season.autumn") },
            { id: "winter", label: game.i18n.localize("PDNC.Season.winter") }
        ];

        return {
            climates: climates, // Object { key: label }
            selectedClimate: this.selectedClimate,
            seasons: seasons,
            selectedSeason: this.selectedSeason,
            entries: entries
        };
    }

    /** @override */
    _onRender(context, options) {
        // Handle Select Changes using standard DOM listeners
        const html = this.element;
        
        const climateSelect = html.querySelector("#climate-select");
        if (climateSelect) {
            climateSelect.addEventListener("change", (ev) => {
                this.selectedClimate = ev.target.value;
                this.render();
            });
        }

        const seasonSelect = html.querySelector("#season-select");
        if (seasonSelect) {
            seasonSelect.addEventListener("change", (ev) => {
                this.selectedSeason = ev.target.value;
                this.render();
            });
        }
    }

    async _applyWeather(index) {
        const climateData = WeatherSystem.getClimateData(this.selectedClimate);
        const seasonsData = climateData.data?.seasons || climateData.seasons || {};
        const entries = seasonsData[this.selectedSeason] || [];
        const entry = entries[index];

        if (entry) {
            const temps = WeatherSystem.getTemperatureRange(entry);

            // Construct WeatherStore Object
            const weatherStore = {
                tempMin: temps.min,
                tempMax: temps.max,
                text: entry.text,
                description: entry.text,
                fx: (Array.isArray(entry.fx) && entry.fx.length > 0) ? entry.fx[0] : null,
                generated: true,
                climateName: climateData.data.name,
                seasonName: game.i18n.localize(`PDNC.Season.${this.selectedSeason}`),
                seasonId: this.selectedSeason
            };
            
            // Apply it
            await WeatherSystem.applyWeather(weatherStore);
            ui.notifications.info(`${game.i18n.localize("PDNC.WeatherConfig.Apply")}: ${entry.text}`);
        }
    }
}
