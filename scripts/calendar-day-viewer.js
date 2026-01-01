const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const MODULE_ID = "phils-day-night-cycle";

export class CalendarDayViewer extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(dateKey, events, onEditCallback) {
        super({});
        this.dateKey = dateKey;
        this.events = events;
        this.onEditCallback = onEditCallback;
    }

    get title() {
        return game.i18n.localize("PDNC.DayDetails");
    }

    static DEFAULT_OPTIONS = {
        id: "phils-calendar-day-view",
        classes: ["pdnc-event-editor-window"],
        tag: "div",
        window: {
            resizable: true,
            width: 320,
            height: "auto",
            icon: "fas fa-calendar-day"
        },
        position: {
            width: 320,
            height: "auto"
        },
        actions: {
            editEvent: CalendarDayViewer.prototype._onEditEvent,
            addEvent: CalendarDayViewer.prototype._onAddEvent
        }
    };

    static PARTS = {
        view: {
            template: `modules/${MODULE_ID}/templates/day-viewer.html`
        }
    };

    async _prepareContext(options) {
        return {
            dateKey: this.dateKey,
            events: this.events,
            hasEvents: this.events.length > 0
        };
    }

    _onEditEvent(event, target) {
        const index = Number(target.dataset.index);
        if (this.onEditCallback) {
            this.onEditCallback(index);
            // We keep the viewer open? Or close it?
            // User flow: Click event -> Editor opens -> Save/Delete -> Viewer updates?
            // Or Viewer closes?
            // Let's close Viewer to avoid clutter, or keep it open and refresh?
            // "CalendarApp" handles render, so if we refresh CalendarApp, we might lose this viewer if it's not managed carefully.
            // But DayViewer is separate app.
            // Let's close it for now to be simple, or user might want to go back.
            // User said "Day view is weird... need edit possibility...".
            // I'll close it, as Editor is modal-like.
            this.close();
        }
    }

    _onAddEvent(event, target) {
        if (this.onEditCallback) {
            this.onEditCallback(null);
            this.close();
        }
    }
}
