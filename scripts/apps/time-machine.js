import { CalendarSystem } from "../calendar-system.js";

const MODULE_ID = "phils-day-night-cycle";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class TimeMachineApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static get DEFAULT_OPTIONS() {
        return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            tag: "form",
            id: "phils-time-machine",
            window: {
                title: "PDNC.TimeMachineTitle",
                icon: "fas fa-hourglass-start",
                resizable: false
            },
            position: {
                width: 400,
                height: "auto"
            },
            classes: ["pdnc-app-v2", "pdnc-time-machine-window", "pdnc-event-editor-window", "pdnc-nav-window"],
            actions: {
                save: TimeMachineApp.prototype._onSave,
                nextSun: TimeMachineApp.prototype._onNextSun
            }
        });
    }

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/time-machine.html`
        }
    };

    get title() {
        return game.i18n.localize("PDNC.TimeMachineTitle");
    }

    /** @override */
    async _prepareContext(options) {
        const calendar = window.PhilsDayNightCycle?.calendar ?? window.dayNightCycle?.calendar ?? new CalendarSystem();
        const config = calendar.config;

        let worldTime = game.time.worldTime;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        worldTime += (offsetDays * 86400) + (offsetMinutes * 60);

        const dateData = calendar.getDate(worldTime);

        return {
            config: config,
            currentYear: dateData.year,
            currentMonth: dateData.month,
            currentDay: dateData.day,
            months: config.months.map((m, i) => {
                const plainName = CalendarSystem.stripMarkup ? CalendarSystem.stripMarkup(m.name) : String(m.name).replace(/<[^>]*>/g, "").trim();

                return {
                    value: i,
                    label: plainName,
                    selected: i === dateData.month
                };
            })
        };
    }

    /**
     * Handle save action
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    async _onSave(event, target) {
        event.preventDefault();
        event.stopPropagation();

        const form = this.element;

        const d = Number(form.querySelector('#pdnc-nav-day').value);
        const m = Number(form.querySelector('#pdnc-nav-month').value);
        const y = Number(form.querySelector('#pdnc-nav-year').value);

        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const adjustedTime = game.time.worldTime + (offsetDays * 86400) + (offsetMinutes * 60);
        const timeOfDay = ((adjustedTime % 86400) + 86400) % 86400;
        const h = Math.floor(timeOfDay / 3600);
        const min = Math.floor((timeOfDay % 3600) / 60);

        const system = game.settings.get(MODULE_ID, "calendarSystem") || "gregorian";

        await CalendarSystem.pushPDNCDateToSystem(system, y, m, d, h, min);

        const app = foundry.applications.instances.get("phils-calendar-app");
        if (app) {
            app.viewYear = y;
            app.viewMonth = m;
            app.render();
        }
        this.close();
    }

    async _onNextSun(event, target) {
        event.preventDefault();
        event.stopPropagation();

        const activeApp = window.PhilsDayNightCycle ?? window.dayNightCycle;
        if (!activeApp) return;

        const currentWorldTime = game.time.worldTime;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const totalTime = currentWorldTime + (offsetDays * 86400) + (offsetMinutes * 60);

        const calendar = activeApp.calendar ?? new CalendarSystem();
        const dateData = calendar.getDate(totalTime);
        const hours = dateData.hours ?? dateData.hour ?? 0;
        const minutes = dateData.minutes ?? dateData.minute ?? 0;
        const minutesOfDay = (hours * 60) + minutes;

        const season = activeApp.weather?.currentSeason || "spring";
        const zone = game.settings.get(MODULE_ID, "climateZone") || "marine_west_coast";
        let dawnMinutes = 360; 
        let duskMinutes = 1080; 

        if (activeApp.lighting) {
             const lightingParams = activeApp.lighting.getLightingForSeasonAndZone(season, zone);
             if (lightingParams) {
                 if (lightingParams.dawn) dawnMinutes = activeApp.lighting.constructor.parseTime(lightingParams.dawn) || dawnMinutes;
                 if (lightingParams.dusk) duskMinutes = activeApp.lighting.constructor.parseTime(lightingParams.dusk) || duskMinutes;
             }
        }

        let targetMinutesOfDay = 0;
        let daysToAdd = 0;

        if (minutesOfDay < dawnMinutes) {
            targetMinutesOfDay = dawnMinutes;
        } else if (minutesOfDay < duskMinutes) {
            targetMinutesOfDay = duskMinutes;
        } else {
            targetMinutesOfDay = dawnMinutes;
            daysToAdd = 1;
        }

        let diffMinutes = targetMinutesOfDay - minutesOfDay;
        if (daysToAdd > 0) {
            const hoursPerDay = calendar.config?.hours_per_day || 24;
            diffMinutes += hoursPerDay * 60;
        }

        const advanceSeconds = diffMinutes * 60;
        await game.time.advance(advanceSeconds);
        this.close();
    }
}
