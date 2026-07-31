const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { CalendarSystem } from "../calendar-system.js";
import { WeatherSystem } from "../weather-system.js";

const MODULE_ID = "phils-day-night-cycle";

export class StartupWizard extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        
        // Internal state (not saved to settings until submit)
        // Initialize with current settings or defaults
        this._wizardState = {
            calendarSystem: game.settings.get(MODULE_ID, "calendarSystem") || "gregorian",
            tempUnit: game.settings.get(MODULE_ID, "temperatureUnit") || "C",
            syncPF2e: game.settings.get(MODULE_ID, "syncPF2e") || false
        };
    }

    static DEFAULT_OPTIONS = {
        id: "phils-startup-wizard",
        tag: "form",
        window: {
            title: "PDNC.Wizard.Title", // Ensure this key exists in en.json/de.json or it will show raw key
            icon: "fas fa-magic",
            resizable: true,
            controls: []
        },
        position: {
            width: 550,
            height: "auto"
        },
        classes: ["pdnc-app-v2", "pdnc-wizard-window"],
        actions: {
            // Action handlers if needed (e.g., buttons)
        },
        form: {
            handler: "_onSubmitWizard",
            closeOnSubmit: false, // We handle closing manually after successful save
            submitOnChange: false
        }
    };

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/startup-wizard.hbs`
        }
    };

    /** @override */
    async _prepareContext(options) {
        // 1. Get Calendar System Options
        // 1. Get Calendar System Options (Key -> Label)
        const calendarSystems = Object.keys(CalendarSystem.SYSTEMS).reduce((acc, key) => {
            acc[key] = game.i18n.localize(CalendarSystem.SYSTEMS[key].label || CalendarSystem.SYSTEMS[key].name);
            return acc;
        }, {});
        
        // Helper: Get Description for current system
        const currentSystemConfig = CalendarSystem.SYSTEMS[this._wizardState.calendarSystem];
        const currentSystemDescription = currentSystemConfig ? currentSystemConfig.description : "";

        // 2. Get Climate Zones
        const climateZones = WeatherSystem.getClimateList();

        // 3. Prepare Date/Time Defaults from live world time + offsets
        // This keeps Wizard fields in sync with what the clock/calendar currently display.
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const adjustedWorldTime = game.time.worldTime + (offsetDays * 86400) + (offsetMinutes * 60);

        const liveCalendar = new CalendarSystem(this._wizardState.calendarSystem);
        const liveDate = liveCalendar.getDate(adjustedWorldTime);
        const secondsInDay = ((adjustedWorldTime % 86400) + 86400) % 86400;

        const currentYear = liveDate.year;
        const currentMonthIdx = liveDate.month; // 0-based index
        const currentDay = liveDate.day;
        const currentHour = Math.floor(secondsInDay / 3600);
        const currentMinute = Math.floor((secondsInDay % 3600) / 60);

        // 4. Get Month List for *Selected* System (from internal state)
        const sysConfig = CalendarSystem.SYSTEMS[this._wizardState.calendarSystem];
        // Map months to support Handlebars selectOptions
        // Value = Index (0..11), Label = Name
        const monthOptions = sysConfig ? sysConfig.months.map((m, i) => ({ value: i, label: m.name })) : [];

        // 5. Build Context
        return {
            calendarSystems, // Object { key: label }
            climateZones,    // Object { key: label }
            monthOptions,    // Array of objects { value, label }
            currentSystemDescription,

            // Current Values
            calendarSystem: this._wizardState.calendarSystem,
            syncPF2e: this._wizardState.syncPF2e,
            isGolarion: this._wizardState.calendarSystem === "golarion", // "golarion" matches the key in calendar-system.js? 
            // NOTE: In main.v2.js choices were: gregorian, golarion, harptos, magaambya.
            // Check calendar-system.js keys carefully. Assuming "golarion" is correct key based on main.v2.js.
            
            year: currentYear,
            month: currentMonthIdx,
            day: currentDay,
            hour: currentHour,
            minute: currentMinute,
            weekdayOffset: game.settings.get(MODULE_ID, "weekdayOffset") || 0,

            showRealNames: game.settings.get(MODULE_ID, "showRealNames"),
            climateZone: game.settings.get(MODULE_ID, "climateZone"),
            temperatureUnit: this._wizardState.tempUnit,
            
            playerAdvanceTime: game.settings.get(MODULE_ID, "playerAdvanceTime"),
            playerCreateEvents: game.settings.get(MODULE_ID, "playerCreateEvents"),
            
            isGM: game.user.isGM
        };
    }

    /** @override */
    _onRender(context, options) {
        // Listeners for dynamic updates (changing system changes month list)
        
        // System Select Change
        const sysSelect = this.element.querySelector("select[name='calendarSystem']");
        if (sysSelect) {
            sysSelect.addEventListener("change", (e) => {
                this._wizardState.calendarSystem = e.target.value;
                this.render(); // Re-render to update month list and calendar description
            });
        }

        // PF2e Sync Change
        const pf2eCheck = this.element.querySelector("input[name='syncPF2e']");
        if (pf2eCheck) {
            pf2eCheck.addEventListener("change", (e) => {
                const isChecked = e.target.checked;
                this._wizardState.syncPF2e = isChecked;
                
                if (isChecked) {
                    // Perform Sync Logic
                    // 1. Get World Time (seconds)
                    const worldTime = game.time.worldTime;
                    const GOLARION_OFFSET_DAYS = 1725595;
                    // Also get existing timeOffset (minutes) to match Widget's calculation
                    const timeOffsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
                    
                    const offsetSeconds = (GOLARION_OFFSET_DAYS * 86400) + (timeOffsetMinutes * 60);
                    
                    // 2. Convert to date in the currently selected calendar
                    // Apply the PF2e epoch offset, but keep the user's calendar system.
                    const tempSys = new CalendarSystem(this._wizardState.calendarSystem);
                    const dateData = tempSys.getDate(worldTime + offsetSeconds);
                    
                    // 3. Update Inputs
                    const dayInput = this.element.querySelector("input[name='day']");
                    const monthSelect = this.element.querySelector("select[name='month']");
                    const yearInput = this.element.querySelector("input[name='year']"); 
                    
                    // Time Calculation (Handle negative worldTime safely)
                    // We must use the SAME adjusted time as getDate for consistency
                    const totalAdjustedSeconds = worldTime + offsetSeconds;
                    const timeInDaySeconds = ((totalAdjustedSeconds % 86400) + 86400) % 86400;
                    const h = Math.floor(timeInDaySeconds / 3600);
                    const m = Math.floor((timeInDaySeconds % 3600) / 60);
                    
                    const hourInput = this.element.querySelector("input[name='hour']"); // WAS: timeHour
                    const minInput = this.element.querySelector("input[name='minute']"); // WAS: timeMin

                     if (dayInput) {
                         dayInput.value = dateData.day;
                         // Manually fire input event to trigger any bound listeners (if any)
                         dayInput.dispatchEvent(new Event('input', { bubbles: true }));
                     }
                     if (monthSelect) {
                         monthSelect.value = dateData.month; // 0-indexed
                         monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
                     }

                     if (yearInput) {
                         yearInput.value = dateData.year;
                         yearInput.dispatchEvent(new Event('input', { bubbles: true }));
                     }
                     
                     if (hourInput) { 
                        hourInput.value = h;
                        hourInput.dispatchEvent(new Event('input', { bubbles: true }));
                     }
                     if (minInput) {
                        minInput.value = m;
                        minInput.dispatchEvent(new Event('input', { bubbles: true }));
                     }
                     
                     // Update State to match visual (for fallback)
                     this._wizardState.yearOffset = dateData.year; // logic expects yearOffset property still? No, check onSubmit
                     // Actually, onSubmit extracts data from form, so as long as `year` input has correct value, it's fine.
                     // But we might need to update _wizardState too if we rely on it for something else.
                     // Let's assume form extraction is source of truth on submit.
                }
            });
        }

        // AUTO-SUBMIT FALLBACK: Manual Click Listener
        const saveBtn = this.element.querySelector(".save-button");
        if (saveBtn) {
            saveBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const formData = new FormData(this.element);
                this._onSubmitWizard(e, this.element, formData);
            });
        }
    }

    /**
     * Handle Form Submission
     */
    async _onSubmitWizard(event, form, formData) {
        event.preventDefault();
        
        try {
            // 1. Extract Data safely using FormDataExtended pattern via Object.fromEntries first
            // Note: ApplicationV2's formData is a FormData object.
            const data = {};
            
            // Extract all entries including checkboxes (which might be missing if unchecked)
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }

            // 2. Normalize Data Types
            const system = data.calendarSystem;
            const year = Number(data.year);
            const month = Number(data.month);
            const day = Number(data.day);
            const hour = Number(data.hour);
            const minute = Number(data.minute);

            // Boolean Checkboxes: FormData.get returns 'on' or the value if checked, null if not.
            // But we used formData.entries() above.
            // We need to explicitly check known booleans.
            const getBool = (key) => formData.get(key) !== null;

            const wantsPF2eSync = getBool("syncPF2e");
            const showRealNames = getBool("showRealNames");
            const playerAdvanceTime = getBool("playerAdvanceTime");
            const playerCreateEvents = getBool("playerCreateEvents");
            
            const climateZone = data.climateZone;
            const temperatureUnit = data.temperatureUnit;

            // 3. Logic: Calculate Total Minutes (Settings Save Only)
            const minutesOfDay = (hour * 60) + minute;

            // 4. Logic: Calculate Offsets for Actual Calendar
            // The calendar system relies on dayOffset/timeOffset to shift game.time.worldTime
            // We must calculate the difference between the Desired Date and the Current World Time
            
            // A. Get Target Timestamp (in Seconds)
            const tempSys = new CalendarSystem(system);
            // getTimestamp returns start of the day (00:00) in seconds from Year 0
            const targetDayStart = tempSys.getTimestamp(year, month, day); 
            const targetTotalSeconds = targetDayStart + (hour * 3600) + (minute * 60);

            // B. Get Current World Time
            const currentWorldTime = game.time.worldTime;

            // C. Calculate Difference
            const diffSeconds = targetTotalSeconds - currentWorldTime;

            // D. Split into Day Offset (Days) and Time Offset (Minutes)
            // We use floor for days to keep days intact, remainder for minutes
            const offsetDays = Math.floor(diffSeconds / 86400);
            const remainderSeconds = diffSeconds % 86400;
            const offsetMinutes = Math.round(remainderSeconds / 60);

            // 5. Save Settings (Await all)
            console.log("PDNC | Wizard: Saving Configuration...");
            console.log(`PDNC | Wizard: Target Date: ${year}-${month}-${day} ${hour}:${minute}`);
            console.log(`PDNC | Wizard: Calculated Offsets -> Days: ${offsetDays}, Minutes: ${offsetMinutes}`);
            
            await game.settings.set(MODULE_ID, "calendarSystem", system);
            
            // Save Input Values (as display cache)
            await game.settings.set(MODULE_ID, "year", year);
            await game.settings.set(MODULE_ID, "month", month);
            await game.settings.set(MODULE_ID, "day", day);
            await game.settings.set(MODULE_ID, "time", minutesOfDay);

            await game.settings.set(MODULE_ID, "showRealNames", showRealNames);
            await game.settings.set(MODULE_ID, "climateZone", climateZone);
            await game.settings.set(MODULE_ID, "temperatureUnit", temperatureUnit);
            
            await game.settings.set(MODULE_ID, "playerAdvanceTime", playerAdvanceTime);
            await game.settings.set(MODULE_ID, "playerCreateEvents", playerCreateEvents);

            // Persist offsets first. syncPF2e is derived from the final offset state.
            await game.settings.set(MODULE_ID, "dayOffset", offsetDays);
            await game.settings.set(MODULE_ID, "timeOffset", offsetMinutes);

            const shouldPersistPF2eSync = wantsPF2eSync && (offsetDays === 1725595);
            await game.settings.set(MODULE_ID, "syncPF2e", shouldPersistPF2eSync);

            // Save Weekday Offset
            const weekdayOffset = Number(data.weekdayOffset) || 0;
            await game.settings.set(MODULE_ID, "weekdayOffset", weekdayOffset);

            // 5. Mark Complete
            await game.settings.set(MODULE_ID, "wizardCompleted", true);

            ui.notifications.info("PDNC.Wizard.Saved", { localize: true });

            // 6. Close Window BEFORE Refreshing Module
            // This prevents the HUD from trying to update while this modal is potentially interfering
            await this.close();

            // 7. Trigger Logic Refresh
            // Use a slight delay to allow the close animation/promise to settle
            setTimeout(() => {
                this._refreshModule();
            }, 100);

        } catch (err) {
            console.error("PDNC | Wizard Save Error:", err);
            ui.notifications.error(`Wizard Error: ${err.message}`);
        }
    }

    _refreshModule() {
        if (window.PhilsDayNightCycle) {
            // Re-initialize logic
            // 1. Refresh Calendar System (constructor reads new settings)
            window.PhilsDayNightCycle.calendar = new CalendarSystem();
            
            // 2. Validate Climate/Weather settings
            WeatherSystem.validateSettings(); // Ensure valid climate
            
            // 3. Refresh UI
            window.PhilsDayNightCycle.refresh(); // Refreshes Calendar App
            window.PhilsDayNightCycle.createUI(); // Ensures HUD exists
            
            // Ensure UI is visible
            if (!game.settings.get(MODULE_ID, "visible")) {
                 game.settings.set(MODULE_ID, "visible", true);
            }
            
            window.PhilsDayNightCycle.updateClock(); // Update hands/time
            
            // 4. Force Weather Refresh (regen)
            WeatherSystem.refreshWeather();
            
        } else {
            ui.notifications.warn("PDNC | Module instance not found. Please reload.");
        }
    }
}


