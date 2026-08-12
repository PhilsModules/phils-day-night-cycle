export class CalendarDB {
    static DB_NAME = "Phils Calendar Storage";
    static FLAG_SCOPE = "phils-day-night-cycle";
    static FLAG_KEY = "calendar-storage-id";
    static _cache = null;

    static async getDB() {
        // Try to find by Flag first (robust renaming support)
        let journalId = game.settings.get(this.FLAG_SCOPE, "dbJournalId");
        let journal = game.journal.get(journalId);

        if (!journal) {
            // Fallback: Find by Name
            journal = game.journal.find(j => j.name === this.DB_NAME);

            // If found by name but ID wasn't saved, save it
            if (journal && game.user.isGM) {
                await game.settings.set(this.FLAG_SCOPE, "dbJournalId", journal.id);
            }
        }

        return journal;
    }

    static async ensureDB() {
        if (!game.user.isGM) return;

        let journal = await this.getDB();
        const oldData = game.settings.get(this.FLAG_SCOPE, "calendarEvents") || {};

        if (!journal) {
            journal = await JournalEntry.create({
                name: this.DB_NAME,
                pages: [{
                    name: "Phils Calendar Data",
                    type: "text",
                    text: {
                        content: "<p>Do not edit this content manually. Data is stored in Flags.</p>",
                        format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
                    }
                }],
                ownership: {
                    default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                flags: {
                    [this.FLAG_SCOPE]: {
                        events: oldData
                    }
                }
            });

            await game.settings.set(this.FLAG_SCOPE, "dbJournalId", journal.id);
        } else {
            if (journal.ownership.default !== CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
                await journal.update({ "ownership.default": CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER });
            }

            if (Object.keys(oldData).length > 0) {
                await game.settings.set(this.FLAG_SCOPE, "calendarEvents", {});
            }
        }
    }

    static async getEvents() {
        if (this._cache) {
            return foundry.utils.deepClone(this._cache);
        }

        try {
            const journal = await this.getDB();
            if (!journal) {
                console.warn("Phils Day Night Cycle | DB Journal not found.");
                return {};
            }
            const data = journal.getFlag(this.FLAG_SCOPE, "events");
            this._cache = foundry.utils.deepClone(data) || {};
            return foundry.utils.deepClone(this._cache);
        } catch (e) {
            console.error("Phils Day Night Cycle | Error getting events:", e);
            return {};
        }
    }

    static async saveEvents(events) {
        try {
            const journal = await this.getDB();
            if (!journal) {
                console.error("Phils Day Night Cycle | Cannot save, DB Journal missing.");
                return;
            }

            // Clean up any lingering legacy "-=" keys from old bugs
            for (const k of Object.keys(events)) {
                if (k.startsWith("-=")) delete events[k];
            }

            // Update Cache Immediately
            this._cache = foundry.utils.deepClone(events);

            // Using Flags for storage
            if (Object.keys(events).length === 0) {
                await journal.unsetFlag(this.FLAG_SCOPE, "events");

            } else {
                await journal.setFlag(this.FLAG_SCOPE, "events", events);

            }
            // Force UI Refresh
            if (window.PhilsDayNightCycle?.refresh) {
                window.PhilsDayNightCycle.refresh();
            }
        } catch (e) {
            console.error("Phils Day Night Cycle | Error saving events:", e);
        }
    }

    static flushCache() {
        this._cache = null;
    }

    static async addEvent(dateKey, eventData) {
        // eventData: { title, description, type, recurring, ... }
        if (!dateKey || !eventData) return;
        
        try {
            const events = await this.getEvents();
            if (!events[dateKey]) events[dateKey] = [];
            
            // Generate timestamp if missing for uniqueness
            if (!eventData.timestamp) eventData.timestamp = Date.now();
            
            // Check for duplicates (simple check by title)
            const exists = events[dateKey].some(e => e.title === eventData.title && e.type === eventData.type);
            if (!exists) {
                events[dateKey].push(eventData);
                await this.saveEvents(events);

                return true;
            }
            return false;
        } catch (e) {
            console.error("PDNC | Failed to add event:", e);
            return false;
        }
    }

    static async removeEvent(dateKey, title) {
        if (!dateKey || !title) return;
        
        try {
            const events = await this.getEvents();
            if (!events[dateKey]) return false;
            
            const initialLen = events[dateKey].length;
            events[dateKey] = events[dateKey].filter(e => e.title !== title);
            
            if (events[dateKey].length < initialLen) {
                if (events[dateKey].length === 0) {
                    delete events[dateKey];
                }
                await this.saveEvents(events);

                return true;
            }
            return false;
        } catch (e) {
            console.error("PDNC | Failed to remove event:", e);
            return false;
        }
    }
    static async removeEventByDocumentId(docId) {
        if (!docId) return;


        try {
            const events = await this.getEvents();

            let changed = false;

            for (const dateKey in events) {
                if (dateKey.startsWith("-=")) {
                    delete events[dateKey];
                    changed = true;
                    continue;
                }

                const initialLen = events[dateKey].length;
                events[dateKey] = events[dateKey].filter(e => e.documentId != docId); // Relaxed check
                
                if (events[dateKey].length !== initialLen) {
                    changed = true;
                    if (events[dateKey].length === 0) {
                        delete events[dateKey];
                    }
                }
            }

            if (changed) {

                await this.saveEvents(events);

                return true;
            }

            return false;
        } catch (e) {
            console.error("PDNC | Failed to remove linked event:", e);
            return false;
        }
    }
}
