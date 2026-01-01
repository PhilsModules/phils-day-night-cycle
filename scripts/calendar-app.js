const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { CalendarSystem } from "./calendar-system.js";
import { CalendarDB } from "./calendar-db.js";
import { CalendarEventEditor } from "./calendar-event-editor.js";
import { CalendarDayViewer } from "./calendar-day-viewer.js";

const MODULE_ID = "phils-day-night-cycle";

export class PhilsCalendarApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.system = new CalendarSystem();
        this.viewYear = undefined;
        this.viewMonth = undefined;
    }

    get title() {
        return game.i18n.localize("PDNC.CalendarTitle");
    }

    static DEFAULT_OPTIONS = {
        id: "phils-calendar-app",
        tag: "form",
        classes: ["pdnc-calendar-window", "pdnc-event-editor-window"],
        window: {
            resizable: true,
            width: 500,
            icon: "fas fa-calendar-alt"
        },
        position: {
            width: 500,
            height: "auto"
        },
        actions: {
            prevMonth: PhilsCalendarApp.prototype._onPrevMonth,
            nextMonth: PhilsCalendarApp.prototype._onNextMonth,
            dayClick: PhilsCalendarApp.prototype._onDayClick,
            dayContext: PhilsCalendarApp.prototype._onDayContext,
        }
    };

    static PARTS = {
        calendar: {
            template: `modules/${MODULE_ID}/templates/calendar.html`
        }
    };

    async _prepareContext(options) {
        // Get Current World Date with Offsets
        let worldTime = game.time.worldTime;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        worldTime += (offsetMinutes * 60);
        worldTime += (offsetDays * 86400);

        const currentDate = this.system.getDate(worldTime);

        // Init view state if undefined
        if (this.viewYear === undefined) this.viewYear = currentDate.year;
        if (this.viewMonth === undefined) this.viewMonth = currentDate.month;

        const config = this.system.config;
        const monthConfig = config.months[this.viewMonth];
        const monthName = monthConfig.name;

        // Calculate days in this month
        const daysInMonth = this.system.getDaysInMonth(this.viewYear, this.viewMonth);

        // Calculate start weekday
        const totalDaysBeforeStart = this._calculateTotalDaysBefore(this.viewYear, this.viewMonth);
        const startWeekdayIndex = (totalDaysBeforeStart + (config.weekdayStart || 0)) % config.weekdays.length;

        const days = [];

        // Pad empty days
        for (let i = 0; i < startWeekdayIndex; i++) {
            days.push({ isEmpty: true });
        }

        // Add actual days
        const savedEvents = await CalendarDB.getEvents();
        const isGM = game.user.isGM;

        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${this.viewYear}-${this.viewMonth}-${d}`;
            let events = savedEvents[dateKey] || [];

            // Format and Filter Events
            events = events.map(e => {
                // Compatibility for old string events
                if (typeof e === 'string') return { title: e, type: 'event', class: '' };
                return { ...e, class: e.type || 'event' };
            }).filter(e => {
                if (e.type === 'gm' && !isGM) return false;
                if (e.type === 'player' && !isGM && !game.settings.get(MODULE_ID, "playerCreateEvents")) {
                    // Check if author is self (if we track author) -> currently simple filter
                    // If player permissions are off, maybe hide others? 
                    // For now: Player notes are visible to all if allowed, or restricted?
                    // Player Notes are visible to all players for collaboration.
                    return true;
                }
                return true;
            });

            days.push({
                number: d,
                isEmpty: false,
                isCurrent: (this.viewYear === currentDate.year && this.viewMonth === currentDate.month && d === currentDate.day),
                events: events,
                dateKey: dateKey // Passed for click handler
            });
        }

        return {
            year: this.viewYear,
            monthName: monthName,
            weekdays: config.weekdays.map(w => w.substring(0, 3)),
            days: days
        };
    }

    _calculateTotalDaysBefore(year, monthIndex) {
        let total = 0;
        const yearZero = this.system.config.yearZero || 0;
        // Add full years from yearZero
        for (let y = yearZero; y < year; y++) {
            total += this.system.getDaysInYear(y);
        }
        // Add full months in current year
        for (let m = 0; m < monthIndex; m++) {
            total += this.system.getDaysInMonth(year, m);
        }
        return total;
    }

    _onPrevMonth(event, target) {
        this.viewMonth--;
        if (this.viewMonth < 0) {
            this.viewMonth = 11;
            this.viewYear--;
        }
        this.render();
    }

    _onNextMonth(event, target) {
        this.viewMonth++;
        if (this.viewMonth > 11) {
            this.viewMonth = 0;
            this.viewYear++;
        }
        this.render();
    }

    async _onDayClick(event, target) {
        const dayNum = Number(target.dataset.day);
        const dateKey = target.dataset.datekey || `${this.viewYear}-${this.viewMonth}-${dayNum}`;

        const savedEvents = await CalendarDB.getEvents();
        let currentEvents = savedEvents[dateKey] || [];

        // Filter out GM-only events for players
        if (!game.user.isGM) {
            currentEvents = currentEvents.filter(e => e.type !== 'gm');
        }

        // Open Read-Only Viewer with Edit Callback
        new CalendarDayViewer(dateKey, currentEvents, (indexToEdit) => {
            // Open Editor in Edit Mode
            // We don't need a default type for editing, but we pass 'event' as fallback
            this._openEditor(dateKey, 'event', indexToEdit);
        }).render(true);
    }

    async _openEditor(dateKey, defaultType = 'event', editIndex = null) {
        const savedEvents = await CalendarDB.getEvents();
        const currentEvents = savedEvents[dateKey] || [];

        new CalendarEventEditor(dateKey, currentEvents, defaultType, editIndex, async (action, eventData, index) => {
            // Unified Save Logic (works for GM and Players via ownership)
            const currentSaved = await CalendarDB.getEvents();
            if (!currentSaved[dateKey]) currentSaved[dateKey] = [];

            if (action === 'save') {
                if (index !== null && index >= 0) {
                    currentSaved[dateKey][index] = eventData;
                } else {
                    currentSaved[dateKey].push(eventData);
                }
            } else if (action === 'delete') {
                if (index !== null && index >= 0) {
                    currentSaved[dateKey].splice(index, 1);
                    if (currentSaved[dateKey].length === 0) delete currentSaved[dateKey];
                }
            }

            await CalendarDB.saveEvents(currentSaved);
            // No manual render needed if we listen to hook, but for instant feedback:
            this.render();
        }).render(true);
    }

    async _onRender(context, options) {
        super._onRender(context, options);

        // Direct binding to day elements to ensure right-click is caught
        const days = this.element.querySelectorAll('.pdnc-day');
        days.forEach(day => {
            day.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // We can call the handler directly
                this._onDayContext(e, day);
            });
        });

        // Listen for DB updates to re-render
        if (!this._dbHook) {
            this._dbHook = Hooks.on("updateJournalEntry", (doc, change, options, userId) => {
                const dbId = game.settings.get(MODULE_ID, "dbJournalId");
                if (doc.id === dbId) {
                    this.render();
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

    _onDayContext(event, target) {
        // Position info
        const clientX = event.clientX;
        const clientY = event.clientY;

        const dayNum = Number(target.dataset.day);
        const dateKey = target.dataset.datekey || `${this.viewYear}-${this.viewMonth}-${dayNum}`;
        const isGM = game.user.isGM;

        // Build Context Menu Items
        const menuItems = [
            {
                name: game.i18n.localize("PDNC.AddEvent"),
                icon: '<i class="fas fa-calendar-plus"></i>',
                callback: () => this._openEditor(dateKey, 'event')
            }
        ];

        if (isGM) {
            menuItems.push({
                name: game.i18n.localize("PDNC.TypeGM"),
                icon: '<i class="fas fa-user-secret"></i>',
                callback: () => this._openEditor(dateKey, 'gm')
            });
        }

        if (isGM || game.settings.get(MODULE_ID, "playerCreateEvents")) {
            menuItems.push({
                name: game.i18n.localize("PDNC.TypePlayer"),
                icon: '<i class="fas fa-sticky-note"></i>',
                callback: () => this._openEditor(dateKey, 'player')
            });
        }

        // Render Custom Context Menu
        $('.pdnc-context-menu').remove(); // Clear existing

        const menu = $(`<div class="pdnc-context-menu"></div>`);
        menuItems.forEach(item => {
            const el = $(`<div class="pdnc-context-item">${item.icon} ${item.name}</div>`);
            el.click(() => {
                item.callback();
                menu.remove();
            });
            menu.append(el);
        });

        $('body').append(menu);
        menu.css({
            top: clientY,
            left: clientX
        });

        // Close on outside click
        const closeMenu = (e) => {
            if (!menu[0].contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('contextmenu', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            document.addEventListener('contextmenu', closeMenu);
        }, 10);
    }
}
