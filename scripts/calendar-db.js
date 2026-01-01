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
            console.log("Phils Day Night Cycle | Created new Layout DB Journal with migrated data.");
        } else {
            if (journal.ownership.default !== 3) {
                await journal.update({ "ownership.default": 3 });
            }
            // Ensure flag exists if we have empty flag but data in content? 
            // Or just ensure flag exists if missing
            const flags = journal.getFlag(this.FLAG_SCOPE, "events");
            console.log("Phils Day Night Cycle | Startup DB Check:", {
                journalId: journal.id,
                flags: flags,
                settingsData: oldData
            });

            // MIGRATION / CLEANUP CHECK
            // If data exists in Settings but NOT in Flags, move it (Migration)
            // REMOVED: This causes empty calendars (deleted events) to be re-filled with old data.
            // If the Journal exists, we assume it is the Source of Truth, even if empty.


            // CLEANUP: If data exists in Settings, clear it to prevent "undelete" zombies
            if (Object.keys(oldData).length > 0) {
                console.log("Phils Day Night Cycle | Clearing legacy settings data to prevent conflicts.");
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
            return data || {};
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
            console.log(`Phils Day Night Cycle | Saving ${Object.keys(events).length} date-entries to Journal ${journal.id}...`);
            // Using Flags for storage
            if (Object.keys(events).length === 0) {
                await journal.unsetFlag(this.FLAG_SCOPE, "events");
                console.log("Phils Day Night Cycle | Events empty. Unset flag entirely.");
            } else {
                await journal.setFlag(this.FLAG_SCOPE, "events", events);
                console.log("Phils Day Night Cycle | Saved events to DB.", events);
            }
        } catch (e) {
            console.error("Phils Day Night Cycle | Error saving events:", e);
        }
    }
}
