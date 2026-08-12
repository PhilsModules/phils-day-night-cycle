import { MOON_DATA } from "../lighting-system.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class MoonConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "pdnc-moon-config",
        tag: "form",
        classes: ["pdnc-app-v2", "pdnc-moon-config-window"],
        window: {
            title: "PDNC.MoonConfig.Title",
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
        let phases = [];
        try {
            const json = game.settings.get("phils-day-night-cycle", "customMoonPhases");
            phases = JSON.parse(json);
        } catch (e) { }

        if (!phases || !Array.isArray(phases) || phases.length === 0) {
            phases = foundry.utils.duplicate(MOON_DATA.phases);
        }

        phases.forEach(p => {
            if (Array.isArray(p.days)) {
                p.daysStr = p.days.join(", ");
            }
            if (p.name && p.name.startsWith("PDNC.")) {
                p.name = game.i18n.localize(p.name);
            }
        });

        return {
            phases: phases,
            iconChoices: {
                "empty": game.i18n.localize("PDNC.MoonPhase.New"),
                "crescent": game.i18n.localize("PDNC.MoonPhase.WaxingCrescent"),
                "half": game.i18n.localize("PDNC.MoonPhase.FirstQuarter"),
                "gibbous": game.i18n.localize("PDNC.MoonPhase.WaxingGibbous"),
                "full": game.i18n.localize("PDNC.MoonPhase.Full")
            }
        };
    }

    async _onAddPhase(event, target) {
        const formData = new FormDataExtended(this.element).object;
        const phases = this._expandPhases(formData);
        
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
        const index = row.dataset.index;

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
    }

    _expandPhases(formData) {
        const expand = foundry.utils.expandObject(formData);
        let phasesObj = expand.phases || {};
        return Object.values(phasesObj);
    }

    async _savePhases(rawPhases) {
        const phases = rawPhases.map((p, idx) => {
            let daysArr = [];
            const dateStr = p.days || p.daysStr;
            
            if (typeof dateStr === 'string') {
                daysArr = dateStr.split(",")
                    .map(s => parseInt(s.trim()))
                    .filter(n => !isNaN(n))
                    .sort((a, b) => a - b);
            } else if (Array.isArray(p.days)) {
                daysArr = p.days;
            }

            return {
                id: idx,
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
