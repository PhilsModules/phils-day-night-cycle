const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { CalendarSystem } from "./calendar-system.js";
import { CalendarDB } from "./calendar-db.js";
import { CalendarEventEditor } from "./calendar-event-editor.js";
import { CalendarDayViewer } from "./calendar-day-viewer.js";
import { WeatherHUD } from "./weather-hud.js";

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
            openWeather: PhilsCalendarApp.prototype._onOpenWeather,
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
                
                // Add class for styling
                // If type is 'weather' (future proofing) or has special flag
                let cssClass = e.type || 'event';
                // If we want to detect weather events specifically that might be 'event' type but generated?
                // Assuming weather events are stored with type='weather' OR we check for a flag.
                // If the user says they are white, it means they are falling back to 'event' or just not 'weather'.
                
                return { ...e, class: cssClass };
            }).filter(e => {
                // If it's a weather event, always show (unless hidden by setting, but logic is here)
                if (e.type === 'weather') return true;

                if (e.type === 'gm' && !isGM) return false;
                if (e.type === 'player' && !isGM && !game.settings.get(MODULE_ID, "playerCreateEvents")) {
                    return true;
                }
                return true;
            }).filter(e => {
                // EXCLUDE DATES CHECK FOR PRIMARY EVENTS (Start Date Exclusion)
                if (e.excludeDates && Array.isArray(e.excludeDates)) {
                    if (e.excludeDates.includes(`${this.viewYear}-${this.viewMonth}-${d}`)) return false;
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

        // --- RECURRING EVENTS LOGIC ---
        // 1. Gather all recurring events from the entire DB
        const allRecurring = [];
        for (const [key, eventList] of Object.entries(savedEvents)) {
            for (const event of eventList) {
                if (event.recurring && event.recurring !== 'none') {
                    allRecurring.push({ key, event });
                }
            }
        }

        // 2. Project them onto the current view
        for (const dayObj of days) {
            if (dayObj.isEmpty) continue;

            const targetYear = this.viewYear;
            const targetMonth = this.viewMonth;
            const targetDay = dayObj.number;

            for (const { key: sourceKey, event } of allRecurring) {
                const [srcY, srcM, srcD] = sourceKey.split('-').map(Number);
                
                // Optimization: Don't show recurring events before they started
                // A simple comparison of Y/M/D is needed.
                if (targetYear < srcY) continue;
                if (targetYear === srcY && targetMonth < srcM) continue;
                if (targetYear === srcY && targetMonth === srcM && targetDay < srcD) continue;
                 // Don't duplicate if it's the exact same day (already in events list)
                if (targetYear === srcY && targetMonth === srcM && targetDay === srcD) continue;

                if (this.system.isRecurringMatch(event, srcY, srcM, srcD, targetYear, targetMonth, targetDay)) {
                     // Create a visual copy
                     dayObj.events.push({
                         ...event,
                         isRecurring: true, 
                         originalDate: sourceKey,
                         // Maybe add a visual indicator class
                         class: (event.type || 'event') + ' recurring'
                     });
                }
            }
        }
        // ------------------------------

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

    _onOpenWeather(event, target) {
        new WeatherHUD().render(true);
    }

    async _onDayClick(event, target) {
        const dayNum = Number(target.dataset.day);
        const dateKey = target.dataset.datekey || `${this.viewYear}-${this.viewMonth}-${dayNum}`;

        const savedEvents = await CalendarDB.getEvents();
        let currentEvents = savedEvents[dateKey] || [];

        // Filter out GM-only events for players, and CLONE for everyone to prevent cache mutation
        if (!game.user.isGM) {
            currentEvents = currentEvents.filter(e => e.type !== 'gm');
        } else {
            // CRITICAL: Clone the array so we don't push projections into the DB cache
            currentEvents = [...currentEvents];
        }

        // --- RECURRING PROJECTION FOR DAY VIEW ---
        const allSaved = await CalendarDB.getEvents();
        const targetDateKey = dateKey;
        const [tY, tM, tD] = targetDateKey.split('-').map(Number);

        for (const [key, eventList] of Object.entries(allSaved)) {
             for (const event of eventList) {
                 if (event.recurring && event.recurring !== 'none') {
                     // Don't duplicate if it's the exact same day
                     if (key === targetDateKey) continue; 

                     const [sY, sM, sD] = key.split('-').map(Number);
                     
                     // Helper optimization similar to Main View
                     if (tY < sY) continue; 
                     // ... strictly we need full date comparison but Year check is good start
                     
                     if (this.system.isRecurringMatch(event, sY, sM, sD, tY, tM, tD)) {
                         // Add projected event
                         currentEvents.push({
                             ...event,
                             isRecurring: true,
                             originalDate: key,
                             class: (event.type || 'event') + ' recurring'
                         });
                     }
                 }
             }
        }
        // -----------------------------------------

        // Open Read-Only Viewer with Edit Callback
        new CalendarDayViewer(dateKey, currentEvents, (indexToEdit) => {
            // Open Editor in Edit Mode
            const eventToEdit = currentEvents[indexToEdit];
            this._openEditor(dateKey, 'event', eventToEdit);
        }).render(true);
    }

    async _openEditor(dateKey, defaultType = 'event', eventToEdit = null) {
        new CalendarEventEditor(dateKey, eventToEdit, defaultType, async (action, eventData, oldEvent) => {
            const currentSaved = await CalendarDB.getEvents();
            
            // Helper to match events (Robust matching for Delete/Update)
            const isMatch = (e, evt) => {
                // Handle nulls
                if (!e || !evt) return false;

                // 0. Legacy String Handling
                if (typeof e === 'string') {
                    // evt is the Object form from Editor. Check title and lack of timestamp.
                    // If the event in DB is a string, it has no timestamp.
                    // The editor object might happen to have no timestamp if it was created from a string.
                    const evtIsLegacy = !evt.timestamp;
                    return evtIsLegacy && e === evt.title && (!evt.type || evt.type === 'event');
                }

                // 1. Exact Timestamp Match (Preferred)
                // If both have timestamps, they MUST match.
                if (e.timestamp && evt.timestamp) {
                     return e.timestamp === evt.timestamp;
                }

                // 2. Exact Signature Match (Fallback)
                const r1 = e.recurring || 'none';
                const r2 = evt.recurring || 'none';
                const d1 = e.description || "";
                const d2 = evt.description || "";
                
                // Compare primitive values strictly
                if (e.title === evt.title && 
                    d1 === d2 && 
                    e.type === evt.type && 
                    r1 === r2 &&
                    e.author === evt.author) return true;
                
                return isMatchResult;
            };

            const findIndex = (list, evt) => {
                if (!list) return -1;
                const idx = list.findIndex(e => isMatch(e, evt));
                if (idx === -1) {
                    console.warn("PDNC | findIndex FAILED. Debug Info:", { 
                        searchingFor: evt, 
                        candidates: list 
                    });
                }
                return idx;
            };

            if (action === 'save') {
                // Determine target date and list based on scope
                const isRecurringSplit = (eventData.recurrenceScope === 'instance' && oldEvent && oldEvent.isRecurring);
                
                if (isRecurringSplit) {
                    // CASE 1: Split Instance (Create new exception)
                    console.log("PDNC | Splitting Recurring Instance:", oldEvent, "New Data:", eventData);
                    
                    // 1. Update Original (Add Exception)
                    const originDate = oldEvent.originalDate;
                    if (!originDate) {
                        // If we are on the Start Date, oldEvent.originalDate might be undefined if it wasn't a projection.
                        // Ideally we should have set it, or we use dateKey?
                        // But wait, if we split the START DATE, we basically just want to Modify the original event?
                        // No, "Split" implies we want to change THIS instance but keep the series logic for others?
                        // Actually, if we are on Start Date, we are modifying the SOURCE directly. 
                        // The user probably chose "Only This Instance" -> meaning they want to change THIS day's event, 
                        // but leave the recurrence rule intact for future?
                        // This implies:
                        // A) Create a NEW recurrence source starting from the NEXT occurrence?
                        // B) Or make the current source an "Exception" (hidden) and create a new single event here?
                        // B is cleaner.
                        // So we need to find the Source (which IS this event).
                        console.log("PDNC | Edit 'Only This' on Start Date detected.");
                        // We are editing the source directly.
                        if (currentSaved[dateKey]) {
                             const idx = findIndex(currentSaved[dateKey], oldEvent);
                             if (idx >= 0) {
                                 const original = currentSaved[dateKey][idx];
                                 if (!original.excludeDates) original.excludeDates = [];
                                 original.excludeDates.push(dateKey); // Hide self
                             }
                        }
                    } else {
                         // Standard Projection Split
                        if (currentSaved[originDate]) {
                            const originalIdx = findIndex(currentSaved[originDate], oldEvent);
                            if (originalIdx >= 0) {
                                const original = currentSaved[originDate][originalIdx];
                                if (!original.excludeDates) original.excludeDates = [];
                                if (!original.excludeDates.includes(dateKey)) {
                                    original.excludeDates.push(dateKey);
                                }
                            }
                        }
                    }

                    // 2. Create New Event on Current Date
                    if (!currentSaved[dateKey]) currentSaved[dateKey] = [];
                    // Ensure new event is NOT recurring (it's an exception instance)
                    eventData.recurring = 'none'; 
                    // FORCE NEW TIMESTAMP for unique ID
                    eventData.timestamp = Date.now();
                    
                    // Remove internal flags
                    delete eventData.recurrenceScope;
                    delete eventData.originalDate; 
                    currentSaved[dateKey].push(eventData);

                } else {
                    // CASE 2: Update Series OR Normal Update
                    // Check recurring status to ensure we don't follow stale originalDate links for non-recurring items
                    const isRecurring = oldEvent && oldEvent.recurring && oldEvent.recurring !== 'none';
                    const targetDate = (isRecurring && oldEvent.originalDate) ? oldEvent.originalDate : dateKey;
                    
                    if (!currentSaved[targetDate]) currentSaved[targetDate] = [];
                    
                    if (oldEvent) {
                        const idx = findIndex(currentSaved[targetDate], oldEvent);
                        if (idx >= 0) {
                            // Update existing - MERGE to preserve excludeDates etc.
                            const existing = currentSaved[targetDate][idx];
                            // Clean up recurrenceScope from eventData before merge
                            delete eventData.recurrenceScope;
                            
                            // Check if we are updating a legacy string event
                            // If existing was string, we need to replace it with object
                            let baseObj = (typeof existing === 'string') ? { title: existing, type: 'event' } : existing;

                            currentSaved[targetDate][idx] = {
                                ...baseObj,
                                ...eventData
                            };
                            console.log("PDNC | Updated Series/Event:", currentSaved[targetDate][idx]);
                        } else {
                             // Fallback: Push (This implies we couldn't match the event to update)
                             console.warn("PDNC | Could not find original event to update. Creating new.", oldEvent, eventData);
                             delete eventData.recurrenceScope;
                             currentSaved[targetDate].push(eventData);
                        }
                    } else {
                         // New Event creation
                         delete eventData.recurrenceScope;
                         currentSaved[targetDate].push(eventData);
                    }
                }

            } else if (action === 'save-new') {
                // New Event
                if (!currentSaved[dateKey]) currentSaved[dateKey] = [];
                delete eventData.recurrenceScope;
                delete eventData.originalDate; // Ensure clean slate
                currentSaved[dateKey].push(eventData);
            
            } else if (action === 'delete' || action === 'delete-series') {
                // Delete Entire Series or Single Non-Recurring Event
                const isRecurring = oldEvent && oldEvent.recurring && oldEvent.recurring !== 'none';
                const targetDate = (isRecurring && oldEvent.originalDate) ? oldEvent.originalDate : dateKey;
                if (currentSaved[targetDate]) {
                    // AGGRESSIVE CLEANUP: Remove ALL duplicates of this event
                    const initialLength = currentSaved[targetDate].length;
                    
                    currentSaved[targetDate] = currentSaved[targetDate].filter(e => {
                        // 1. Strict Match
                        if (isMatch(e, oldEvent)) return false; 
                        
                        // 2. Soft Match (Duplicate Cleanup)
                        // Relaxed: Ignore Author, Trim Strings
                        const t1 = (e.title || "").trim();
                        const t2 = (oldEvent.title || "").trim();
                        
                        if (t1 === t2 && 
                            e.description === oldEvent.description && 
                            e.type === oldEvent.type && 
                            e.recurring === oldEvent.recurring) {
                                console.warn("PDNC | Detected Duplicate Event (Soft Match) - Removing:", e);
                                return false; 
                        }

                        return true;
                    });

                    const deletedCount = initialLength - currentSaved[targetDate].length;

                    if (deletedCount > 0) {
                        if (currentSaved[targetDate].length === 0) {
                            delete currentSaved[targetDate];
                            currentSaved["-=" + targetDate] = null; // FORCE DELETE in Foundry DB
                        }
                        console.log(`PDNC | Deleted ${deletedCount} instance(s) of event.`);
                        if (deletedCount > 1) ui.notifications.info(`PDNC | Cleaned up ${deletedCount - 1} duplicate(s).`);
                    } else {
                        console.warn("PDNC | Could not find event to delete:", oldEvent);
                        console.log("PDNC | Debug - Current Events on Date:", currentSaved[targetDate]);
                        ui.notifications.warn("PDNC | Debug: Could not find event to delete. Check console.");
                    }
                } else {
                     console.warn("PDNC | No events found for date:", targetDate);
                }
            } else if (action === 'delete-instance') {
                 // Delete Single Instance of Recurring Event (Add Exception)
                 console.log("PDNC | Delete Instance requested for:", oldEvent);
                 
                 // If oldEvent has originalDate, it is a projection. 
                 // If NOT, and it is Recurring, it is the Start Date Source.
                 const originDate = oldEvent.originalDate || dateKey; // Fallback to current date if start date

                 if (currentSaved[originDate]) {
                    const originalIdx = findIndex(currentSaved[originDate], oldEvent);
                    if (originalIdx >= 0) {
                        const original = currentSaved[originDate][originalIdx];
                        if (!original.excludeDates) original.excludeDates = [];
                        if (!original.excludeDates.includes(dateKey)) {
                            original.excludeDates.push(dateKey);
                            console.log(`PDNC | Excluded date ${dateKey} from series starting ${originDate}`);
                        }
                         // If we just excluded the Start Date, we effectively "deleted" the instance at start.
                         // But the Recurrence Rule still exists on this object.
                         // The object is still in DB, but hidden by _prepareContext filter now.
                         // AND it projects to future dates.
                    } else {
                        console.warn("PDNC | Could not find original event to add exception.", oldEvent);
                    }
                 }

            } else if (action === 'delete-future') {
                 // Delete This and All Future Instances
                 const originDate = oldEvent.originalDate || dateKey;

                 // Logic: If we are modifying the START DATE (originDate == dateKey),
                 // then "Delete Future" (This and Future) implies "Delete Series" (All).
                 if (originDate === dateKey) {
                     console.log("PDNC | Delete Future on Start Date detected -> Swapping to Delete Series logic.");
                     // Reuse Delete Series Logic manually
                     if (currentSaved[originDate]) {
                        currentSaved[originDate] = currentSaved[originDate].filter(e => {
                            if (isMatch(e, oldEvent)) return false;
                            
                            // Soft Match for Duplicates
                            const t1 = (e.title || "").trim();
                            const t2 = (oldEvent.title || "").trim();
                            
                            if (t1 === t2 && 
                                e.description === oldEvent.description && 
                                e.type === oldEvent.type && 
                                e.recurring === oldEvent.recurring) {
                                    return false; 
                            }
                            return true;
                        });
                        if (currentSaved[originDate].length === 0) {
                             delete currentSaved[originDate];
                             currentSaved["-=" + originDate] = null; // FORCE DELETE
                        }
                     }
                 } else {
                     // Standard "Cut off" logic
                     if (currentSaved[originDate]) {
                         const originalIdx = findIndex(currentSaved[originDate], oldEvent);
                         if (originalIdx >= 0) {
                             const original = currentSaved[originDate][originalIdx];
                             
                             // Calculate day before dateKey
                             const [year, month, day] = dateKey.split('-').map(Number);
                             const ts = this.system.getTimestamp(year, month, day);
                             const yesterdayTs = ts - 86400; 
                             const yesterdayDate = this.system.getDate(yesterdayTs);
                             
                             // Format: YYYY-M-D
                             original.untilDate = `${yesterdayDate.year}-${yesterdayDate.month}-${yesterdayDate.day}`;
                             console.log("PDNC | Set recurring end date (Delete Future):", original.untilDate);
                         } else {
                             console.warn("PDNC | Could not find original event for Delete Future.", oldEvent);
                         }
                     }
                 }
            }

            await CalendarDB.saveEvents(currentSaved);
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

        // DEBUG OPTION (GM Only)
        /*if (isGM) {
            const debugEl = $(`<div class="pdnc-context-item"><i class="fas fa-bug"></i> DEBUG: Log Data</div>`);
            debugEl.click(async () => {
                const saved = await CalendarDB.getEvents();
                console.log(`PDNC | DEBUG DATA for ${dateKey}:`, saved[dateKey]);
                ui.notifications.info("PDNC | Data logged to console (F12)");
                menu.remove();
            });
            menu.append(debugEl);
        }*/

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
