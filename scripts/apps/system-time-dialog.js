const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { CalendarSystem } from "../calendar-system.js";

const MODULE_ID = "phils-day-night-cycle";

export class SystemTimeDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
    }

    static DEFAULT_OPTIONS = {
        id: "pdnc-system-time-dialog",
        tag: "form",
        window: {
            title: "PDNC.TimeDialog.Title",
            icon: "fas fa-clock-rotate-left",
            resizable: true,
            controls: []
        },
        position: {
            width: 540,
            height: "auto"
        },
        classes: ["pdnc-app-v2", "pdnc-time-dialog-window"],
        actions: {
            applyTime: SystemTimeDialog._onApplyTime,
            syncPF2e: SystemTimeDialog._onSyncPF2e,
            adjustStep: SystemTimeDialog._onAdjustStep
        },
        form: {
            handler: SystemTimeDialog._onFormSubmit,
            closeOnSubmit: false,
            submitOnChange: false
        }
    };

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/system-time-dialog.hbs`
        }
    };

    /** @override */
    async _prepareContext(options) {
        const activeSysKey = game.settings.get(MODULE_ID, "calendarSystem") || "golarion";
        const sys = window.PhilsDayNightCycle?.calendar ?? new CalendarSystem(activeSysKey);

        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const totalTime = game.time.worldTime + (offsetDays * 86400) + (offsetMinutes * 60);

        const pdncDate = sys.getDate(totalTime);

        let systemDateString = "Foundry WorldTime: " + game.time.worldTime + "s";
        if (game.system.id === "pf2e" && game.pf2e?.worldClock?.date) {
            try {
                const dt = game.pf2e.worldClock.date;
                if (dt) systemDateString = `${dt.day}. ${dt.monthLong || dt.month} ${dt.year} (${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')})`;
            } catch (e) {}
        }

        const months = sys.config.months.map((m, idx) => ({
            name: CalendarSystem.stripMarkup(m.name),
            selected: idx === pdncDate.month
        }));

        return {
            year: pdncDate.year,
            month: pdncDate.month,
            day: pdncDate.day,
            hour: pdncDate.hour ?? 0,
            minute: pdncDate.minute ?? 0,
            months: months,
            pdncDateString: `${pdncDate.weekday}, ${pdncDate.day}. ${pdncDate.monthName} ${pdncDate.year}`,
            systemDateString: systemDateString,
            isPF2e: game.system.id === "pf2e"
        };
    }

    static async _onFormSubmit(event, form, formData) {
        event.preventDefault();
        return SystemTimeDialog._onApplyTime.call(this, event, form);
    }

    static async _onApplyTime(event, target) {
        event.preventDefault();
        const element = this.element;
        if (!element) return;

        const year = Number(element.querySelector("[name='year']")?.value ?? 4720);
        const month = Number(element.querySelector("[name='month']")?.value ?? 6);
        const day = Number(element.querySelector("[name='day']")?.value ?? 8);
        const hour = Number(element.querySelector("[name='hour']")?.value ?? 20);
        const minute = Number(element.querySelector("[name='minute']")?.value ?? 0);

        const activeSys = game.settings.get(MODULE_ID, "calendarSystem") || "golarion";

        try {
            await CalendarSystem.syncWorldTimeToDateTime(activeSys, year, month, day, hour, minute);
            await CalendarSystem.syncPF2eClockToPDNC();

            const sys = new CalendarSystem(activeSys);
            const monthName = sys.config.months[month]?.name ? CalendarSystem.stripMarkup(sys.config.months[month].name) : "";

            ui.notifications.info(`PDNC | Master-Zeit erfolgreich angepasst auf: ${day}. ${monthName} ${year}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} Uhr!`);

            foundry.applications.instances.get("phils-calendar-app")?.render();
            foundry.applications.instances.get("weather-hud")?.render();

            this.render(true);
        } catch (err) {
            console.error("PDNC | Error applying time adjustment:", err);
            ui.notifications.error("PDNC | Fehler beim Ausrichten der Zeit: " + err.message);
        }
    }

    static async _onSyncPF2e(event, target) {
        event.preventDefault();
        try {
            await CalendarSystem.syncPF2eClockToPDNC();
            ui.notifications.info("PDNC | Pathfinder 2e Weltuhr erfolgreich mit PDNC synchronisiert!");
            this.render(true);
        } catch (e) {
            ui.notifications.error("PDNC | Fehler bei PF2e Synchronisation: " + e.message);
        }
    }

    static async _onAdjustStep(event, target) {
        event.preventDefault();
        const stepSeconds = Number(target.dataset.step || 0);
        if (!stepSeconds) return;

        try {
            if (game.user.isGM) {
                await game.time.advance(stepSeconds);
                await CalendarSystem.syncPF2eClockToPDNC();
                
                foundry.applications.instances.get("phils-calendar-app")?.render();
                foundry.applications.instances.get("weather-hud")?.render();
                
                this.render(true);
            }
        } catch (e) {
            console.error("PDNC | Error adjusting time step:", e);
        }
    }
}
