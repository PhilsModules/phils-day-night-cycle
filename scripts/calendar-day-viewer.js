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
        // Fetch fresh events
        const savedEvents = await CalendarDB.getEvents();
        
        // Use fresh events for the key, fallback to empty
        // Note: We lose "projected" events logic from CalendarApp if we just pull from DB.
        // BUT currentEvents passed in constructor contained projections?
        // If we re-fetch from DB, we only get raw DB events, not recurring projections calculated by CalendarApp.
        // This is tricky.
        
        // Solution: We should probably just listen to the hook and if triggered, close? 
        // Or we rely on CalendarApp to refresh us?
        
        // Better: We are viewing a specific date.
        // If we want LIVE updates, we must re-calculate projections or accept that projections might not update unless we duplicate logic.
        // HOWEVER, the deletion target (Quest) is likely a REAL event, not a projection (unless recurring).
        // Let's assume for now we just want to see the Quest disappear. Quest events are usually single instances in DB.
        
        // Let's mix: Use constructor events as "base" or "cache" but if we re-render, we try to re-fetch?
        // Actually, simplest is: Close the window if data changes? No that's jarring.
        
        // Let's implement basic re-fetch for non-recurring first.
        let displayEvents = this.events; // Default to what we were given
        
        // Robustness: If we re-render, we want fresh data.
        const dbEvents = savedEvents[this.dateKey] || [];
        
        // Strategy: 
        // If this is a re-render triggered by DB update, we should try to match against DB.
        // We can filter our current `this.events` (which might contain projections) 
        // by checking if the underlying DB event still exists for non-projections.
        
        // For Quests (external events), they are always real DB events.
        // So fetching specific dateKey from DB is safe.
        // PROJECTIONS from *other* dates might remain stale if we don't re-calc. 
        // BUT for this specific bug (Deleting Quest), re-fetching dateKey is sufficient.
        
        if (options.isRender) { // Custom flag or just always?
             // Merge/Overwrite with fresh DB data for this date
             // We keep projections (isRecurring=true) from original list, 
             // but replace real events with fresh DB events.
             const freshRealEvents = dbEvents;
             const projections = this.events.filter(e => e.isRecurring); // Keep old projections
             
             // Re-apply filters? (GM/Player)
             const isGM = game.user.isGM;
             const filteredReal = freshRealEvents.filter(e => {
                  if (e.type === 'gm' && !isGM) return false;
                  if (e.gmOnly && !isGM) return false;
                  if (e.type === 'player' && !isGM && !game.settings.get(MODULE_ID, "playerCreateEvents")) { 
                      return false;
                  }
                  return true;
             });
             
             // We update this.events to be the new mix
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
        // Listen for DB updates
        if (!this._dbHook) {
            // Debounce to prevent render storms
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
        if (this._dbHook) {
            Hooks.off("updateJournalEntry", this._dbHook);
            this._dbHook = null;
        }
        return super.close(options);
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
