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
        this.viewMode = 'month'; // 'month', 'year', 'list'
        
        // Load saved filters or default
        const savedFilters = game.user.getFlag('phils-day-night-cycle', 'calendarFilters');
        this.filters = savedFilters || {
            event: true,
            gm: true,
            player: true,
            weather: true,
            quest: true
        };
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
            prevView: PhilsCalendarApp.prototype._onPrevView,
            nextView: PhilsCalendarApp.prototype._onNextView,
            dayClick: PhilsCalendarApp.prototype._onDayClick,
            dayContext: PhilsCalendarApp.prototype._onDayContext,
            openWeather: PhilsCalendarApp.prototype._onOpenWeather,
            toggleViewMenu: PhilsCalendarApp.prototype._onToggleViewMenu,
            setView: PhilsCalendarApp.prototype._onSetView,
            selectMonth: PhilsCalendarApp.prototype._onSelectMonth,
            jumpToEvent: PhilsCalendarApp.prototype._onJumpToEvent,
            toggleFilterMenu: PhilsCalendarApp.prototype._onToggleFilterMenu,
            toggleFilter: PhilsCalendarApp.prototype._onToggleFilter
        }
    };

    static PARTS = {
        calendar: {
            template: `modules/${MODULE_ID}/templates/calendar.html`
        }
    };

    /**
     * Override to set explicit dimensions based on view mode
     */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        // If we want to adapt window size based on view
        if (this.viewMode === 'year') {
             // Wider for grid? 
             // options.window.width = 800; // Example
             // Stick to CSS handling resizing for now, flex grid
        }
    }

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

        // Context Data
        const context = {
            viewMode: this.viewMode,
            weekLength: config.weekdays.length, 
            isMonthView: this.viewMode === 'month',
            isYearView: this.viewMode === 'year',
            isListView: this.viewMode === 'list',
            year: this.viewYear,
            monthName: monthName,
            filters: Object.entries(this.filters).map(([key, active]) => ({
                type: key,
                label: game.i18n.localize(`PDNC.Type${key === 'gm' ? 'GM' : key.charAt(0).toUpperCase() + key.slice(1)}`) || key,
                active: active
            }))
        };

        // --- LOAD DATA BASED ON VIEW ---
        
        if (this.viewMode === 'month') {
            const monthData = await this._prepareMonthData(this.viewYear, this.viewMonth, currentDate);
            Object.assign(context, monthData);
        } else if (this.viewMode === 'year') {
            const yearData = await this._prepareYearData(this.viewYear, currentDate);
            Object.assign(context, yearData);
        } else if (this.viewMode === 'list') {
            const listData = await this._prepareListData(currentDate);
            Object.assign(context, listData);
        }

        return context;
    }

    // ==========================================================
    // DATA PREPARATION HELPERS
    // ==========================================================

    async _prepareMonthData(viewYear, viewMonth, currentDate) {
        const config = this.system.config;
        const monthConfig = config.months[viewMonth];
        
        // Calculate days in this month
        const daysInMonth = this.system.getDaysInMonth(viewYear, viewMonth);

        // Calculate start weekday
        const totalDaysBeforeStart = this._calculateTotalDaysBefore(viewYear, viewMonth);
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
            const dateKey = `${viewYear}-${viewMonth}-${d}`;
            let events = savedEvents[dateKey] || [];

            // Format and Filter Events
            events = events.map(e => {
                if (typeof e === 'string') return { title: e, type: 'event', class: '' };
                let cssClass = e.type || 'event';
                return { ...e, class: cssClass };
            }).filter(e => {
                if (e.type === 'weather') return true;
                if (e.type === 'gm' && !isGM) return false;
                if (e.gmOnly && !isGM) return false;
                if (e.type === 'player' && !isGM && !game.settings.get(MODULE_ID, "playerCreateEvents")) {
                    return true;
                }
                return true;
            }).filter(e => {
                if (e.excludeDates && Array.isArray(e.excludeDates)) {
                    if (e.excludeDates.includes(`${viewYear}-${viewMonth}-${d}`)) return false;
                }
                return true;
            });

            days.push({
                number: d,
                isEmpty: false,
                isCurrent: (viewYear === currentDate.year && viewMonth === currentDate.month && d === currentDate.day),
                events: events,
                dateKey: dateKey 
            });
        }

        // --- RECURRING EVENTS LOGIC (Same as before) ---
        const allRecurring = [];
        for (const [key, eventList] of Object.entries(savedEvents)) {
            for (const event of eventList) {
                if (event.recurring && event.recurring !== 'none') {
                    allRecurring.push({ key, event });
                }
            }
        }

        for (const dayObj of days) {
            if (dayObj.isEmpty) continue;
            const targetYear = viewYear;
            const targetMonth = viewMonth;
            const targetDay = dayObj.number;

            for (const { key: sourceKey, event } of allRecurring) {
                const [srcY, srcM, srcD] = sourceKey.split('-').map(Number);
                if (targetYear < srcY) continue;
                if (targetYear === srcY && targetMonth < srcM) continue;
                if (targetYear === srcY && targetMonth === srcM && targetDay < srcD) continue;
                if (targetYear === srcY && targetMonth === srcM && targetDay === srcD) continue;

                if (this.system.isRecurringMatch(event, srcY, srcM, srcD, targetYear, targetMonth, targetDay)) {
                     // Filter out if user cannot see it
                     if ((event.type === 'gm' || event.gmOnly) && !isGM) continue;

                     // Determine class (copy-paste logic from map)
                     let cssClass = (event.type || 'event') + ' recurring';
                     
                     dayObj.events.push({
                         ...event,
                         isRecurring: true, 
                         originalDate: sourceKey,
                         class: cssClass
                     });
                }
            }
        }

        return {
            weekdays: config.weekdays.map(w => w.substring(0, 3)),
            days: days
        };
    }

    async _prepareYearData(viewYear, currentDate) {
        const config = this.system.config;
        const months = [];
        const savedEvents = await CalendarDB.getEvents(); // Optimization: Fetch once
        // Note: For full year view, calculating recurrence for every day is heavy.
        // We will only check explicit events for now, or lightweight check?
        // Let's stick to explicit events for V1 of Year View to ensure performance.
        
        for (let m = 0; m < config.months.length; m++) {
            const mName = config.months[m].name;
            const daysInMonth = this.system.getDaysInMonth(viewYear, m);
            const simpleDays = [];

            // We need to know start weekday for the mini grid to align properly?
            // Usually year view just lists days or has a mini grid. 
            // Let's make it a proper mini grid.
            const totalDaysBefore = this._calculateTotalDaysBefore(viewYear, m);
            const startWeekday = (totalDaysBefore + (config.weekdayStart || 0)) % config.weekdays.length;

            // Empty slots
            for(let i=0; i<startWeekday; i++) {
                simpleDays.push({ isEmpty: true });
            }

            for(let d=1; d<=daysInMonth; d++) {
                const dateKey = `${viewYear}-${m}-${d}`;
                const uniqueTypes = new Set();
                const events = savedEvents[dateKey] || [];
                let hasEvents = false;

                for (const e of events) {
                     // Permission check
                     if (e.type === 'gm' && !game.user.isGM) continue;
                     if (e.gmOnly && !game.user.isGM) continue;
                     if (e.type === 'player' && !game.user.isGM && !game.settings.get(MODULE_ID, "playerCreateEvents")) continue; // Optional check

                     hasEvents = true;
                     uniqueTypes.add(e.type || 'event');
                }

                let bgStyle = "";
                let eventClass = "";
                
                if (hasEvents) {
                    const types = Array.from(uniqueTypes);
                    const colorMap = {
                        'quest': 'rgba(255, 215, 0, 0.6)',      // Gold
                        'gm': 'rgba(231, 76, 60, 0.6)',         // Red
                        'player': 'rgba(46, 204, 113, 0.6)',    // Green
                        'weather': 'rgba(52, 152, 219, 0.6)',   // Blue
                        'event': 'rgba(255, 255, 255, 0.4)'     // White
                    };

                    if (types.length === 1) {
                        eventClass = types[0]; // Logic for single class matches existing CSS
                    } else {
                        // Multi-color gradient
                        // Example: linear-gradient(135deg, red 0%, red 50%, blue 50%, blue 100%)
                        eventClass = "multi"; // Just to trigger bold text etc
                        const step = 100 / types.length;
                        let stops = [];
                        types.sort(); // Consistent order
                        
                        types.forEach((t, i) => {
                            const c = colorMap[t] || colorMap['event'];
                            const start = step * i;
                            const end = step * (i + 1);
                            stops.push(`${c} ${start}%`);
                            stops.push(`${c} ${end}%`);
                        });
                        
                        bgStyle = `background: linear-gradient(135deg, ${stops.join(', ')});`;
                    }
                }
                
                simpleDays.push({
                    number: d,
                    hasEvents: hasEvents,
                    eventClass: eventClass,
                    bgStyle: bgStyle,
                    eventCount: hasEvents ? events.length : 0, 
                    isCurrent: (viewYear === currentDate.year && m === currentDate.month && d === currentDate.day)
                });
            }

            months.push({
                index: m,
                name: mName,
                days: simpleDays
            });
        }

        return { 
            months: months,
            weekdays: config.weekdays.map(w => w.substring(0, 1)) // 1 char for mini view
        };
    }

    async _prepareListData(currentDate) {
        const savedEvents = await CalendarDB.getEvents();
        let allEvents = [];
        const isGM = game.user.isGM;

        // Flatten
        for (const [dateKey, events] of Object.entries(savedEvents)) {
            const [y, m, d] = dateKey.split('-').map(Number);
            
            events.forEach(e => {
                 // Permission Check
                 if (e.type === 'gm' && !isGM) return;
                 if (e.gmOnly && !isGM) return;
                 
                 // Legacy String handling
                 const title = (typeof e === 'string') ? e : e.title;
                 const type = (typeof e === 'string') ? 'event' : (e.type || 'event');

                 // Filter by Type
                 if (this.filters[type] === false) return;

                 allEvents.push({
                     ...e,
                     title: title,
                     type: type,
                     dateKey: dateKey,
                     year: y,
                     month: m,
                     day: d,
                     // Derived for display
                     monthName: this.system.config.months[m].name,
                     weekday: this.system.getWeekdayName(y, m, d),
                     timestampRaw: this.system.getTimestamp(y, m, d)
                 });
            });
        }

        // Sort by timestamp
        allEvents.sort((a, b) => {
            // Primary: Date
            if (a.timestampRaw !== b.timestampRaw) return a.timestampRaw - b.timestampRaw;
            // Secondary: Title
            return a.title.localeCompare(b.title);
        });

        return { allEvents: allEvents };
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

    // ==========================================================
    // ACTION HANDLERS
    // ==========================================================

    _onPrevView(event, target) {
        if (this.viewMode === 'month') {
            this.viewMonth--;
            if (this.viewMonth < 0) {
                 this.viewMonth = this.system.config.months.length - 1;
                 this.viewYear--;
            }
        } else if (this.viewMode === 'year') {
            this.viewYear--;
        }
        // List view doesn't really have "Prev" unless paginated, or maybe jump year? 
        // For now list view is all events.
        
        this.render();
    }

    _onNextView(event, target) {
        if (this.viewMode === 'month') {
             this.viewMonth++;
             if (this.viewMonth >= this.system.config.months.length) {
                 this.viewMonth = 0;
                 this.viewYear++;
             }
        } else if (this.viewMode === 'year') {
            this.viewYear++;
        }
        this.render();
    }

    _onToggleViewMenu(event, target) {
        const menu = this.element.querySelector('.pdnc-view-menu');
        if (menu) {
            menu.classList.toggle('active');
            
            // Close on click outside (one-time listener)
            const closeFn = (e) => {
                 if (!target.contains(e.target) && !menu.contains(e.target)) {
                     menu.classList.remove('active');
                     document.removeEventListener('click', closeFn);
                 }
            };
            setTimeout(() => document.addEventListener('click', closeFn), 10);
        }
    }

    _onSetView(event, target) {
        const mode = target.dataset.view;
        if (mode) {
            this.viewMode = mode;
            this.element.querySelector('.pdnc-view-menu').classList.remove('active');
            this.render();
        }
    }

    _onSelectMonth(event, target) {
        const monthIndex = Number(target.dataset.month);
        this.viewMonth = monthIndex;
        this.viewMode = 'month';
        this.render();
    }

    _onJumpToEvent(event, target) {
        const dateKey = target.dataset.datekey;
        if (dateKey) {
            const [y, m, d] = dateKey.split('-').map(Number);
            this.viewYear = y;
            this.viewMonth = m;
            // Optionally highlight the day?
            this.viewMode = 'month';
            this.render();
        }
    }

    async _onToggleFilterMenu(event, target) {
        const menu = this.element.querySelector('.pdnc-filter-menu');
        if (menu) {
            menu.classList.toggle('active');
            
            // Close on click outside
            const closeFn = (e) => {
                 if (!target.contains(e.target) && !menu.contains(e.target)) {
                     menu.classList.remove('active');
                     document.removeEventListener('click', closeFn);
                 }
            };
            setTimeout(() => document.addEventListener('click', closeFn), 10);
        }
    }

    async _onToggleFilter(event, target) {
        const type = target.dataset.type;
        if (type && this.filters.hasOwnProperty(type)) {
            this.filters[type] = !this.filters[type];
            
            // Save to flags
            await game.user.setFlag('phils-day-night-cycle', 'calendarFilters', this.filters);

            // Re-render to apply filter
            this.render();
            // Re-open menu roughly? Or keep open? 
            // In ApplicationV2 re-render replaces DOM, so menu closes.
            // We might need to restore 'active' state or just let it close.
            // User asked for "refreshed die listen ansicht ohne die abgewählten einträge sichtbar".
            // Direct refresh is good. If menu closes, it's acceptable for now, or we can look into preserving state.
        }
    }

    _onOpenWeather(event, target) {
        new WeatherHUD().render(true);
    }

    async _onDayClick(event, target) {
        const dayNum = Number(target.dataset.day);
        const dateKey = target.dataset.datekey || `${this.viewYear}-${this.viewMonth}-${dayNum}`;

        // PICKER MODE: If a callback was passed in options, use it and close
        if (this.options.onDateSelect) {
            this.options.onDateSelect(dateKey);
            this.close();
            return;
        }

        const savedEvents = await CalendarDB.getEvents();
        let currentEvents = savedEvents[dateKey] || [];

        // Filter out GM-only events for players, and CLONE
        if (!game.user.isGM) {
            currentEvents = currentEvents.filter(e => {
                if (e.type === 'gm') return false;
                if (e.gmOnly) return false;
                return true;
            });
        } else {
            currentEvents = [...currentEvents];
        }

        // --- RECURRING PROJECTION FOR DAY VIEW ---
        const allSaved = await CalendarDB.getEvents();
        const targetDateKey = dateKey;
        const [tY, tM, tD] = targetDateKey.split('-').map(Number);

        // Optimization: Pre-check if any recurring events exist to avoid empty loops if none
        // but getting object keys is cheap
        for (const [key, eventList] of Object.entries(allSaved)) {
             for (const event of eventList) {
                 if (event.recurring && event.recurring !== 'none') {
                     if (key === targetDateKey) continue; 
                     const [sY, sM, sD] = key.split('-').map(Number);
                     if (tY < sY) continue; 
                     
                     if (this.system.isRecurringMatch(event, sY, sM, sD, tY, tM, tD)) {
                         // Filter GM
                         if ((event.type === 'gm' || event.gmOnly) && !game.user.isGM) continue;

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
        
        // Open Read-Only Viewer with Edit Callback
        new CalendarDayViewer(dateKey, currentEvents, (indexToEdit) => {
            const eventToEdit = currentEvents[indexToEdit];
            this._openEditor(dateKey, 'event', eventToEdit);
        }).render(true);
    }

    async _openEditor(dateKey, defaultType = 'event', eventToEdit = null) {
        new CalendarEventEditor(dateKey, eventToEdit, defaultType, async (action, eventData, oldEvent) => {
            const currentSaved = await CalendarDB.getEvents();
            
            // Helper to match events (Robust matching for Delete/Update)
            const isMatch = (e, evt) => {
                if (!e || !evt) return false;
                if (typeof e === 'string') {
                    const evtIsLegacy = !evt.timestamp;
                    return evtIsLegacy && e === evt.title && (!evt.type || evt.type === 'event');
                }
                if (e.timestamp && evt.timestamp) {
                     return e.timestamp === evt.timestamp;
                }
                const r1 = e.recurring || 'none';
                const r2 = evt.recurring || 'none';
                const d1 = e.description || "";
                const d2 = evt.description || "";
                
                if (e.title === evt.title && 
                    d1 === d2 && 
                    e.type === evt.type && 
                    r1 === r2 &&
                    e.author === evt.author) return true;
                return false;
            };

            const findIndex = (list, evt) => {
                if (!list) return -1;
                return list.findIndex(e => isMatch(e, evt));
            };

            if (action === 'save') {
                const isRecurringSplit = (eventData.recurrenceScope === 'instance' && oldEvent && oldEvent.isRecurring);
                
                if (isRecurringSplit) {
                    // Split Instance
                    const originDate = oldEvent.originalDate;
                    if (!originDate) {
                        // Edit 'Only This' on Start Date (Exception)
                         if (currentSaved[dateKey]) {
                             const idx = findIndex(currentSaved[dateKey], oldEvent);
                             if (idx >= 0) {
                                 const original = currentSaved[dateKey][idx];
                                 if (!original.excludeDates) original.excludeDates = [];
                                 original.excludeDates.push(dateKey); 
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

                    // Create New Event on Current Date
                    if (!currentSaved[dateKey]) currentSaved[dateKey] = [];
                    eventData.recurring = 'none'; 
                    eventData.timestamp = Date.now();
                    delete eventData.recurrenceScope;
                    delete eventData.originalDate; 
                    currentSaved[dateKey].push(eventData);

                } else {
                    // Update Series OR Normal Update
                    const isRecurring = oldEvent && oldEvent.recurring && oldEvent.recurring !== 'none';
                    const targetDate = (isRecurring && oldEvent.originalDate) ? oldEvent.originalDate : dateKey;
                    
                    if (!currentSaved[targetDate]) currentSaved[targetDate] = [];
                    
                    if (oldEvent) {
                        const idx = findIndex(currentSaved[targetDate], oldEvent);
                        if (idx >= 0) {
                            const existing = currentSaved[targetDate][idx];
                            delete eventData.recurrenceScope;
                            let baseObj = (typeof existing === 'string') ? { title: existing, type: 'event' } : existing;
                            currentSaved[targetDate][idx] = { ...baseObj, ...eventData };
                        } else {
                             delete eventData.recurrenceScope;
                             currentSaved[targetDate].push(eventData);
                        }
                    } else {
                         delete eventData.recurrenceScope;
                         currentSaved[targetDate].push(eventData);
                    }
                }

            } else if (action === 'save-new') {
                if (!currentSaved[dateKey]) currentSaved[dateKey] = [];
                delete eventData.recurrenceScope;
                delete eventData.originalDate;
                currentSaved[dateKey].push(eventData);
            
            } else if (action === 'delete' || action === 'delete-series') {
                const isRecurring = oldEvent && oldEvent.recurring && oldEvent.recurring !== 'none';
                const targetDate = (isRecurring && oldEvent.originalDate) ? oldEvent.originalDate : dateKey;
                if (currentSaved[targetDate]) {
                    const initialLength = currentSaved[targetDate].length;
                    currentSaved[targetDate] = currentSaved[targetDate].filter(e => !isMatch(e, oldEvent));
                    
                    // Soft match cleanup if needed (simplified here)
                    if (initialLength === currentSaved[targetDate].length) {
                         // try soft match
                        currentSaved[targetDate] = currentSaved[targetDate].filter(e => {
                            const t1 = (e.title || "").trim();
                            const t2 = (oldEvent.title || "").trim();
                            if (t1 === t2 && e.type === oldEvent.type) return false;
                            return true;
                        });
                    }

                    if (currentSaved[targetDate].length === 0) {
                        delete currentSaved[targetDate];
                        currentSaved["-=" + targetDate] = null;
                    }
                }
            } else if (action === 'delete-instance') {
                 const originDate = oldEvent.originalDate || dateKey; 
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
            } else if (action === 'delete-future') {
                 const originDate = oldEvent.originalDate || dateKey;
                 if (originDate === dateKey) {
                     // Start date -> delete series
                     if (currentSaved[originDate]) {
                        currentSaved[originDate] = currentSaved[originDate].filter(e => !isMatch(e, oldEvent));
                        if (currentSaved[originDate].length === 0) {
                             delete currentSaved[originDate];
                             currentSaved["-=" + originDate] = null;
                        }
                     }
                 } else {
                     if (currentSaved[originDate]) {
                         const originalIdx = findIndex(currentSaved[originDate], oldEvent);
                         if (originalIdx >= 0) {
                             const original = currentSaved[originDate][originalIdx];
                             const [year, month, day] = dateKey.split('-').map(Number);
                             const ts = this.system.getTimestamp(year, month, day);
                             const yesterdayTs = ts - 86400; 
                             const yesterdayDate = this.system.getDate(yesterdayTs);
                             original.untilDate = `${yesterdayDate.year}-${yesterdayDate.month}-${yesterdayDate.day}`;
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

        // Context Menu Handler
        const days = this.element.querySelectorAll('.pdnc-day');
        days.forEach(day => {
            day.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._onDayContext(e, day);
            });
        });

        // DB Hook
        if (!this._dbHook) {
            this._debouncedRender = foundry.utils.debounce(() => {
                if (this.element) this.render(); 
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

    _onDayContext(event, target) {
        const clientX = event.clientX;
        const clientY = event.clientY;
        const dayNum = Number(target.dataset.day);
        const dateKey = target.dataset.datekey || `${this.viewYear}-${this.viewMonth}-${dayNum}`;
        const isGM = game.user.isGM;

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

        if (isGM) {
            menuItems.push({
                name: game.i18n.localize("PDNC.SetCurrentDate"),
                icon: '<i class="fas fa-calendar-check"></i>',
                callback: () => this._onChangeDate(dateKey)
            });
        }

        $('.pdnc-context-menu').remove();

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

    async _onChangeDate(targetDateKey) {
        if (!game.user.isGM) return;

        // Calculate diff
        const [tY, tM, tD] = targetDateKey.split('-').map(Number);
        
        // Fix: Include current offsets to get the correct "Visual Date"
        let worldTime = game.time.worldTime;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        worldTime += (offsetMinutes * 60);
        worldTime += (offsetDays * 86400);

        const currentDate = this.system.getDate(worldTime);
        const targetTimestamp = this.system.getTimestamp(tY, tM, tD);
        const currentTimestamp = this.system.getTimestamp(currentDate.year, currentDate.month, currentDate.day);
        
        const diffSeconds = targetTimestamp - currentTimestamp;
        const diffDays = Math.round(diffSeconds / 86400);

        if (diffDays === 0) return; // Same day

        const direction = diffDays > 0 ? "PDNC.DirectionForward" : "PDNC.DirectionBackward"; 
        const dirString = game.i18n.localize(direction);

        const absDays = Math.abs(diffDays);
        
        const confirmContent = `
            <p>${game.i18n.format("PDNC.ConfirmDateChange", {days: absDays, direction: dirString})}</p>
        `;

        const result = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("PDNC.ChangeDate") },
            content: confirmContent,
            modal: true,
            rejectClose: false,
            yes: {
                icon: 'fas fa-check',
                label: game.i18n.localize("PDNC.Save"),
            },
            no: {
                icon: 'fas fa-times',
                label: game.i18n.localize("PDNC.Cancel"),
            }
        });

        if (result) {
            await game.time.advance(diffSeconds);
        }
    }
}
