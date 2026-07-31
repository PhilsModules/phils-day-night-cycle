import { MOON_DATA } from "../lighting-system.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MoonConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "pdnc-moon-config",
        tag: "form",
        window: {
            title: "Moon Phase Configuration", // TODO: Localize
            icon: "fas fa-moon",
            resizable: true,
            width: 600,
            height: 600
        },
        position: {
            width: 600,
            height: 600
        },
        actions: {
            addPhase: MoonConfigApp.prototype._onAddPhase,
            deletePhase: MoonConfigApp.prototype._onDeletePhase
        },
        form: {
            handler: MoonConfigApp.prototype._onSubmit,
            submitOnChange: false,
            closeOnSubmit: true
        }
    };

    static PARTS = {
        form: {
            template: "modules/phils-day-night-cycle/templates/moon-config.hbs"
        }
    };

    async _prepareContext(options) {
        // Load setting or default
        let phases = [];
        try {
            const json = game.settings.get("phils-day-night-cycle", "customMoonPhases");
            phases = JSON.parse(json);
        } catch (e) { }

        // If empty or invalid, fallback/clone default
        if (!phases || !Array.isArray(phases) || phases.length === 0) {
            phases = foundry.utils.duplicate(MOON_DATA.phases);
        }

        // Prepare for Handlebars
        phases.forEach(p => {
            if (Array.isArray(p.days)) {
                p.daysStr = p.days.join(", ");
            }
            // Localize Name if it's a key
            if (p.name && p.name.startsWith("PDNC.")) {
                p.name = game.i18n.localize(p.name);
            }
        });

        return {
            phases: phases,
            iconChoices: {
                "empty": game.i18n.localize("PDNC.MoonPhase.New"),
                "crescent": game.i18n.localize("PDNC.MoonPhase.WaxingCrescent"), // Re-using keys for generic icon names? 
                // Actually iconChoices were "Empty (New Moon)", "Crescent" etc.
                // I should probably localize these properly too.
                // But for now, let's stick to the phase names.
                // The icon dropdown labels were hardcoded in previous step 305.
                // Let's fix them to use the new keys where appropriate or keep them hardcoded for now 
                // to avoid scope creep, but the user complained about language.
                // I'll update them to be localized keys from my new set.
                "empty": game.i18n.localize("PDNC.MoonPhase.New"),
                "crescent": "Crescent", // Generic
                "half": "Half", // Generic
                "gibbous": "Gibbous", // Generic
                "full": game.i18n.localize("PDNC.MoonPhase.Full")
            }
        };
    }

    /* -------------------------------------------- */
    /*  Actions                                     */
    /* -------------------------------------------- */

    async _onAddPhase(event, target) {
        // Save current state first?
        // In V2, we might want to grab the formData from the event or element?
        // But simply, we can just grab the form data.
        const formData = new FormDataExtended(this.element).object;
        const phases = this._expandPhases(formData);
        
        // Add new empty phase
        const nextId = phases.length > 0 ? Math.max(...phases.map(p => p.id)) + 1 : 0;
        phases.push({
            id: nextId,
            name: "New Phase",
            days: [],
            daysStr: "",
            solar_offset_hours: 0,
            icon_state: "crescent"
        });

        await this._savePhases(phases);
        this.render({ force: true });
    }

    async _onDeletePhase(event, target) {
        const row = target.closest(".phase-row");
        const index = row.dataset.index; // dataset access via element property

        const formData = new FormDataExtended(this.element).object;
        let phases = this._expandPhases(formData);

        phases.splice(index, 1);
        
        await this._savePhases(phases);
        this.render({ force: true });
    }

    async _onSubmit(event, form, formData) {
        const data = formData.object;
        const phases = this._expandPhases(data);
        await this._savePhases(phases);
        // Window closes automatically due to closeOnSubmit: true
    }

    /* -------------------------------------------- */
    /*  Helpers                                     */
    /* -------------------------------------------- */

    _expandPhases(formData) {
        const expand = foundry.utils.expandObject(formData);
        let phasesObj = expand.phases || {};
        return Object.values(phasesObj);
    }

    async _savePhases(rawPhases) {
        // Process Types
        const phases = rawPhases.map(p => {
            // Parse Days String "1, 2, 3" -> [1, 2, 3]
            let daysArr = [];
            if (p.daysStr !== undefined) {
                 // If passing the object directly from expansion
                 // p.days usually is the string input name="phases.0.days"
                 // Wait, in Handlebars I named it `phases.{{@index}}.days` but value was `daysStr`.
                 // So the key in formData is `phases.0.days`.
            }
            
            // Actually, in the form input: name="phases.{{@index}}.days"
            // So p.days holds the string value.
            
            let dateStr = p.days; 
            // Fix: If it came from my push object, it might be `daysStr`.
            if (p.daysStr && !p.days) dateStr = p.daysStr;
            
            if (typeof dateStr === 'string') {
                daysArr = dateStr.split(",")
                    .map(s => parseInt(s.trim()))
                    .filter(n => !isNaN(n))
                    .sort((a,b) => a - b);
            } else if (Array.isArray(p.days)) {
                daysArr = p.days;
            }

            return {
                id: parseInt(p.id) || 0,
                id: rawPhases.indexOf(p), // Re-index for safety
                name: p.name,
                days: daysArr,
                solar_offset_hours: parseInt(p.solar_offset_hours) || 0,
                icon_state: p.icon_state,
                desc: "" 
            };
        });

        await game.settings.set("phils-day-night-cycle", "customMoonPhases", JSON.stringify(phases));
    }
}
