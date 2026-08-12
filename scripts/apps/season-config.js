import { CalendarSystem } from "../calendar-system.js";

const MODULE_ID = "phils-day-night-cycle";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class SeasonConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static get DEFAULT_OPTIONS() {
        return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            tag: "form",
            id: "phils-season-config",
            classes: ["pdnc-app-v2", "pdnc-season-config-window"],
            window: {
                title: "PDNC.SeasonConfigTitle",
                icon: "fas fa-calendar-alt",
                resizable: false
            },
            position: {
                width: 400,
                height: "auto"
            },
            actions: {
                save: SeasonConfigApp.prototype._onSave,
                reset: SeasonConfigApp.prototype._onReset
            },
            form: {
                handler: SeasonConfigApp.prototype._onSubmit,
                submitOnChange: false,
                closeOnSubmit: true
            }
        });
    }

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/season-config.hbs`
        }
    };
    
    get title() {
        return game.i18n.localize("PDNC.SeasonConfigTitle");
    }

    /** @override */
    async _prepareContext(options) {
        const calendar = window.PhilsDayNightCycle?.calendar ?? window.dayNightCycle?.calendar ?? new CalendarSystem();
        const months = calendar?.config?.months ?? [];
        const currentSettings = game.settings.get(MODULE_ID, "seasonConfig") || {
            spring: { month: 2, day: 20 },
            summer: { month: 5, day: 21 },
            autumn: { month: 8, day: 22 },
            winter: { month: 11, day: 21 }
        };

        const monthOptions = months.reduce((acc, m, i) => {
            if (!m) return acc;
            const rawName = m.name || "";
            const plainName = CalendarSystem.stripMarkup ? CalendarSystem.stripMarkup(rawName) : String(rawName).replace(/<[^>]*>/g, "").trim();
            acc[i] = plainName;
            return acc;
        }, {});

        return {
            monthOptions: monthOptions,
            spring: currentSettings.spring ?? { month: 2, day: 20 },
            summer: currentSettings.summer ?? { month: 5, day: 21 },
            autumn: currentSettings.autumn ?? { month: 8, day: 22 },
            winter: currentSettings.winter ?? { month: 11, day: 21 }
        };
    }

    async _onReset(event, target) {
        const defaults = game.settings.settings.get(MODULE_ID + ".seasonConfig").default;
        await game.settings.set(MODULE_ID, "seasonConfig", defaults);
        this.render();
    }

    async _onSave(event, target) {
        const formData = new FormDataExtended(this.element).object;
        const settings = foundry.utils.expandObject(formData);
        
        for (const season of ["spring", "summer", "autumn", "winter"]) {
            if (settings[season]) {
                settings[season].month = Number(settings[season].month);
                settings[season].day = Number(settings[season].day);
            }
        }

        await game.settings.set(MODULE_ID, "seasonConfig", settings);
        this.close();
    }
    
    async _onSubmit(event, form, formData) {
        const settings = foundry.utils.expandObject(formData.object);
        for (const season of ["spring", "summer", "autumn", "winter"]) {
            if (settings[season]) {
                settings[season].month = Number(settings[season].month);
                settings[season].day = Number(settings[season].day);
            }
        }
        await game.settings.set(MODULE_ID, "seasonConfig", settings);
    }
}
