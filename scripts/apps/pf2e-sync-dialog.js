const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { CalendarSystem } from "../calendar-system.js";

const MODULE_ID = "phils-day-night-cycle";

// ── Helpers ───────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, "0");

/**
 * Converts a UTC ISO string + offset seconds into a plain date-parts object.
 * Uses only native JS Date — no Luxon dependency.
 */
function isoToDateParts(isoString, plusSeconds = 0) {
    const ms = Date.parse(isoString);
    if (isNaN(ms)) return null;
    const d = new Date(ms + plusSeconds * 1000);
    return {
        year:      d.getUTCFullYear(),
        month:     d.getUTCMonth() + 1,   // 1-indexed
        day:       d.getUTCDate(),
        hour:      d.getUTCHours(),
        minute:    d.getUTCMinutes(),
        second:    d.getUTCSeconds(),
        jsWeekday: d.getUTCDay()           // 0=Sunday, 1=Monday … 6=Saturday
    };
}

/**
 * PF2e maps real ISO weekdays directly onto Golarion names:
 *   Monday=Moonday, Tuesday=Toilday, Wednesday=Wealday,
 *   Thursday=Oathday, Friday=Fireday, Saturday=Starday, Sunday=Sunday
 *
 * Returns { name, index } where index is 0-based in the Golarion week array.
 */
const GOLARION_WEEKDAYS = ["Moonday","Toilday","Wealday","Oathday","Fireday","Starday","Sunday"];
// JS getUTCDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat → Golarion index
const JS_DAY_TO_GOLARION = [6, 0, 1, 2, 3, 4, 5];

function pf2eWeekdayFromJsDay(jsDay) {
    const idx  = JS_DAY_TO_GOLARION[jsDay];
    return { name: GOLARION_WEEKDAYS[idx], index: idx };
}

/**
 * PF2e Sync Dialog
 *
 * Shows a side-by-side comparison of what PF2e's World Clock currently shows
 * vs. what PDNC has as master date/time/weekday, then offers:
 *  - One-click clock sync  (adjusts worldCreatedOn only, never worldTime)
 *  - One-click weekday fix (adjusts weekdayOffset so PDNC weekday matches PF2e)
 */
export class PF2eSyncDialog extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "pdnc-pf2e-sync-dialog",
        tag: "div",
        window: {
            title: "PDNC.SyncDialog.WindowTitle",
            icon: "fas fa-clock-rotate-left",
            resizable: false,
            controls: []
        },
        position: {
            width: 560,
            height: "auto"
        },
        classes: ["pdnc-app-v2", "pdnc-sync-dialog-window"],
        actions: {
            doSync:        PF2eSyncDialog.prototype._onDoSync,
            fixWeekday:    PF2eSyncDialog.prototype._onFixWeekday,
            refreshDialog: PF2eSyncDialog.prototype._onRefresh
        }
    };

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/pf2e-sync-dialog.hbs`
        }
    };

    /** @override */
    async _prepareContext(options) {
        // ── PDNC master date ──────────────────────────────────────────────
        const activeSysKey = game.settings.get(MODULE_ID, "calendarSystem") || "golarion";
        const sys = window.PhilsDayNightCycle?.calendar ?? window.dayNightCycle?.calendar ?? new CalendarSystem(activeSysKey);

        const offsetDays    = game.settings.get(MODULE_ID, "dayOffset")    || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset")   || 0;
        const totalTime     = game.time.worldTime + (offsetDays * 86400) + (offsetMinutes * 60);
        const pdncDate      = sys.getDate(totalTime);

        const pdncDateStr    = `${pdncDate.day}. ${pdncDate.monthName} ${pdncDate.year}`;
        const pdncTimeStr    = `${pad(pdncDate.hour)}:${pad(pdncDate.minute)}:${pad(pdncDate.second)} Uhr`;
        const pdncWeekday    = pdncDate.weekday;           // string
        const pdncWdIdx      = pdncDate.weekdayIndex;      // 0-based

        // ── PF2e current date + weekday (native JS Date, no Luxon) ────────
        let pf2eDateStr   = "—";
        let pf2eTimeStr   = "—";
        let pf2eWeekday   = "—";
        let pf2eWdIdx     = -1;

        try {
            const createdOnISO = PF2eSyncDialog._readCreatedOnISO();
            if (createdOnISO) {
                const parts = isoToDateParts(createdOnISO, game.time.worldTime);
                if (parts) {
                    const arYear    = parts.year + 2700;
                    const months    = ["Abadius","Calistril","Pharast","Gozran","Desnus","Sarenith",
                                       "Erastus","Arodus","Rova","Lamashan","Neth","Kuthona"];
                    const monthName = months[parts.month - 1] ?? parts.month;
                    pf2eDateStr     = `${parts.day}. ${monthName} ${arYear}`;
                    pf2eTimeStr     = `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)} Uhr`;

                    // PF2e weekday = real ISO weekday mapped to Golarion names
                    const wd   = pf2eWeekdayFromJsDay(parts.jsWeekday);
                    pf2eWeekday = wd.name;
                    pf2eWdIdx   = wd.index;
                }
            }
        } catch(e) {
            console.warn("PDNC | Could not read PF2e worldClock setting:", e);
        }

        const datesMatch    = pf2eDateStr !== "—" && pf2eDateStr.includes(String(pdncDate.year));
        const timesMatch    = pf2eTimeStr === pdncTimeStr;
        const weekdaysMatch = pf2eWdIdx !== -1 && pf2eWdIdx === pdncWdIdx;

        // How many days offset PDNC is behind/ahead of PF2e
        const weekdayDelta  = pf2eWdIdx !== -1
            ? ((pf2eWdIdx - pdncWdIdx + 7) % 7)
            : 0;

        return {
            pf2eDate:      pf2eDateStr,
            pf2eTime:      pf2eTimeStr,
            pf2eWeekday,
            pdncDate:      pdncDateStr,
            pdncTime:      pdncTimeStr,
            pdncWeekday,
            worldTime:     game.time.worldTime,
            weekdayDelta,
            datesMatch,
            timesMatch,
            weekdaysMatch,
            allMatch:      datesMatch && timesMatch && weekdaysMatch
        };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    static _readCreatedOnISO() {
        try { return game.settings.get("pf2e", "worldClock.worldCreatedOn"); } catch(_) {}
        try { return game.settings.get("pf2e", "worldClock")?.worldCreatedOn; } catch(_) {}
        return null;
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    /**
     * Core sync: adjusts ONLY worldCreatedOn so that:
     *   worldCreatedOn + game.time.worldTime = PDNC master date
     * worldTime is NEVER touched → all event/effect durations remain intact.
     */
    async _onDoSync(event, _target) {
        event.preventDefault();
        if (!game.user.isGM) {
            ui.notifications.warn("PDNC | Nur der GM kann die Systemzeit synchronisieren.");
            return;
        }

        try {
            const activeSysKey = game.settings.get(MODULE_ID, "calendarSystem") || "golarion";
            const sys = window.PhilsDayNightCycle?.calendar ?? window.dayNightCycle?.calendar ?? new CalendarSystem(activeSysKey);

            const offsetDays    = game.settings.get(MODULE_ID, "dayOffset")    || 0;
            const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset")   || 0;
            const totalTime     = game.time.worldTime + (offsetDays * 86400) + (offsetMinutes * 60);
            const pdncDate      = sys.getDate(totalTime);

            // PF2e stores dates in real ISO years (AR year − 2700)
            const isoYear = pdncDate.year > 2700 ? pdncDate.year - 2700 : pdncDate.year;

            // Target moment as UTC epoch ms (native JS, no Luxon)
            const targetMs = Date.UTC(
                isoYear,
                pdncDate.month,     // getDate() returns 0-indexed month already
                pdncDate.day,
                pdncDate.hour,
                pdncDate.minute,
                pdncDate.second
            );
            const targetSeconds    = Math.floor(targetMs / 1000);
            const createdOnSeconds = targetSeconds - game.time.worldTime;
            const newCreatedOn     = new Date(createdOnSeconds * 1000).toISOString();

            console.log(`PDNC | Sync: target=${new Date(targetMs).toISOString()} worldTime=${game.time.worldTime} newCreatedOn=${newCreatedOn}`);

            let written = false;

            // Attempt 1: object-style setting  pf2e → "worldClock"
            try {
                const clock = game.settings.get("pf2e", "worldClock");
                if (clock && typeof clock === "object") {
                    await game.settings.set("pf2e", "worldClock", {
                        ...clock,
                        worldCreatedOn: newCreatedOn,
                        dateTheme: "AR"
                    });
                    written = true;
                }
            } catch(_) {}

            // Attempt 2: flat-key style
            if (!written) {
                try {
                    await game.settings.set("pf2e", "worldClock.worldCreatedOn", newCreatedOn);
                    written = true;
                } catch(_) {}
            }

            try { await game.settings.set("pf2e", "worldClock.dateTheme", "AR"); } catch(_) {}

            if (!written) {
                ui.notifications.error("PDNC | PF2e worldClock konnte nicht geschrieben werden.");
                return;
            }

            PF2eSyncDialog._refreshPF2eClock();
            ui.notifications.info(
                `PDNC ✓ | PF2e Weltuhr synchronisiert → ${pdncDate.day}. ${pdncDate.monthName} ${pdncDate.year} (${pad(pdncDate.hour)}:${pad(pdncDate.minute)})`
            );
            const wizard1 = foundry.applications.instances.get("phils-startup-wizard");
            if (wizard1) wizard1.render({ force: true });
            this.render(true);

        } catch (err) {
            console.error("PDNC | PF2e Sync Fehler:", err);
            ui.notifications.error("PDNC | Sync-Fehler: " + err.message);
        }
    }

    /**
     * Fix weekday: adjusts PDNC's weekdayOffset so its weekday matches PF2e.
     * Never touches worldTime or worldCreatedOn.
     */
    async _onFixWeekday(event, _target) {
        event.preventDefault();
        if (!game.user.isGM) return;

        try {
            // Re-compute live values
            const activeSysKey = game.settings.get(MODULE_ID, "calendarSystem") || "golarion";
            const sys = window.PhilsDayNightCycle?.calendar ?? window.dayNightCycle?.calendar ?? new CalendarSystem(activeSysKey);

            const offsetDays    = game.settings.get(MODULE_ID, "dayOffset")    || 0;
            const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset")   || 0;
            const totalTime     = game.time.worldTime + (offsetDays * 86400) + (offsetMinutes * 60);
            const pdncDate      = sys.getDate(totalTime);
            const pdncWdIdx     = pdncDate.weekdayIndex;

            const createdOnISO  = PF2eSyncDialog._readCreatedOnISO();
            if (!createdOnISO) {
                ui.notifications.warn("PDNC | Kein PF2e worldCreatedOn gefunden.");
                return;
            }

            const parts      = isoToDateParts(createdOnISO, game.time.worldTime);
            if (!parts) return;

            const pf2eWdIdx  = JS_DAY_TO_GOLARION[parts.jsWeekday];
            const numWeekdays = sys.config.weekdays.length || 7;

            // delta = how many days we need to shift PDNC forward to match PF2e
            const delta = ((pf2eWdIdx - pdncWdIdx) + numWeekdays) % numWeekdays;

            const currentOffset = game.settings.get(MODULE_ID, "weekdayOffset") || 0;
            const newOffset     = currentOffset + delta;

            await game.settings.set(MODULE_ID, "weekdayOffset", newOffset);
            console.log(`PDNC | Weekday fix: pf2eIdx=${pf2eWdIdx} pdncIdx=${pdncWdIdx} delta=${delta} newOffset=${newOffset}`);

            // Refresh PDNC UI
            if (window.dayNightCycle) {
                window.dayNightCycle.updateClock?.();
                window.dayNightCycle.refreshCalendar?.();
            }

            ui.notifications.info(`PDNC ✓ | Wochentag korrigiert: weekdayOffset ist jetzt ${newOffset}`);
            const wizard2 = foundry.applications.instances.get("phils-startup-wizard");
            if (wizard2) wizard2.render({ force: true });
            this.render(true);

        } catch (err) {
            console.error("PDNC | Weekday Fix Fehler:", err);
            ui.notifications.error("PDNC | Weekday-Fehler: " + err.message);
        }
    }

    async _onRefresh(event, _target) {
        event.preventDefault();
        this.render(true);
    }

    static _refreshPF2eClock() {
        if (game.pf2e?.worldClock?.rendered) game.pf2e.worldClock.render(true);
        Object.values(ui.windows ?? {}).forEach(w => {
            if (w?.rendered && (w?.constructor?.name === "WorldClock" || w?.id === "world-clock")) w.render(true);
        });
    }
}
