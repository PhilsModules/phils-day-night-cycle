const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { CalendarSystem } from "../calendar-system.js";
import { WeatherSystem } from "../weather-system.js";
import { PF2eSyncDialog } from "./pf2e-sync-dialog.js";

const MODULE_ID = "phils-day-night-cycle";

export class StartupWizard extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        
        const initialCal = (game.system.id === "pf2e") ? "golarion" : (game.settings.get(MODULE_ID, "calendarSystem") || "gregorian");
        
        this._wizardState = {
            calendarSystem: initialCal,
            tempUnit: game.settings.get(MODULE_ID, "temperatureUnit") || "C",
            syncPF2e: game.settings.get(MODULE_ID, "syncPF2e") || false
        };
    }

    static DEFAULT_OPTIONS = {
        id: "phils-startup-wizard",
        tag: "form",
        window: {
            title: "PDNC.Wizard.Title",
            icon: "fas fa-magic",
            resizable: true,
            controls: []
        },
        position: {
            width: 580,
            height: "auto"
        },
        classes: ["pdnc-app-v2", "pdnc-wizard-window"],
        actions: {
            openSyncDialog: StartupWizard._onOpenSyncDialog
        },
        form: {
            handler: "_onSubmitWizard",
            closeOnSubmit: false,
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
        const calendarSystems = Object.keys(CalendarSystem.SYSTEMS).reduce((acc, key) => {
            acc[key] = game.i18n.localize(CalendarSystem.SYSTEMS[key].label || CalendarSystem.SYSTEMS[key].name);
            return acc;
        }, {});
        
        const currentSystemConfig = CalendarSystem.SYSTEMS[this._wizardState.calendarSystem];
        const currentSystemDescription = currentSystemConfig ? currentSystemConfig.description : "";
        const climateZones = WeatherSystem.getClimateList();

        // Get PDNC's current date/time
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const adjustedWorldTime = game.time.worldTime + (offsetDays * 86400) + (offsetMinutes * 60);

        const liveCalendar = new CalendarSystem(this._wizardState.calendarSystem);
        const liveDate = liveCalendar.getDate(adjustedWorldTime);
        const secondsInDay = ((adjustedWorldTime % 86400) + 86400) % 86400;

        const sysConfig = CalendarSystem.SYSTEMS[this._wizardState.calendarSystem];
        const monthOptions = sysConfig ? sysConfig.months.map((m, i) => ({ value: i, label: m.name })) : [];

        return {
            calendarSystems,
            climateZones,
            monthOptions,
            currentSystemDescription,

            calendarSystem: this._wizardState.calendarSystem,
            syncPF2e: this._wizardState.syncPF2e,
            isGolarion: this._wizardState.calendarSystem === "golarion",
            hasPF2e: game.system.id === "pf2e",
            
            year: liveDate.year,
            month: liveDate.month,
            day: liveDate.day,
            hour: Math.floor(secondsInDay / 3600),
            minute: Math.floor((secondsInDay % 3600) / 60),
            weekdayOffset: game.settings.get(MODULE_ID, "weekdayOffset") || 0,

            showRealNames: game.settings.get(MODULE_ID, "showRealNames"),
            climateZone: game.settings.get(MODULE_ID, "climateZone"),
            temperatureUnit: this._wizardState.tempUnit,
            
            playerAdvanceTime: game.settings.get(MODULE_ID, "playerAdvanceTime"),
            playerCreateEvents: game.settings.get(MODULE_ID, "playerCreateEvents"),
            
            isGM: game.user.isGM
        };
    }

    static async _onOpenSyncDialog(event, target) {
        event?.preventDefault?.();

        if (this.element) {
            try {
                const formData = new FormData(this.element);
                const system = formData.get("calendarSystem") || this._wizardState?.calendarSystem || "golarion";
                const year = Number(formData.get("year"));
                const month = Number(formData.get("month"));
                const day = Number(formData.get("day"));
                const hour = Number(formData.get("hour"));
                const minute = Number(formData.get("minute"));
                const weekdayOffset = Number(formData.get("weekdayOffset")) || 0;

                const getBool = (key) => formData.get(key) !== null;
                const showRealNames = getBool("showRealNames");
                const climateZone = formData.get("climateZone");
                const temperatureUnit = formData.get("temperatureUnit");

                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    await game.settings.set(MODULE_ID, "calendarSystem", system);
                    await game.settings.set(MODULE_ID, "weekdayOffset", weekdayOffset);
                    if (showRealNames !== undefined) await game.settings.set(MODULE_ID, "showRealNames", showRealNames);
                    if (climateZone) await game.settings.set(MODULE_ID, "climateZone", climateZone);
                    if (temperatureUnit) await game.settings.set(MODULE_ID, "temperatureUnit", temperatureUnit);

                    await CalendarSystem.pushPDNCDateToSystem(
                        system,
                        year,
                        month,
                        day,
                        isNaN(hour) ? 0 : hour,
                        isNaN(minute) ? 0 : minute
                    );
                }
            } catch (err) {
                console.warn("PDNC | Could not apply wizard inputs before sync:", err);
            }
        }

        new PF2eSyncDialog().render({ force: true });
    }

    /** @override */
    _onRender(context, options) {
        const sysSelect = this.element.querySelector("select[name='calendarSystem']");
        if (sysSelect) {
            sysSelect.addEventListener("change", (e) => {
                this._wizardState.calendarSystem = e.target.value;
                this.render();
            });
        }

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
            const data = {};
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }

            const system = data.calendarSystem;
            const year = Number(data.year);
            const month = Number(data.month);
            const day = Number(data.day);
            const hour = Number(data.hour);
            const minute = Number(data.minute);

            const getBool = (key) => formData.get(key) !== null;
            const showRealNames = getBool("showRealNames");
            const playerAdvanceTime = getBool("playerAdvanceTime");
            const playerCreateEvents = getBool("playerCreateEvents");
            
            const climateZone = data.climateZone;
            const temperatureUnit = data.temperatureUnit;

            console.log("PDNC | Wizard: Saving Master Date & Adjusting System / PF2e Clock...");
            console.log(`PDNC Master Date: ${year}-${month + 1}-${day} ${hour}:${minute} (${system})`);

            // Save General Settings
            await game.settings.set(MODULE_ID, "calendarSystem", system);
            await game.settings.set(MODULE_ID, "showRealNames", showRealNames);
            await game.settings.set(MODULE_ID, "climateZone", climateZone);
            await game.settings.set(MODULE_ID, "temperatureUnit", temperatureUnit);
            await game.settings.set(MODULE_ID, "playerAdvanceTime", playerAdvanceTime);
            await game.settings.set(MODULE_ID, "playerCreateEvents", playerCreateEvents);

            const weekdayOffset = Number(data.weekdayOffset) || 0;
            await game.settings.set(MODULE_ID, "weekdayOffset", weekdayOffset);

            // Push PDNC master date to Foundry's worldTime (works for ALL game systems)
            // This calls game.time.advance() which every system listens to.
            await CalendarSystem.pushPDNCDateToSystem(system, year, month, day, hour, minute);

            await game.settings.set(MODULE_ID, "wizardCompleted", true);
            ui.notifications.info("PDNC.Wizard.Saved", { localize: true });

            await this.close();

            setTimeout(() => {
                this._refreshModule();
                if (window.dayNightCycle) {
                    window.dayNightCycle.updateClock();
                    window.dayNightCycle.refreshCalendar();
                }
            }, 100);



        } catch (err) {
            console.error("PDNC | Wizard Save Error:", err);
            ui.notifications.error(`Wizard Error: ${err.message}`);
        }
    }

    _refreshModule() {
        if (window.PhilsDayNightCycle) {
            window.PhilsDayNightCycle.calendar = new CalendarSystem();
            WeatherSystem.validateSettings();
            window.PhilsDayNightCycle.refresh();
            window.PhilsDayNightCycle.createUI();
            
            if (!game.settings.get(MODULE_ID, "visible")) {
                 game.settings.set(MODULE_ID, "visible", true);
            }
            
            window.PhilsDayNightCycle.updateClock();
            WeatherSystem.refreshWeather();
        } else {
            ui.notifications.warn("PDNC | Module instance not found. Please reload.");
        }
    }
}
