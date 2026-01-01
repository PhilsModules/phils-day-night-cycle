const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const MODULE_ID = "phils-day-night-cycle";

export class CalendarEventEditor extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(dateKey, currentEvents, defaultType = 'event', editIndex = null, callback) {
        super({});
        this.dateKey = dateKey;
        this.events = currentEvents.map(e => {
            if (typeof e === 'string') return { title: e, type: 'event', author: game.user.id };
            return e.title ? e : { title: e, type: 'event', author: game.user.id };
        });
        this.defaultType = defaultType;
        this.editIndex = editIndex;
        this.editEvent = editIndex !== null && editIndex >= 0 ? this.events[editIndex] : null;
        this.callback = callback;
    }

    get title() {
        return this.editEvent ? game.i18n.localize("PDNC.EditEvent") : game.i18n.localize("PDNC.AddEvent");
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: "phils-calendar-editor",
        window: {
            resizable: true,
            icon: "fas fa-edit",
            width: 400,
            height: "auto",
            classes: ["pdnc-event-editor-window"]
        },
        position: {
            width: 400,
            height: "auto"
        },
        actions: {
            delete: CalendarEventEditor.prototype._onDelete
        },
        form: {
            handler: CalendarEventEditor.prototype._onSubmit,
            submitOnChange: false,
            closeOnSubmit: true
        }
    };

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/event-editor.html`
        }
    };

    async _prepareContext(options) {
        const isGM = game.user.isGM;
        const playerCreate = game.settings.get(MODULE_ID, "playerCreateEvents");
        const canCreate = isGM || playerCreate;

        // Determine title, description, and type
        let title = "";
        let description = "";
        let type = this.defaultType;

        if (this.editEvent) {
            title = this.editEvent.title || "";
            description = this.editEvent.description || "";
            type = this.editEvent.type;
        }

        return {
            dateKey: this.dateKey,
            isGM: isGM,
            canCreate: canCreate,
            defaultType: type, // Pre-select existing type or default
            title: title,
            description: description,
            isEditing: !!this.editEvent
        };
    }

    async _onSubmit(event, form, formData) {
        const title = formData.object.title;
        const description = formData.object.description;
        const type = formData.object.type;

        if (this.callback) {
            this.callback('save', {
                title: title,
                description: description,
                type: type,
                author: this.editEvent ? this.editEvent.author : game.user.id,
                timestamp: this.editEvent ? this.editEvent.timestamp : Date.now()
            }, this.editIndex);
        }
    }

    _onDelete(event, target) {
        if (this.callback) {
            this.callback('delete', null, this.editIndex);
            this.close();
        }
    }
}
