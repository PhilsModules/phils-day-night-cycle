const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { CalendarSystem } from "./calendar-system.js";

const MODULE_ID = "phils-day-night-cycle";

export class CalendarEventEditor extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(dateKey, eventToEdit, defaultType = 'event', callback) {
        super({});
        this.dateKey = dateKey;
        // If eventToEdit is passed, use it. checking for _index is handled by caller.
        this.editEvent = eventToEdit ? (typeof eventToEdit === 'string' ? { title: eventToEdit, type: 'event', author: game.user.id } : eventToEdit) : null;
        this.defaultType = defaultType;
        this.callback = callback;
        
        // Treat Start Date of Series as an "Instance" so we can delete/modify it using the same dialog flow
        const isLegacyRecur = this.editEvent && this.editEvent.recurring && this.editEvent.recurring !== 'none';
        this.isRecurringInstance = (this.editEvent && this.editEvent.isRecurring) || isLegacyRecur;
    }

    // ... (Getters and Options remain same)
    get title() {
        return this.editEvent ? game.i18n.localize("PDNC.EditEvent") : game.i18n.localize("PDNC.AddEvent");
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        id: "phils-calendar-editor",
        window: {
            resizable: true,
            icon: "fas fa-edit",
            width: 400,
            height: "auto",
            classes: ["pdnc-event-editor-window"]
        },
        position: {
            width: 400,
            height: "auto"
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

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/event-editor.html`
        }
    };

    async _prepareContext(options) {
        const isGM = game.user.isGM;
        const playerCreate = game.settings.get(MODULE_ID, "playerCreateEvents");
        const canCreate = isGM || playerCreate;

        // Determine title, description, and type
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
            postToChat: !this.editEvent, 
            isEditing: !!this.editEvent,
            isRecurringInstance: !!this.isRecurringInstance
        };
    }

    async _onSubmit(event, form, formData) {
        const title = formData.object.title;
        const description = formData.object.description;
        const type = formData.object.type;
        const recurring = formData.object.recurring;
        const reminder = parseInt(formData.object.reminder) || 0;
        const postToChat = formData.object.postToChat;
        
        // New: Recurrence Scope
        const recurrenceScope = formData.object.recurrenceScope || 'series'; // 'series' or 'instance'

        const eventData = {
            title: title,
            description: description,
            type: type,
            recurring: recurring,
            reminder: reminder,
            author: this.editEvent ? this.editEvent.author : game.user.id,
            timestamp: this.editEvent ? this.editEvent.timestamp : Date.now(),
            // Pass the scope back
            recurrenceScope: recurrenceScope
        };

        if (this.callback) {
            this.callback(this.editEvent ? 'save' : 'save-new', eventData, this.editEvent);
        }

        // Post to Chat logic
        if (postToChat && !this.editEvent && type !== 'gm' && type !== 'personal') { 
            this._postCreationMessage(eventData);
        }
    }

    async _postCreationMessage(data) {
         const config = new CalendarSystem().config; 
         
         const [year, month, day] = this.dateKey.split('-').map(Number);
         const monthName = config.months[month].name;
         
         // Generate clickable link
         const linkHtml = `<a class="pdnc-event-link" data-date="${this.dateKey}"><i class="fas fa-calendar-check"></i> ${data.title}</a>`;

         const content = `
             <div class="pdnc-chat-card">
                 <h3>${game.i18n.localize("PDNC.EventCreated")}</h3>
                 <p><strong>${game.i18n.localize("PDNC.Date")}:</strong> ${day}. ${monthName}, ${year}</p>
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
            // Standard Event
             if (this.callback) {
                this.callback('delete', null, this.editEvent);
                this.close();
            }
        }
    }
}
