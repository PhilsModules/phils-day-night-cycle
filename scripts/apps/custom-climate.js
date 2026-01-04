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

        if (this.editingId) {
            if (this.tempData) {
                editingClimate = this.tempData;
            } else {
                editingClimate = climates[this.editingId];
                this.tempData = foundry.utils.deepClone(editingClimate);
            }
            seasons = this.tempData.seasons;
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
        
        return {
            climates: Object.entries(climates).map(([id, c]) => ({ id, name: c.name })),
            editingClimate: editingClimate,
            seasons: seasons,
            fxChoices: fxChoices,
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
            window: {
                title: "PDNC.CustomClimate.Title",
                icon: "fas fa-cloud-sun-rain",
                resizable: true
            },
            position: {
                width: 700,
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
                deleteRow: CustomClimateApp.prototype._onDeleteRow
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
            name: "New Climate",
            seasons: {
                spring: [],
                summer: [],
                autumn: [],
                winter: []
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
        
        this.tempData.name = formDataObj.name;

        // Reconstruct arrays from flat form data
        // Format: seasons.{season}.{index}.{field}
        
        const expanded = foundry.utils.expandObject(formDataObj);
        
        if (expanded.seasons) {
            for (const s of ["spring", "summer", "autumn", "winter"]) {
                 // Ensure it is an array (expandObject might make it an object with numeric keys '0', '1' etc)
                 const seasonData = expanded.seasons[s] || {};
                 // Convert object-map to array
                 const arr = Object.values(seasonData);
                 this.tempData.seasons[s] = arr;
            }
        }
    }

    async _onAddRow(event, target) {
        console.log("PDNC | Adding row for season:", target.dataset.season);
        this._updateTempDataFromForm();
        const season = target.dataset.season;
        
        // Ensure initialized if missing (e.g. if form data was empty)
        if (this.tempData && !this.tempData.seasons[season]) {
            this.tempData.seasons[season] = [];
        }

        if (this.tempData && this.tempData.seasons[season]) {
            this.tempData.seasons[season].push({
                text: "",
                temp: "10-20",
                fx: ""
            });
            console.log("PDNC | New season data:", this.tempData.seasons[season]);
            this.render();
        } else {
             console.error("PDNC | Failed to add row, data missing", this.tempData);
        }
    }

    async _onDeleteRow(event, target) {
        this._updateTempDataFromForm();
        const season = target.dataset.season;
        const index = parseInt(target.dataset.index);
        
        if (this.tempData && this.tempData.seasons[season]) {
            this.tempData.seasons[season].splice(index, 1);
            this.render();
        }
    }

    async _onSave(event, target) {
        this._updateTempDataFromForm();
        
        if (!this.tempData.name) {
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
}
