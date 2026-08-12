const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const MODULE_ID = "phils-day-night-cycle";
import { CalendarDB } from "./calendar-db.js";
import { CalendarSystem } from "./calendar-system.js";

export class CalendarDayViewer extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(dateKey, events, onEditCallback, system = null) {
        super({});
        this.dateKey = dateKey;
        this.events = events;
        this.onEditCallback = onEditCallback;
        this.system = system || new CalendarSystem();
    }

    get title() {
        return game.i18n.localize("PDNC.DayDetails");
    }

    static DEFAULT_OPTIONS = {
        id: "phils-calendar-day-view",
        classes: ["pdnc-app-v2", "pdnc-day-viewer-window"],
        tag: "div",
        window: {
            resizable: true,
            width: 320,
            icon: "fas fa-calendar-day"
        },
        position: {
            width: 320,
            height: 400
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
        const savedEvents = await CalendarDB.getEvents();
        const dbEvents = savedEvents[this.dateKey] || [];

        if (options.isRender) {
             const freshRealEvents = dbEvents;
             const projections = this.events.filter(e => e.isRecurring);
             
             const isGM = game.user.isGM;
             const filteredReal = freshRealEvents.filter(e => {
                  if (e.type === 'gm' && !isGM) return false;
                  if (e.gmOnly && !isGM) return false;
                  if (e.type === 'player' && !isGM && !game.settings.get(MODULE_ID, "playerCreateEvents")) { 
                      return false;
                  }
                  return true;
             });
             
             this.events = [...filteredReal, ...projections];
        }

        const { year, month, day } = CalendarSystem.parseDateKey(this.dateKey) ?? { year: 0, month: 0, day: 1 };

        return {
            dateKey: this.dateKey,
            displayDate: this.system.formatDate({ year, month, day }, { includeWeekday: true, plainText: true }),
            events: this.events,
            hasEvents: this.events.length > 0
        };
    }

    async _onRender(context, options) {
        super._onRender(context, options);
        if (!this._dbHook) {
            this._debouncedRender = foundry.utils.debounce(() => {
                if (this.element) this.render(true, { isRender: true });
            }, 100);

            this._dbHook = Hooks.on("updateJournalEntry", (doc, change, options, userId) => {
                const dbId = game.settings.get(MODULE_ID, "dbJournalId");
                if (doc.id === dbId) {
                    this._debouncedRender();
                }
            });
        }
    }

    async close(options) {
        // Clean up the journal hook on close
        if (this._dbHook) {
            Hooks.off("updateJournalEntry", this._dbHook);
            this._dbHook = null;
        }
        return super.close(options);
    }

    async _preClose(options) {
        // Web Animations API fade — awaited before element is removed from DOM
        if (this.element?.isConnected) {
            await this.element.animate(
                [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.97)" }],
                { duration: 120, easing: "ease-in", fill: "forwards" }
            ).finished;
        }
        return super._preClose(options);
    }


    _onEditEvent(event, target) {
        const index = Number(target.dataset.index);
        if (this.onEditCallback) {
            this.onEditCallback(index);
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
