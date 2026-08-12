import { CalendarSystem } from "../calendar-system.js";

const MODULE_ID = "phils-day-night-cycle";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Application to manage Custom Calendars
 */
export class CustomCalendarList extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        tag: "form",
        id: "pdnc-custom-calendar-list",
        window: {
            title: "PDNC.CustomCalendar.ListTitle",
            icon: "fas fa-calendar-alt",
            resizable: true
        },
        position: {
            width: 500,
            height: "auto"
        },
        classes: ["pdnc-app-v2", "pdnc-calendar-list-window"],
        actions: {
            create: CustomCalendarList.prototype._onCreate,
            edit: CustomCalendarList.prototype._onEdit,
            delete: CustomCalendarList.prototype._onDelete,
            export: CustomCalendarList.prototype._onExport,
            import: CustomCalendarList.prototype._onImport
        }
    };

    static PARTS = {
        list: {
            template: `modules/${MODULE_ID}/templates/custom-calendar-list.hbs`,
            scrollable: [".pdnc-scrollable"]
        }
    };

    async _prepareContext(options) {
        const calendars = game.settings.get(MODULE_ID, "customCalendars") || {};
        return {
            calendars: Object.entries(calendars).map(([id, c]) => ({ 
                id, 
                name: c.name, 
                description: c.description 
            }))
        };
    }

    async _onCreate() {
        new CustomCalendarEditor().render({ force: true });
    }

    async _onEdit(event, target) {
        const li = target.closest("li");
        const id = li.dataset.id;
        new CustomCalendarEditor({ editingId: id }).render({ force: true });
    }

    async _onDelete(event, target) {
        const li = target.closest("li");
        const id = li.dataset.id;
        
        const confirm = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("PDNC.Delete") },
            content: `<p>${game.i18n.localize("PDNC.CustomCalendar.DeleteConfirm")}</p>`,
            modal: true
        });

        if (confirm) {
            const calendars = game.settings.get(MODULE_ID, "customCalendars");
            delete calendars[id];
            await game.settings.set(MODULE_ID, "customCalendars", calendars);
            this.render();
        }
    }

    async _onExport(event, target) {
        const li = target.closest("li");
        const id = li.dataset.id;
        const calendars = game.settings.get(MODULE_ID, "customCalendars");
        const data = calendars[id];
        
        saveDataToFile(JSON.stringify(data, null, 2), "json", `${data.name.slugify()}.json`);
    }

    async _onImport(event, target) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        
        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            
            const text = await file.text();
            try {
                const json = JSON.parse(text);
                if (!json.months || !json.weekdays) {
                    throw new Error("Invalid Calendar Format");
                }
                
                const id = `custom_${Date.now()}`;
                const calendars = game.settings.get(MODULE_ID, "customCalendars") || {};
                calendars[id] = json;
                
                await game.settings.set(MODULE_ID, "customCalendars", calendars);
                this.render();
                ui.notifications.info("PDNC.CustomCalendar.ImportSuccess", { localize: true });
                
            } catch (err) {
                ui.notifications.error(`Import Error: ${err.message}`);
            }
        };
        
        input.click();
    }
}

/**
 * Editor for a specific Custom Calendar
 */
export class CustomCalendarEditor extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.editingId = options.editingId || null;
        this.tempData = null;
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: "pdnc-custom-calendar-editor",
        window: {
            title: "PDNC.CustomCalendar.EditorTitle",
            icon: "fas fa-edit",
            resizable: true
        },
        position: {
            width: 600,
            height: "auto"
        },
        classes: ["pdnc-app-v2", "pdnc-calendar-editor-window"],
        actions: {
            save: CustomCalendarEditor.prototype._onSave,
            cancel: CustomCalendarEditor.prototype._onCancel,
            addMonth: CustomCalendarEditor.prototype._onAddMonth,
            deleteMonth: CustomCalendarEditor.prototype._onDeleteMonth,
            addWeekday: CustomCalendarEditor.prototype._onAddWeekday,
            deleteWeekday: CustomCalendarEditor.prototype._onDeleteWeekday
        },
        tabGroups: {
            main: "months"
        }
    };

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/custom-calendar-editor.hbs`,
            scrollable: [".pdnc-scrollable"]
        }
    };

    async _prepareContext(options) {
        if (!this.tempData) {
            if (this.editingId) {
                const calendars = game.settings.get(MODULE_ID, "customCalendars");
                this.tempData = foundry.utils.deepClone(calendars[this.editingId]);
            } else {
                this.tempData = {
                    name: "New Calendar",
                    description: "",
                    months: [{ name: "Month 1", days: 30, leap: null }],
                    weekdays: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
                    leapYearRule: "gregorian",
                    yearZero: 0,
                    weekdayStart: 0,
                    yearPrefix: "",
                    yearPostfix: "",
                    negativeYearPrefix: "",
                    negativeYearPostfix: ""
                };
            }
        }

        const leapYearChoices = {
            "none": "PDNC.CustomCalendar.RuleNone",
            "gregorian": "PDNC.CustomCalendar.RuleGregorian",
            "every4": "PDNC.CustomCalendar.RuleEvery4",
        };

        return {
            editingCalendar: this.tempData,
            leapYearChoices,
            activeTab: this.tabGroups?.main || "months"
        };
    }

    _updateTempData(formData) {
        this.tempData.name = formData.get("name");
        this.tempData.description = formData.get("description");
        this.tempData.leapYearRule = formData.get("leapYearRule");
        this.tempData.yearZero = Number(formData.get("yearZero"));
        this.tempData.weekdayStart = Number(formData.get("weekdayStart"));
        this.tempData.yearPrefix = formData.get("yearPrefix") || "";
        this.tempData.yearPostfix = formData.get("yearPostfix") || "";
        this.tempData.negativeYearPrefix = formData.get("negativeYearPrefix") || "";
        this.tempData.negativeYearPostfix = formData.get("negativeYearPostfix") || "";

        const expanded = foundry.utils.expandObject(Object.fromEntries(formData));
        
        if (expanded.months) {
            this.tempData.months = Object.values(expanded.months).map(m => ({
                name: m.name,
                days: Number(m.days),
                leap: m.leap ? Number(m.leap) : null
            }));
        }
        
        if (expanded.weekdays) {
            this.tempData.weekdays = Object.values(expanded.weekdays);
        }
    }

    async _onAddMonth(event, target) {
        const formData = new FormData(this.element);
        this._updateTempData(formData);
        
        this.tempData.months.push({ name: "New Month", days: 30, leap: null });
        this.render();
    }

    async _onDeleteMonth(event, target) {
        const formData = new FormData(this.element);
        this._updateTempData(formData);
        
        const index = target.dataset.index;
        this.tempData.months.splice(index, 1);
        this.render();
    }

    async _onAddWeekday(event, target) {
        const formData = new FormData(this.element);
        this._updateTempData(formData);
        
        this.tempData.weekdays.push("New Day");
        this.render();
    }

    async _onDeleteWeekday(event, target) {
        const formData = new FormData(this.element);
        this._updateTempData(formData);
        
        const index = target.dataset.index;
        this.tempData.weekdays.splice(index, 1);
        this.render();
    }

    async _onSave(event, target) {
        const formData = new FormData(this.element);
        this._updateTempData(formData);
        
        if (!this.tempData.name) {
            ui.notifications.error(game.i18n.localize("PDNC.CustomCalendar.ErrorNoName"));
            return;
        }

        const calendars = game.settings.get(MODULE_ID, "customCalendars") || {};
        const id = this.editingId || `custom_${Date.now()}`;
        
        calendars[id] = this.tempData;
        
        await game.settings.set(MODULE_ID, "customCalendars", calendars);
        
        const listApp = foundry.applications.instances.get("pdnc-custom-calendar-list");
        if (listApp) listApp.render();
        
        this.close();
    }

    async _onCancel() {
        this.close();
    }
}
