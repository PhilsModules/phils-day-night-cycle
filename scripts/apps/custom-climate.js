import { WeatherSystem } from "../weather-system.js";

const MODULE_ID = "phils-day-night-cycle";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CustomClimateApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.editingId = null;
        this.tempData = null; 
    }

    async _prepareContext(options) {
        const climates = game.settings.get(MODULE_ID, "customClimates") || {};
        
        let editingClimate = null;
        let seasons = {};
        let lighting = {};

        if (this.editingId) {
            let workingData;
            if (this.tempData) {
                workingData = this.tempData;
            } else {
                const rawClimate = climates[this.editingId];
                workingData = foundry.utils.deepClone(rawClimate);
                
                // MIGRATION ON LOAD: Convert old structure to new if needed
                if (!workingData.data && workingData.name) {
                     workingData.data = {
                         name: workingData.name,
                         img: null,
                         seasons: workingData.seasons
                     };
                     delete workingData.name;
                     delete workingData.seasons;
                     if (!workingData.fx) workingData.fx = { day: [], night: [] };
                }
                this.tempData = workingData;
            }

            // Prepare View Data (Flat strings for Template)
            editingClimate = {
                name: workingData.data.name,
                seasons: {}
            };
            
            for (const s of ["spring", "summer", "autumn", "winter"]) {
                 const arr = workingData.data.seasons[s] || [];
                 editingClimate.seasons[s] = arr.map(e => {
                     let tStr = e.temp;
                     if (typeof e.temp === 'object') {
                         tStr = `${e.temp.minC}-${e.temp.maxC}`;
                     }
                     let fStr = e.fx;
                     if (Array.isArray(e.fx)) {
                         fStr = e.fx.length ? e.fx[0] : "";
                     }
                     return { text: e.text, temp: tStr, fx: fStr };
                 });
            }

            seasons = editingClimate.seasons;

            // Ensure lighting defaults if missing
             if (!workingData.lighting) {
                workingData.lighting = {
                    spring: { dawn: "06:00", noon: "12:00", dusk: "18:00", night: "20:00", type: "" },
                    summer: { dawn: "05:00", noon: "13:00", dusk: "21:00", night: "22:30", type: "" },
                    autumn: { dawn: "06:30", noon: "12:00", dusk: "18:30", night: "20:00", type: "" },
                    winter: { dawn: "07:30", noon: "12:00", dusk: "16:30", night: "18:00", type: "" }
                };
            }
            lighting = workingData.lighting;
        }

        const fxChoices = {
            "": "None",  
            "rain": "Rain",
            "snow": "Snow",
            "clouds": "Clouds",
            "fog": "Fog",
            "storm": "Storm",
            "leaves": "Autumn Leaves"
        };
        
        const strategyChoices = {
            "": "PDNC.Lighting.Strategy.Standard",
            "bright_night": "PDNC.Lighting.Strategy.BrightNight",
            "polar_day": "PDNC.Lighting.Strategy.PolarDay",
            "polar_night": "PDNC.Lighting.Strategy.PolarNight"
        };
        
        return {
            climates: Object.entries(climates).map(([id, c]) => ({ id, name: c.data?.name || c.name })),
            editingClimate: editingClimate,
            seasons: seasons,
            lighting: lighting,
            fxChoices: fxChoices,
            strategyChoices: strategyChoices,
            activeSeason: this.tabGroups?.seasons || "spring",
            tabs: this._getTabs() 
        };
    }
    
    _getTabs() {
        return {};
    }

    // Define tab groups for the mixin to handle active state
    static get DEFAULT_OPTIONS() {
        return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            tag: "form",
            id: "pdnc-custom-climate",
            window: {
                title: "PDNC.CustomClimate.Title",
                icon: "fas fa-cloud-sun-rain",
                resizable: true
            },
            position: {
                width: 450,
                height: "auto"
            },
            classes: ["pdnc-app", "standard-form"],
            actions: {
                create: CustomClimateApp.prototype._onCreate,
                edit: CustomClimateApp.prototype._onEdit,
                delete: CustomClimateApp.prototype._onDelete,
                save: CustomClimateApp.prototype._onSave,
                cancel: CustomClimateApp.prototype._onCancel,
                validate: CustomClimateApp.prototype._onValidate,
                addRow: CustomClimateApp.prototype._onAddRow,
                deleteRow: CustomClimateApp.prototype._onDeleteRow,
                export: CustomClimateApp.prototype._onExport,
                import: CustomClimateApp.prototype._onImport
            },
            tabGroups: {
                seasons: "spring"
            }
        });
    }

    static get PARTS() {
        return {
            main: {
                id: "main",
                template: `modules/${MODULE_ID}/templates/custom-climate.hbs`,
                scrollable: [".content"]
            }
        };
    }

    async render(options) {
        if (typeof options === "boolean") options = { force: options };
        return super.render(options);
    }

    async _onCreate(event, target) {
        const newId = `custom_${Date.now()}`;
        const newClimate = {
            data: {
                name: "New Climate",
                img: null,
                seasons: {
                    spring: [],
                    summer: [],
                    autumn: [],
                    winter: []
                }
            },
            fx: { day: [], night: [] },
            lighting: {
                spring: { dawn: "06:00", noon: "12:00", dusk: "18:00", night: "20:00", type: "" },
                summer: { dawn: "05:00", noon: "13:00", dusk: "21:00", night: "22:30", type: "" },
                autumn: { dawn: "06:30", noon: "12:00", dusk: "18:30", night: "20:00", type: "" },
                winter: { dawn: "07:30", noon: "12:00", dusk: "16:30", night: "18:00", type: "" }
            }
        };
        
        this.editingId = newId;
        this.tempData = newClimate;
        this.render();
    }

    async _onEdit(event, target) {
        const li = target.closest("li");
        const id = li.dataset.id;
        this.editingId = id;
        this.tempData = null; 
        this.render();
    }

    async _onDelete(event, target) {
        const li = target.closest("li");
        const id = li.dataset.id;
        
        const confirm = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("PDNC.Delete") },
            content: `<p>${game.i18n.localize("PDNC.CustomClimate.DeleteConfirm")}</p>`,
            modal: true
        });

        if (confirm) {
            const climates = game.settings.get(MODULE_ID, "customClimates");
            delete climates[id];
            await game.settings.set(MODULE_ID, "customClimates", climates);
            
            const currentZone = game.settings.get(MODULE_ID, "climateZone");
            if (currentZone === id) {
                await game.settings.set(MODULE_ID, "climateZone", "marine_west_coast");
            }

            // Refresh Choices
            const newChoices = WeatherSystem.getClimateList();
            
            const setting = game.settings.settings.get(`${MODULE_ID}.climateZone`);
            if (setting) {
                setting.choices = newChoices;
            }
            
            if (game.settings.sheet.rendered) {
                game.settings.sheet.render();
            }

            if (this.editingId === id) {
                this.editingId = null;
                this.tempData = null;
            }
            this.render();
        }
    }

    _updateTempDataFromForm() {
        if (!this.tempData) return;
        const formData = new FormData(this.element);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        const formDataObj = data;
        
        this.tempData.data.name = formDataObj.name;

        // Reconstruct arrays from flat form data
        // Format: seasons.{season}.{index}.{field}
        
        const expanded = foundry.utils.expandObject(formDataObj);
        
        if (expanded.seasons) {
            for (const s of ["spring", "summer", "autumn", "winter"]) {
                 const seasonData = expanded.seasons[s] || {};
                 // Object to Array
                 const rawArr = Object.values(seasonData);
                 
                 // Process Array: Convert String inputs to Object/Array structure
                 this.tempData.data.seasons[s] = rawArr.map(entry => {
                     const tVal = WeatherSystem.parseTemperature(entry.temp || "10-20");
                     const fxVal = entry.fx ? [entry.fx] : [];
                     
                     return {
                         text: entry.text || "",
                         temp: {
                             minC: tVal.min,
                             maxC: tVal.max,
                             minF: Math.round((tVal.min * 9/5) + 32),
                             maxF: Math.round((tVal.max * 9/5) + 32)
                         },
                         fx: fxVal
                     };
                 });
            }
        }
        
        if (expanded.lighting) {
            this.tempData.lighting = expanded.lighting;
        }
    }

    async _onAddRow(event, target) {
        console.log("PDNC | Adding row for season:", target.dataset.season);
        this._updateTempDataFromForm();
        const season = target.dataset.season;
        
        // Ensure initialized if missing (e.g. if form data was empty)
        if (this.tempData && !this.tempData.data.seasons[season]) {
            this.tempData.data.seasons[season] = [];
        }

        if (this.tempData && this.tempData.data.seasons[season]) {
            this.tempData.data.seasons[season].push({
                text: "",
                temp: { minC: 10, maxC: 20, minF: 50, maxF: 68 },
                fx: []
            });
            console.log("PDNC | New season data:", this.tempData.data.seasons[season]);
            this.render();
        } else {
             console.error("PDNC | Failed to add row, data missing", this.tempData);
        }
    }

    async _onDeleteRow(event, target) {
        this._updateTempDataFromForm();
        const season = target.dataset.season;
        const index = parseInt(target.dataset.index);
        
        if (this.tempData && this.tempData.data.seasons[season]) {
            this.tempData.data.seasons[season].splice(index, 1);
            this.render();
        }
    }

    async _onSave(event, target) {
        this._updateTempDataFromForm();
        
        if (!this.tempData.data.name) {
             ui.notifications.error("Name is required");
             return;
        }

        const climates = game.settings.get(MODULE_ID, "customClimates");
        climates[this.editingId] = this.tempData;

        await game.settings.set(MODULE_ID, "customClimates", climates);
        
        // Refresh Choices in Settings Config dynamically
        // Refresh Choices in Settings Config dynamically
        const newChoices = WeatherSystem.getClimateList();
        
        const setting = game.settings.settings.get(`${MODULE_ID}.climateZone`);
        if (setting) {
            // Update both config.choices and direct choices to be safe across V12/V13
            setting.choices = newChoices;
        }
        
        // If settings config is open, re-render it
        if (game.settings.sheet.rendered) {
            game.settings.sheet.render();
        }

        this.editingId = null;
        this.tempData = null;
        this.render();
    }

    async _onCancel(event, target) {
        this.editingId = null;
        this.tempData = null;
        this.render();
    }

    async _onValidate(event, target) {
         // No longer needed with form inputs, but keeping method strictly to avoid break if triggered?
         // We can remove it from template.
    }

    async _onExport(event, target) {
        const climates = game.settings.get(MODULE_ID, "customClimates") || {};
        const data = JSON.stringify(climates, null, 2);
        saveDataToFile(data, "application/json", "pdnc-custom-climates.json");
    }

    async _onImport(event, target) {
        new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = () => {
                const file = input.files[0];
                if (file) {
                    readTextFromFile(file).then(async text => {
                        try {
                            const data = JSON.parse(text);
                            await game.settings.set(MODULE_ID, "customClimates", data);
                            ui.notifications.info("Custom climates imported successfully!");
                            this.render();
                        } catch (e) {
                            ui.notifications.error("Failed to parse JSON file.");
                        }
                    });
                }
            };
            input.click();
        });
    }
}
