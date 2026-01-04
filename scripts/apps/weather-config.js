import { WeatherSystem } from "../weather-system.js";

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
                apply: WeatherConfigApp.prototype._onApply
            }
        };
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
            "rain": "Rain",
            "snow": "Snow",
            "clouds": "Clouds",
            "fog": "Fog",
            "storm": "Storm",
            "leaves": "Autumn Leaves"
        };
        
        return {
            weather: this.weatherData,
            climate: this.weatherData.climateName || "Unknown",
            season: this.weatherData.seasonName || "Unknown",
            fxChoices: fxChoices
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

        const finalWeather = {
             ...this.weatherData,
             description: data.description,
             text: data.description,
             tempMin: parseInt(data.tempMin),
             tempMax: parseInt(data.tempMax),
             fx: data.fx || null,
             generated: true
        };

        await WeatherSystem.applyWeather(finalWeather);
        this.close();
    }
}
