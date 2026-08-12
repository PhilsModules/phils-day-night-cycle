const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { CalendarSystem } from "./calendar-system.js";

const MODULE_ID = "phils-day-night-cycle";

export class CalendarEventEditor extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(dateKey, eventToEdit, defaultType = 'event', callback) {
        super({});
        this.dateKey = dateKey;
        this.editEvent = eventToEdit ? (typeof eventToEdit === 'string' ? { title: eventToEdit, type: 'event', author: game.user.id } : eventToEdit) : null;
        this.defaultType = defaultType;
        this.callback = callback;
        
        const isLegacyRecur = this.editEvent && this.editEvent.recurring && this.editEvent.recurring !== 'none';
        this.isRecurringInstance = (this.editEvent && this.editEvent.isRecurring) || isLegacyRecur;
    }

    get title() {
        return this.editEvent ? game.i18n.localize("PDNC.EditEvent") : game.i18n.localize("PDNC.AddEvent");
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: "phils-calendar-editor",
        classes: ["pdnc-app-v2", "pdnc-event-editor-window"],
        window: {
            resizable: true,
            icon: "fas fa-edit",
            classes: ["pdnc-event-editor-window"]
        },
        position: {
            width: 400,
            height: 480
        },
        actions: {
            delete: CalendarEventEditor.prototype._onDelete
        },
        form: {
            handler: CalendarEventEditor.prototype._onSubmit,
            submitOnChange: false,
            closeOnSubmit: true
        }
    };

    async _preClose(options) {
        // Web Animations API fade — awaited before element is removed from DOM
        if (this.element?.isConnected) {
            await this.element.animate(
                [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.97)" }],
                { duration: 120, easing: "ease-in", fill: "forwards" }
            ).finished;
        }
        return super._preClose(options);
    }

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/event-editor.html`
        }
    };

    async _prepareContext(options) {
        const isGM = game.user.isGM;
        const playerCreate = game.settings.get(MODULE_ID, "playerCreateEvents");
        const canCreate = isGM || playerCreate;
        const calendarSystem = new CalendarSystem();
        const parsedDate = CalendarSystem.parseDateKey(this.dateKey) ?? { year: 0, month: 0, day: 1 };
        const maxDaysInMonth = calendarSystem.getDaysInMonth(parsedDate.year, parsedDate.month);

        let title = "";
        let description = "";
        let type = this.defaultType;

        if (this.editEvent) {
            title = this.editEvent.title || "";
            description = this.editEvent.description || "";
            type = this.editEvent.type;
        }

        return {
            dateKey: this.dateKey,
            isGM: isGM,
            canCreate: canCreate,
            defaultType: type, 
            title: title,
            description: description,
            recurring: this.editEvent ? (this.editEvent.recurring || "none") : "none",
            reminder: this.editEvent ? (this.editEvent.reminder || 0) : 0,
            color: this.editEvent ? (this.editEvent.color || "") : "",
            icon: this.editEvent ? (this.editEvent.icon || "") : "",
            intervalDays: this.editEvent ? (this.editEvent.intervalDays || 36) : 36,
            postToChat: !this.editEvent, 
            isEditing: !!this.editEvent,
            isRecurringInstance: !!this.isRecurringInstance,
            
            currentYear: parsedDate.year,
            currentMonth: parsedDate.month,
            currentDay: parsedDate.day,
            maxDaysInMonth: maxDaysInMonth,
            months: calendarSystem.config.months.map((m, i) => ({ 
                index: i, 
                name: CalendarSystem.stripMarkup(m.name)
            })),
            canEditDate: isGM
        };
    }

    async _onSubmit(event, form, formData) {
        const title = formData.object.title;
        const description = formData.object.description;
        const type = formData.object.type;
        const recurring = formData.object.recurring;
        const reminder = parseInt(formData.object.reminder) || 0;
        const color = formData.object.color;
        const icon = formData.object.icon;
        const intervalDays = parseInt(formData.object.intervalDays) || 36;
        const postToChat = formData.object.postToChat;

        const newYear = parseInt(formData.object.dateYear);
        const newMonth = parseInt(formData.object.dateMonth);
        const newDay = parseInt(formData.object.dateDay);
        
        let targetDateKey = this.dateKey;
        if (!isNaN(newYear) && !isNaN(newMonth) && !isNaN(newDay)) {
            targetDateKey = `${newYear}-${newMonth}-${newDay}`;
        }
        
        const recurrenceScope = formData.object.recurrenceScope || 'series';

        const eventData = {
            title: title,
            description: description,
            type: type,
            recurring: recurring,
            reminder: reminder,
            color: color,
            icon: icon,
            intervalDays: intervalDays,
            author: this.editEvent ? this.editEvent.author : game.user.id,
            timestamp: this.editEvent ? this.editEvent.timestamp : Date.now(),
            recurrenceScope: recurrenceScope,
            targetDateKey: targetDateKey
        };

        if (this.callback) {
            this.callback(this.editEvent ? 'save' : 'save-new', eventData, this.editEvent);
        }

        if (postToChat && !this.editEvent && type !== 'gm' && type !== 'personal') { 
            this._postCreationMessage(eventData);
        }
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;
        
        const recurringSelect = html.querySelector('select[name="recurring"]');
        const intervalGroup = html.querySelector('#pdnc-interval-group');
        if (recurringSelect && intervalGroup) {
            recurringSelect.addEventListener('change', (e) => {
                intervalGroup.style.display = e.target.value === 'interval' ? '' : 'none';
            });
        }
    }

    async _postCreationMessage(data) {
         const calendarSystem = new CalendarSystem();
         const targetDateKey = data.targetDateKey || this.dateKey;
         const { year, month, day } = CalendarSystem.parseDateKey(targetDateKey) ?? { year: 0, month: 0, day: 1 };
         const displayDate = calendarSystem.formatDate({
             year,
             month,
             day,
             monthName: calendarSystem.config.months[month]?.name
         }, { plainText: true });
         
         const linkHtml = `<a class="pdnc-event-link" data-date="${targetDateKey}"><i class="fas fa-calendar-check"></i> ${data.title}</a>`;

         const content = `
             <div class="pdnc-chat-card">
                 <h3>${game.i18n.localize("PDNC.EventCreated")}</h3>
                 <p><strong>${game.i18n.localize("PDNC.Date")}:</strong> ${displayDate}</p>
                 <p><strong>${game.i18n.localize("PDNC.Title")}:</strong> ${linkHtml}</p>
                 <p>${data.description}</p>
                 ${data.recurring !== 'none' ? `<p><em>${game.i18n.localize("PDNC.Recurring")}: ${game.i18n.localize("PDNC.Recurs." + data.recurring)}</em></p>` : ''}
             </div>
         `;
 
         ChatMessage.create({
             user: game.user.id,
             content: content,
             speaker: ChatMessage.getSpeaker({ alias: "Calendar" })
         });
    }

    async _onDelete(event, target) {
        if (this.isRecurringInstance) {
            const { DialogV2 } = foundry.applications.api;
            
            const result = await DialogV2.wait({
                window: { title: game.i18n.localize("PDNC.EditAction") },
                content: `<p>${game.i18n.localize("PDNC.DeleteRecurringPrompt")}</p>`,
                buttons: [
                    {
                        action: "instance",
                        label: game.i18n.localize("PDNC.EditInstance"),
                        default: true,
                        callback: () => "instance"
                    },
                    {
                        action: "future",
                        label: game.i18n.localize("PDNC.EditFuture"),
                        callback: () => "future"
                    },
                    {
                        action: "series",
                        label: game.i18n.localize("PDNC.DeleteSeries"),
                        callback: () => "series"
                    }
                ],
                close: () => null
            });

            if (result === 'instance' && this.callback) {
                 this.callback('delete-instance', null, this.editEvent);
                 this.close();
            } else if (result === 'future' && this.callback) {
                 this.callback('delete-future', null, this.editEvent);
                 this.close();
            } else if (result === 'series' && this.callback) {
                 this.callback('delete-series', null, this.editEvent);
                 this.close();
            }
        } else {
             if (this.callback) {
                this.callback('delete', null, this.editEvent);
                this.close();
            }
        }
    }
}
