export class CalendarDB {
    static DB_NAME = "Phils Calendar Storage";
    static FLAG_SCOPE = "phils-day-night-cycle";
    static FLAG_KEY = "calendar-storage-id";

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
            // Create new Journal
            journal = await JournalEntry.create({
                name: this.DB_NAME,
                text: {
                    content: "<h1>Phils Calendar Data</h1><p>Do not edit this content manually. Data is stored in Flags.</p>"
                },
                ownership: {
                    default: 3 // OWNER permissions for everyone
                },
                flags: {
                    [this.FLAG_SCOPE]: {
                        events: oldData
                    }
                }
            });

            await game.settings.set(this.FLAG_SCOPE, "dbJournalId", journal.id);

        } else {
            if (journal.ownership.default !== 3) {
                await journal.update({ "ownership.default": 3 });
            }
            // Ensure flag exists if we have empty flag but data in content? 
            // Or just ensure flag exists if missing
            const flags = journal.getFlag(this.FLAG_SCOPE, "events");


            // MIGRATION / CLEANUP CHECK
            // If data exists in Settings but NOT in Flags, move it (Migration)
            // REMOVED: This causes empty calendars (deleted events) to be re-filled with old data.
            // If the Journal exists, we assume it is the Source of Truth, even if empty.


            // CLEANUP: If data exists in Settings, clear it to prevent "undelete" zombies
            if (Object.keys(oldData).length > 0) {

                await game.settings.set(this.FLAG_SCOPE, "calendarEvents", {});
            }
        }
    }

    static async getEvents() {
        try {
            const journal = await this.getDB();
            if (!journal) {
                console.warn("Phils Day Night Cycle | DB Journal not found.");
                return {};
            }
            const data = journal.getFlag(this.FLAG_SCOPE, "events");
            return foundry.utils.deepClone(data) || {};
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
                    events["-=" + dateKey] = null;
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
                const initialLen = events[dateKey].length;
                const before = events[dateKey].length;
                
                // Detailed check
                const matching = events[dateKey].filter(e => e.documentId == docId); // Relaxed check
                if (matching.length > 0) {

                } else {
                     // Debug non-matches if we are looking for something specific?
                     // Verify if we have ANY documentIds
                     const hasIds = events[dateKey].some(e => e.documentId);

                }

                events[dateKey] = events[dateKey].filter(e => e.documentId != docId); // Relaxed check
                
                if (events[dateKey].length !== initialLen) {
                    changed = true;
                    if (events[dateKey].length === 0) {
                        delete events[dateKey];
                        events["-=" + dateKey] = null;
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
