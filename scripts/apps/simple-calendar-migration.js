import { CalendarSystem } from "../calendar-system.js";
import { CalendarDB } from "../calendar-db.js";

const MODULE_ID = "phils-day-night-cycle";
const SIMPLE_CALENDAR_ID = "foundryvtt-simple-calendar";
const FoundryApplicationsApi = globalThis.foundry?.applications?.api || {
    ApplicationV2: class {},
    HandlebarsApplicationMixin: (Base) => class extends Base {}
};
const { ApplicationV2, HandlebarsApplicationMixin } = FoundryApplicationsApi;

export function slugifyName(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function stripHtml(html) {
    if (!html) return "";
    if (typeof document !== "undefined") {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        return (wrapper.textContent || wrapper.innerText || "").trim();
    }
    return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function mapSimpleCalendarRepeat(repeatValue) {
    switch (Number(repeatValue)) {
        case 1: return "weekly";
        case 2: return "monthly";
        case 3: return "yearly";
        default: return "none";
    }
}

export function isSimpleCalendarTimeCompatible(timeConfig = {}) {
    return Number(timeConfig.hoursInDay ?? 24) === 24
        && Number(timeConfig.minutesInHour ?? 60) === 60
        && Number(timeConfig.secondsInMinute ?? 60) === 60;
}

export function normalizeSimpleCalendarCurrentDate(currentDate, timeConfig = {}) {
    if (!currentDate) return null;

    const minutesInHour = Number(timeConfig.minutesInHour ?? 60);
    const secondsInMinute = Number(timeConfig.secondsInMinute ?? 60);
    const secondsOfDay = Number(currentDate.seconds ?? 0);

    let hour = Number(currentDate.hour);
    let minute = Number(currentDate.minute);
    let second = Number(currentDate.second ?? currentDate.secondsValue ?? 0);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        hour = Math.floor(secondsOfDay / (minutesInHour * secondsInMinute));
        minute = Math.floor((secondsOfDay % (minutesInHour * secondsInMinute)) / secondsInMinute);
        second = secondsOfDay % secondsInMinute;
    }

    return {
        year: Number(currentDate.year ?? 0),
        month: Number(currentDate.month ?? 0),
        day: Number(currentDate.day ?? 0),
        hour,
        minute,
        second
    };
}

export function convertSimpleCalendarCalendar(scCalendar, fallbackName = "Simple Calendar Import") {
    const months = Array.isArray(scCalendar?.months) ? scCalendar.months : [];
    const weekdays = Array.isArray(scCalendar?.weekdays) ? scCalendar.weekdays : [];
    const leapRule = scCalendar?.year?.leapYearRule?.setting ?? scCalendar?.leapYear?.rule ?? "none";
    const customMod = scCalendar?.year?.leapYearRule?.customMod ?? scCalendar?.leapYear?.customMod ?? 0;
    const yearConfig = scCalendar?.year || {};
    const currentYearConfig = scCalendar?.currentYear || {};

    let pdncLeapRule = "none";
    if (leapRule === "gregorian") {
        pdncLeapRule = "gregorian";
    } else if ((leapRule === "custom" || leapRule === "x-years") && Number(customMod) === 4) {
        pdncLeapRule = "every4";
    }

    return {
        name: String(scCalendar?.name || fallbackName).trim() || fallbackName,
        description: scCalendar?.description || "Imported from Simple Calendar.",
        months: months.map((month, index) => {
            const normalDays = Number(month?.numberOfDays ?? month?.days ?? 0);
            const leapDays = Number(month?.numberOfLeapYearDays ?? normalDays);
            return {
                name: month?.name || `Month ${index + 1}`,
                days: normalDays,
                leap: leapDays !== normalDays ? leapDays : null
            };
        }),
        weekdays: weekdays.map((weekday, index) => weekday?.name || weekday?.abbreviation || `Day ${index + 1}`),
        leapYearRule: pdncLeapRule,
        yearZero: Number(scCalendar?.year?.yearZero ?? 0),
        weekdayStart: Number(scCalendar?.year?.firstWeekday ?? 0),
        yearPrefix: String(yearConfig.prefix ?? currentYearConfig.prefix ?? scCalendar?.prefix ?? "").trim(),
        yearPostfix: String(yearConfig.postfix ?? currentYearConfig.postfix ?? scCalendar?.postfix ?? "").trim(),
        negativeYearPrefix: "",
        negativeYearPostfix: ""
    };
}

function getSimpleCalendarFlagNoteData(candidate) {
    if (!candidate) return null;

    if (typeof candidate.getFlag === "function") {
        const flagged = candidate.getFlag(SIMPLE_CALENDAR_ID, "noteData");
        if (flagged) return flagged;
    }

    return candidate?.flags?.[SIMPLE_CALENDAR_ID]?.noteData || null;
}

function getSimpleCalendarNotePages(candidate) {
    if (!candidate) return [];
    if (Array.isArray(candidate.pages)) return candidate.pages;
    if (Array.isArray(candidate.pages?.contents)) return candidate.pages.contents;
    return [];
}

function isEmptyObject(value) {
    return !value || Object.keys(value).length === 0;
}

export function normalizeSimpleCalendarNote(note, calendar = null) {
    if (!note) return null;

    const candidates = [
        note,
        note?.document,
        note?.entry,
        note?.journalEntry,
        note?.journal,
        note?.data
    ].filter(Boolean);

    let noteData = note?.noteData || null;
    if (!noteData) {
        for (const candidate of candidates) {
            noteData = getSimpleCalendarFlagNoteData(candidate);
            if (noteData) break;
        }
    }

    if (!noteData) return null;

    let entryId = note?.entryId || note?.id || null;
    let title = note?.title || note?.name || null;
    let ownership = note?.ownership || note?.permission || {};
    let pages = getSimpleCalendarNotePages(note);
    let content = note?.content || "";

    for (const candidate of candidates) {
        if (!entryId && candidate?.id) entryId = candidate.id;
        if (!title && candidate?.name) title = candidate.name;
        if (isEmptyObject(ownership) && (candidate?.ownership || candidate?.permission)) {
            ownership = candidate.ownership || candidate.permission || {};
        }
        if (!pages.length) {
            pages = getSimpleCalendarNotePages(candidate);
        }
        if (!content && candidate?.content) {
            content = candidate.content;
        }
    }

    const calendarCategories = Array.isArray(calendar?.noteCategories) ? calendar.noteCategories : [];
    const categories = Array.isArray(note?.categories) && note.categories.length
        ? note.categories
        : Array.isArray(noteData?.categories)
            ? noteData.categories.map(categoryName => {
                return calendarCategories.find(category => category?.name === categoryName) || categoryName;
            })
            : [];

    return {
        entryId,
        id: note?.id || entryId || null,
        title: title || "Imported Note",
        name: title || "Imported Note",
        ownership,
        pages,
        content,
        categories,
        noteData
    };
}

export function describeSimpleCalendarNote(note) {
    const pages = Array.isArray(note?.pages) ? note.pages : [];
    const textParts = [];

    for (const page of pages) {
        if (page?.type === "text" && page?.text?.content) {
            const content = stripHtml(page.text.content);
            if (content) textParts.push(content);
        } else if (page?.text?.content) {
            const content = stripHtml(page.text.content);
            if (content) textParts.push(content);
        }
    }

    if (!textParts.length && note?.content) {
        const content = stripHtml(note.content);
        if (content) textParts.push(content);
    }

    const categories = Array.isArray(note?.categories)
        ? note.categories.map(category => category?.name || category).filter(Boolean)
        : Array.isArray(note?.noteData?.categories)
            ? note.noteData.categories.filter(Boolean)
            : [];

    if (categories.length) {
        textParts.push(`Categories: ${categories.join(", ")}`);
    }

    return textParts.join("\n\n").trim();
}

export function resolveSimpleCalendarEventVisibility(note) {
    const ownership = note?.noteData?.ownership || note?.ownership || {};
    const defaultLevel = Number(ownership.default ?? 0);
    const observerLevel = CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OBSERVER ?? 2;
    const ownerLevel = CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;

    if (defaultLevel >= observerLevel) {
        return { type: "player", author: game.user.id };
    }

    const nonGmOwners = Object.entries(ownership)
        .filter(([userId, level]) => userId !== "default" && Number(level) >= ownerLevel)
        .map(([userId]) => game.users?.get?.(userId))
        .filter(user => user && !user.isGM);

    if (nonGmOwners.length === 1) {
        return { type: "personal", author: nonGmOwners[0].id };
    }

    return { type: "gm", author: game.user.id };
}

export function buildSimpleCalendarEventPayloads(note, pdncCalendar, sourceCalendarId) {
    const noteData = note?.noteData || note || {};
    const startDate = noteData.startDate;
    const endDate = noteData.endDate;

    if (!startDate) return [];

    const visibility = resolveSimpleCalendarEventVisibility(note);
    const description = describeSimpleCalendarNote(note);
    const recurring = mapSimpleCalendarRepeat(noteData.repeats);
    const reminderUsers = Array.isArray(noteData.remindUsers) ? noteData.remindUsers : [];
    const metadataLines = [];

    if (noteData.allDay === false) {
        metadataLines.push(`Original time: ${String(startDate.hour ?? 0).padStart(2, "0")}:${String(startDate.minute ?? 0).padStart(2, "0")}`);
    }

    if (endDate && (endDate.year !== startDate.year || endDate.month !== startDate.month || endDate.day !== startDate.day)) {
        metadataLines.push(
            `Original end: ${endDate.year}-${Number(endDate.month) + 1}-${Number(endDate.day) + 1}`
        );
    }

    if (reminderUsers.length) {
        metadataLines.push(`Reminder users: ${reminderUsers.length}`);
    }

    const finalDescription = [description, ...metadataLines].filter(Boolean).join("\n\n").trim();
    const baseEvent = {
        title: note?.title || note?.name || "Imported Note",
        description: finalDescription,
        type: visibility.type,
        author: visibility.author,
        recurring,
        timestamp: Date.now(),
        color: Array.isArray(note?.categories) && note.categories[0]?.color ? note.categories[0].color : null,
        sourceModule: "simple-calendar",
        sourceCalendarId,
        sourceNoteId: note?.entryId || note?.id || null
    };

    const startDay = Number(startDate.day) + 1;
    const startKey = `${Number(startDate.year)}-${Number(startDate.month)}-${startDay}`;

    if (!endDate || recurring !== "none") {
        return [{ dateKey: startKey, event: baseEvent }];
    }

    const startTimestamp = pdncCalendar.getTimestamp(Number(startDate.year), Number(startDate.month), startDay);
    const endTimestamp = pdncCalendar.getTimestamp(Number(endDate.year), Number(endDate.month), Number(endDate.day) + 1);

    if (endTimestamp < startTimestamp) {
        return [{ dateKey: startKey, event: baseEvent }];
    }

    const maxSpanDays = 366;
    const spanDays = Math.floor((endTimestamp - startTimestamp) / 86400);
    if (spanDays > maxSpanDays) {
        return [{ dateKey: startKey, event: baseEvent }];
    }

    const payloads = [];
    for (let dayIndex = 0; dayIndex <= spanDays; dayIndex++) {
        const date = pdncCalendar.getDate(startTimestamp + (dayIndex * 86400));
        payloads.push({
            dateKey: `${date.year}-${date.month}-${date.day}`,
            event: {
                ...baseEvent,
                sourceSpanIndex: dayIndex
            }
        });
    }

    return payloads;
}

function getSimpleCalendarApi() {
    return window.SimpleCalendar?.api || null;
}

function getSimpleCalendarName(calendar) {
    return String(calendar?.name || calendar?.id || "Simple Calendar").trim() || "Simple Calendar";
}

function collectFallbackNotes(calendarId) {
    const journals = Array.isArray(game.journal?.contents) ? game.journal.contents : [];
    return journals
        .map(entry => {
            const noteData = entry.getFlag?.(SIMPLE_CALENDAR_ID, "noteData");
            if (!noteData || noteData.calendarId !== calendarId) return null;
            return {
                entryId: entry.id,
                title: entry.name,
                ownership: entry.ownership || {},
                pages: entry.pages?.contents || [],
                noteData
            };
        })
        .filter(Boolean);
}

function summarizeNotes(notes) {
    const summary = {
        total: 0,
        recurring: 0,
        ranged: 0,
        public: 0,
        private: 0
    };

    for (const note of notes) {
        const noteData = note?.noteData || note || {};
        summary.total += 1;
        if (Number(noteData.repeats ?? 0) > 0) summary.recurring += 1;

        const start = noteData.startDate;
        const end = noteData.endDate;
        if (start && end && (start.year !== end.year || start.month !== end.month || start.day !== end.day)) {
            summary.ranged += 1;
        }

        const visibility = resolveSimpleCalendarEventVisibility(note);
        if (visibility.type === "player") summary.public += 1;
        else summary.private += 1;
    }

    return summary;
}

export function getActiveSimpleCalendarSnapshot() {
    const module = game.modules.get(SIMPLE_CALENDAR_ID);
    const api = getSimpleCalendarApi();

    if (!module?.active || !api?.getCurrentCalendar) {
        return {
            available: false,
            reason: game.i18n.localize("PDNC.SimpleCalendarMigration.Unavailable")
        };
    }

    const calendar = api.getCurrentCalendar();
    if (!calendar) {
        return {
            available: false,
            reason: game.i18n.localize("PDNC.SimpleCalendarMigration.NoActiveCalendar")
        };
    }

    let notes = [];
    try {
        notes = api.getNotes?.(calendar.id) ?? api.getNotes?.() ?? [];
    } catch (err) {
        console.warn(`${MODULE_ID} | Failed to read Simple Calendar notes via API`, err);
    }

    if (!Array.isArray(notes) || !notes.length) {
        notes = collectFallbackNotes(calendar.id);
    }

    if (Array.isArray(notes) && notes.length) {
        const normalizedNotes = notes
            .map(note => normalizeSimpleCalendarNote(note, calendar))
            .filter(Boolean);

        if (!normalizedNotes.length) {
            console.warn(`${MODULE_ID} | Simple Calendar notes were found but could not be normalized for import.`);
        }

        notes = normalizedNotes;
    }

    const timeConfig = api.getTimeConfiguration?.() || calendar.time || {};
    const currentDate = normalizeSimpleCalendarCurrentDate(
        api.currentDateTime?.() || calendar.currentDate || null,
        timeConfig
    );

    return {
        available: true,
        calendar,
        calendarName: getSimpleCalendarName(calendar),
        sourceCalendarId: calendar.id || "default",
        notes,
        noteSummary: summarizeNotes(notes),
        currentDate,
        timeConfig,
        timeCompatible: isSimpleCalendarTimeCompatible(timeConfig)
    };
}

export class SimpleCalendarMigrationApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.formState = {
            targetName: "",
            setActiveCalendar: true,
            importEvents: true,
            replaceImportedEvents: true,
            importCurrentDate: true
        };
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: "pdnc-simple-calendar-migration",
        classes: ["pdnc-app"],
        window: {
            title: "PDNC.SimpleCalendarMigration.Title",
            icon: "fas fa-right-left",
            resizable: true
        },
        position: {
            width: 540,
            height: "auto"
        },
        form: {
            handler: SimpleCalendarMigrationApp.prototype._onSubmit,
            submitOnChange: false,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/simple-calendar-migration.hbs`
        }
    };

    async _prepareContext() {
        const snapshot = getActiveSimpleCalendarSnapshot();

        if (!this.formState.targetName && snapshot.available) {
            this.formState.targetName = snapshot.calendarName;
        }

        return {
            available: snapshot.available,
            reason: snapshot.reason,
            sourceName: snapshot.calendarName,
            sourceCalendarId: snapshot.sourceCalendarId,
            noteSummary: snapshot.noteSummary,
            timeCompatible: snapshot.timeCompatible,
            currentDateLabel: snapshot.currentDate
                ? `${snapshot.currentDate.year}-${Number(snapshot.currentDate.month) + 1}-${Number(snapshot.currentDate.day) + 1} ${String(snapshot.currentDate.hour ?? 0).padStart(2, "0")}:${String(snapshot.currentDate.minute ?? 0).padStart(2, "0")}`
                : null,
            formState: this.formState
        };
    }

    async _onSubmit(event, form, formData) {
        const snapshot = getActiveSimpleCalendarSnapshot();
        if (!snapshot.available) {
            ui.notifications.error(snapshot.reason);
            return;
        }

        this.formState = {
            targetName: String(formData.object.targetName || snapshot.calendarName).trim(),
            setActiveCalendar: !!formData.object.setActiveCalendar,
            importEvents: !!formData.object.importEvents,
            replaceImportedEvents: !!formData.object.replaceImportedEvents,
            importCurrentDate: !!formData.object.importCurrentDate
        };

        const targetName = this.formState.targetName || snapshot.calendarName;
        const targetIdBase = slugifyName(targetName) || `simple-calendar-${Date.now()}`;
        const targetId = `simple_calendar_${targetIdBase}`;
        const convertedCalendar = convertSimpleCalendarCalendar(snapshot.calendar, targetName);

        const customCalendars = foundry.utils.deepClone(game.settings.get(MODULE_ID, "customCalendars") || {});
        customCalendars[targetId] = convertedCalendar;
        await game.settings.set(MODULE_ID, "customCalendars", customCalendars);

        if (this.formState.setActiveCalendar) {
            await game.settings.set(MODULE_ID, "calendarSystem", targetId);
        }

        let importedEventCount = 0;
        if (this.formState.importEvents) {
            importedEventCount = await this._importEvents(snapshot, targetId);
        }

        let syncedDate = false;
        if (this.formState.importCurrentDate && snapshot.currentDate && snapshot.timeCompatible) {
            syncedDate = await this._syncCurrentDate(snapshot.currentDate, targetId);
        }

        const messages = [
            game.i18n.format("PDNC.SimpleCalendarMigration.SuccessCalendar", { name: targetName })
        ];

        if (this.formState.importEvents) {
            messages.push(game.i18n.format("PDNC.SimpleCalendarMigration.SuccessEvents", { count: importedEventCount }));
        }

        if (this.formState.importCurrentDate) {
            messages.push(
                syncedDate
                    ? game.i18n.localize("PDNC.SimpleCalendarMigration.SuccessDate")
                    : game.i18n.localize("PDNC.SimpleCalendarMigration.SkipDate")
            );
        }

        ui.notifications.info(messages.join(" "));
        this.close();
    }

    async _importEvents(snapshot, targetId) {
        await CalendarDB.ensureDB();
        const events = await CalendarDB.getEvents();

        if (this.formState.replaceImportedEvents) {
            for (const [dateKey, dateEvents] of Object.entries(events)) {
                if (!Array.isArray(dateEvents)) continue;
                events[dateKey] = dateEvents.filter(event => {
                    return !(event?.sourceModule === "simple-calendar" && event?.sourceCalendarId === snapshot.sourceCalendarId);
                });
                if (events[dateKey].length === 0) {
                    delete events[dateKey];
                }
            }
        }

        const pdncCalendar = new CalendarSystem(targetId);
        let imported = 0;

        for (const note of snapshot.notes) {
            const payloads = buildSimpleCalendarEventPayloads(note, pdncCalendar, snapshot.sourceCalendarId);
            for (const payload of payloads) {
                if (!events[payload.dateKey]) events[payload.dateKey] = [];
                events[payload.dateKey].push({
                    ...payload.event,
                    timestamp: Date.now() + imported
                });
                imported += 1;
            }
        }

        await CalendarDB.saveEvents(events);
        return imported;
    }

    async _syncCurrentDate(currentDate, targetId) {
        if (!currentDate) return false;

        const pdncCalendar = new CalendarSystem(targetId);
        const targetSeconds = (
            pdncCalendar.getTimestamp(Number(currentDate.year), Number(currentDate.month), Number(currentDate.day) + 1)
            + ((Number(currentDate.hour ?? 0) * 3600) + (Number(currentDate.minute ?? 0) * 60) + Number(currentDate.second ?? 0))
        );

        const totalDifference = targetSeconds - game.time.worldTime;
        let dayOffset = Math.trunc(totalDifference / 86400);
        let timeOffset = Math.round((totalDifference - (dayOffset * 86400)) / 60);

        while (timeOffset >= 1440) {
            dayOffset += 1;
            timeOffset -= 1440;
        }
        while (timeOffset <= -1440) {
            dayOffset -= 1;
            timeOffset += 1440;
        }

        await game.settings.set(MODULE_ID, "dayOffset", dayOffset);
        await game.settings.set(MODULE_ID, "timeOffset", timeOffset);
        return true;
    }
}
