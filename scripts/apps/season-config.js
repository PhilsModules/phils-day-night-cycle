const MODULE_ID = "phils-day-night-cycle";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class SeasonConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static get DEFAULT_OPTIONS() {
        return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            tag: "form",
            id: "phils-season-config",
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
            template: `modules/${MODULE_ID}/templates/season-config.hbs` // Assuming .hbs file exists or .html? Main used .html in some places but .hbs here?
            // Main used: `modules/${MODULE_ID}/templates/season-config.hbs` isn't listed in main templatePaths? 
            // Wait, I saw templatePaths earlier, it didn't include season-config. 
            // But the class in main.v2.js used: `modules/${MODULE_ID}/templates/season-config.html` (CHECK)
        }
    };
    // Re-check main.v2.js template path.
    // Line 1804 (implied): template: `modules/${MODULE_ID}/templates/season-config.html`
    // Wait, I need to check if the template exists.
    
    get title() {
        return game.i18n.localize("PDNC.SeasonConfigTitle");
    }

    /** @override */
    async _prepareContext(options) {
        // Access dayNightCycle from global window or import?
        // It's not exported from main.v2.js.
        // But main.v2.js assigns `window.PhilsDayNightCycle`.
        // Better: access via `game.modules.get(MODULE_ID).api` if available, or just global.
        // Or cleaner: import the instance? Circular dependency risk.
        // Let's use `window.PhilsDayNightCycle.calendar`.
        
        const calendar = window.PhilsDayNightCycle.calendar;
        const config = calendar.config.months; // Array of month objects
        const currentSettings = game.settings.get(MODULE_ID, "seasonConfig");

        // Prepare month options for {{selectOptions}} helper
        // We want {index: name}
        const monthOptions = config.reduce((acc, m, i) => {
            // STRIP HTML TAGS
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = m.name;
            const plainName = tempDiv.textContent || tempDiv.innerText || "";
            
            acc[i] = plainName;
            return acc;
        }, {});

        // Data for template
        return {
            monthOptions: monthOptions,
            spring: currentSettings.spring,
            summer: currentSettings.summer,
            autumn: currentSettings.autumn,
            winter: currentSettings.winter
        };
    }

    async _onReset(event, target) {
        // event.preventDefault(); // handled by V2 actions?
        
        const defaults = game.settings.settings.get(MODULE_ID + ".seasonConfig").default;
        await game.settings.set(MODULE_ID, "seasonConfig", defaults);
        this.render();
    }

    async _onSave(event, target) {
        // Form handling is done via _onSubmit generally for the whole form? 
        // Or if this button is "type=submit" it triggers _onSubmit.
        // If it's a custom button, we manually gather data.
        // In previous implementation (main.v2.js), it did manual querySelector.
        // Let's try to stick to V2 form handler if possible.
        // But the previous code used `this.element.querySelector`.
        
        // Let's use FormDataExtended
        const formData = new FormDataExtended(this.element).object;
        
        // The structure needs to be nested: spring.month, spring.day etc.
        // If the HTML names are "spring.month" etc, expandObject handles it.
        const settings = foundry.utils.expandObject(formData);
        
        // Validation/Types
        // Inputs are numbers?
        // We should ensure they are integers.
        
        // Deep map to int?
        for (const season of ["spring", "summer", "autumn", "winter"]) {
            if (settings[season]) {
                settings[season].month = Number(settings[season].month);
                settings[season].day = Number(settings[season].day);
            }
        }

        await game.settings.set(MODULE_ID, "seasonConfig", settings);
        this.close();
    }
    
    // Default form handler
    async _onSubmit(event, form, formData) {
        // If the save button is submit, this runs.
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
