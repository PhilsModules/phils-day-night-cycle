const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { ThemeSystem } from "../theme-system.js";

const MODULE_ID = "phils-day-night-cycle";

export class ThemeConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "pdnc-theme-config",
        tag: "form",
        window: {
            title: "PDNC.ThemeConfig.Title",
            icon: "fas fa-images",
            resizable: true,
            width: 420
        },
        position: {
            width: 420,
            height: 700
        },
        form: {
            handler: ThemeConfigApp.formHandler,
            submitOnChange: false,
            closeOnSubmit: true
        },
        actions: {
            browse: ThemeConfigApp.prototype._onBrowse,
            clear: ThemeConfigApp.prototype._onClear,
            addPhase: ThemeConfigApp.prototype._onAddPhase,
            deletePhase: ThemeConfigApp.prototype._onDeletePhase
        }
    };

    static PARTS = {
        content: {
            template: `modules/${MODULE_ID}/templates/theme-config.hbs`
        }
    };

    async _prepareContext(options) {
        const currentPhases = ThemeSystem.PHASES; 
        const currentImages = game.settings.get(MODULE_ID, "themeConfig");
        
        const phases = currentPhases.map((p, index) => {
            const resolved = ThemeSystem.resolvePhaseImage(currentImages, p.id);
            return {
                ...p,
                index: index,
                displayName: p.label.startsWith("PDNC.Phases") ? game.i18n.localize(p.label) : p.label,
                startTime: ThemeSystem.formatDecimalToTime(p.start),
                endTime: ThemeSystem.formatDecimalToTime(p.end),
                currentImage: currentImages[p.id] || "",
                resolvedImage: resolved
            };
        });

        return {
            phases: phases
        };
    }

    static async formHandler(event, form, formData) {
        const expanded = foundry.utils.expandObject(formData.object);
        const images = {};
        const definitions = [];
        
        if (expanded.phases) {
            for (const [idx, data] of Object.entries(expanded.phases)) {
                const id = data.id || `phase_${idx}`;
                definitions.push({
                    id: id,
                    label: data.label,
                    start: ThemeSystem.parseTimeToDecimal(data.startTime),
                    end: ThemeSystem.parseTimeToDecimal(data.endTime)
                });
                images[id] = data.imagePath || "";
            }
        }

        await game.settings.set(MODULE_ID, "themeConfig", images);
        await game.settings.set(MODULE_ID, "phaseDefinitions", definitions);
        ui.notifications.info("PDNC.ThemeConfig.Saved", { localize: true });
    }

    async _onBrowse(event, target) {
        const fieldName = target.dataset.target;
        const input = this.element.querySelector(`input[name="${fieldName}"]`);
        
        const fp = new FilePicker({
            type: "image",
            current: input.value,
            callback: (path) => {
                input.value = path;
                // Since we don't submit on change, we just update the field value
            }
        });
        return fp.browse();
    }

    async _onClear(event, target) {
        const fieldName = target.dataset.target;
        const input = this.element.querySelector(`input[name="${fieldName}"]`);
        if (input) {
            input.value = "";
        }
    }

    async _onAddPhase(event, target) {
        // First, save current state to an array to preserve edits
        const formData = new FormDataExtended(this.element).object;
        const expanded = foundry.utils.expandObject(formData);
        const currentPhases = [];
        
        if (expanded.phases) {
            for (const data of Object.values(expanded.phases)) {
                currentPhases.push({
                    id: data.id,
                    label: data.label,
                    start: ThemeSystem.parseTimeToDecimal(data.startTime),
                    end: ThemeSystem.parseTimeToDecimal(data.endTime)
                });
            }
        }

        // Add new phase
        currentPhases.push({
            id: `custom_${Date.now()}`,
            label: "New Phase",
            start: 0,
            end: 0
        });

        await game.settings.set(MODULE_ID, "phaseDefinitions", currentPhases);
        this.render({ force: true });
    }

    async _onDeletePhase(event, target) {
        const index = parseInt(target.dataset.index);
        const formData = new FormDataExtended(this.element).object;
        const expanded = foundry.utils.expandObject(formData);
        const currentPhases = [];
        
        if (expanded.phases) {
            for (const [idx, data] of Object.entries(expanded.phases)) {
                if (parseInt(idx) === index) continue;
                currentPhases.push({
                    id: data.id,
                    label: data.label,
                    start: ThemeSystem.parseTimeToDecimal(data.startTime),
                    end: ThemeSystem.parseTimeToDecimal(data.endTime)
                });
            }
        }

        await game.settings.set(MODULE_ID, "phaseDefinitions", currentPhases);
        this.render({ force: true });
    }
}
