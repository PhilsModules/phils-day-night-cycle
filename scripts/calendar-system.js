export class CalendarSystem {
    constructor(systemOverride = null) {
        // Fallback Logic: If setting is invalid (e.g. "simple" was removed), default to "gregorian"
        const storedSystem = systemOverride || game.settings.get("phils-day-night-cycle", "calendarSystem");
        if (!CalendarSystem.SYSTEMS[storedSystem]) {
            console.warn(`PDNC | Calendar System '${storedSystem}' not found (deprecated?). Falling back to 'gregorian'.`);
            this.system = "gregorian";
        } else {
            this.system = storedSystem;
        }

        this._cache = {
             years: [],
             cumulative: [0],
             maxCachedYear: -1
        };
        this._configCache = null;
    }

    get config() {
        if (this._configCache) return this._configCache;

        const conf = foundry.utils.deepClone(CalendarSystem.SYSTEMS[this.system]);
        
        // Localize Months using keys
        // Keys follow format: PDNC.Calendar.<System>.Months.<EnglishName>
        // Note: The object keys in SYSTEMS match the lookup key
        const sysKey = this.system.charAt(0).toUpperCase() + this.system.slice(1);
        const showRealNames = game.settings.get("phils-day-night-cycle", "showRealNames");

        conf.months.forEach(m => {
            // We use the original English name as the key for lookup
            const key = `PDNC.Calendar.${sysKey}.Months.${m.name}`;
            let loc = game.i18n.localize(key);
            if (loc === key) loc = m.name; // Fallback to english name if not found

            if (showRealNames) {
                const altKey = `${key}_Alt`;
                const altLoc = game.i18n.localize(altKey);
                if (altLoc && altLoc !== altKey) {
                    loc = `<span class="pdnc-nowrap">${loc} <span class="pdnc-alt-name">(${altLoc})</span></span>`;
                }
            }
            m.name = loc;
        });

        // Localize Weekdays
        conf.weekdays = conf.weekdays.map(d => {
            const key = `PDNC.Calendar.${sysKey}.Weekdays.${d}`;
            let loc = game.i18n.localize(key);
            if (loc === key) loc = d;

            if (showRealNames) {
                const altKey = `${key}_Alt`;
                const altLoc = game.i18n.localize(altKey);
                if (altLoc && altLoc !== altKey) {
                    loc = `<span class="pdnc-nowrap">${loc} <span class="pdnc-alt-name">(${altLoc})</span></span>`;
                }
            }
            return loc;
        });

        // Localize Description
        const descKey = `PDNC.Calendar.${sysKey}.Description`;
        const descLoc = game.i18n.localize(descKey);
        if (descLoc && descLoc !== descKey) {
            conf.description = descLoc;
        }

        this._configCache = conf;
        return conf;
    }

    static SYSTEMS = {
            gregorian: {
                name: "Gregorian (Standard)",
                description: "Standard real-world calendar.",
                months: [
                    { name: "January", days: 31 },
                    { name: "February", days: 28, leap: 29 },
                    { name: "March", days: 31 },
                    { name: "April", days: 30 },
                    { name: "May", days: 31 },
                    { name: "June", days: 30 },
                    { name: "July", days: 31 },
                    { name: "August", days: 31 },
                    { name: "September", days: 30 },
                    { name: "October", days: 31 },
                    { name: "November", days: 30 },
                    { name: "December", days: 31 }
                ],
                weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                leapYearRule: (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
            },
            golarion: {
                name: "Golarion (Pathfinder 2e)",
                description: "Pathfinder 2e setting (Age of Lost Omens).",
                months: [
                    { name: "Abadius", days: 31 },
                    { name: "Calistril", days: 28, leap: 29 },
                    { name: "Pharast", days: 31 },
                    { name: "Gozran", days: 30 },
                    { name: "Desnus", days: 31 },
                    { name: "Sarenith", days: 30 },
                    { name: "Erastus", days: 31 },
                    { name: "Arodus", days: 31 },
                    { name: "Rova", days: 30 },
                    { name: "Lamashan", days: 31 },
                    { name: "Neth", days: 30 },
                    { name: "Kuthona", days: 31 }
                ],
                weekdays: ["Moonday", "Toilday", "Wealday", "Oathday", "Fireday", "Starday", "Sunday"],
                leapYearRule: (year) => (year % 8 === 0) // Simplified Golarion rule (every 8 years usually)
            },
            harptos: {
                name: "Harptos (DnD 5e)",
                description: "D&D 5e Forgotten Realms setting.",
                months: [
                    { name: "Hammer", days: 30 },
                    { name: "Alturiak", days: 30 },
                    { name: "Ches", days: 30 },
                    { name: "Tarsakh", days: 30 },
                    { name: "Mirtul", days: 30 },
                    { name: "Kythorn", days: 30 },
                    { name: "Flamerule", days: 30 },
                    { name: "Eleasis", days: 30 },
                    { name: "Eleint", days: 30 },
                    { name: "Marpenoth", days: 30 },
                    { name: "Uktar", days: 30 },
                    { name: "Nightal", days: 30 }
                    // Note: Harptos actually has holidays between months. For simplicity V1, we stick to 30 days.
                ],
                weekdays: ["Firstday", "Seconday", "Thirdday", "Middleday", "Fifthday", "Sixthday", "Seventhday", "Eighthday", "Ninthday", "Tenthday"], 
                leapYearRule: (year) => (year % 4 === 0)
            },
            magaambya: {
                name: "Magaambya (Mwangi)",
                description: "Mwangi Expanse setting (365 days).",
                months: [
                    { name: "Hawk Month", days: 28 },
                    { name: "Snake Month", days: 28 },
                    { name: "Jatembe Month", days: 36 },
                    { name: "Leopard Month", days: 28 },
                    { name: "Shory Month", days: 28 },
                    { name: "Elephant Month", days: 35 },
                    { name: "Hyena Month", days: 28 },
                    { name: "Frog Month", days: 28 },
                    { name: "Ibex Month", days: 35, leap: 36 },
                    { name: "Bull Month", days: 28 },
                    { name: "Spider Month", days: 28 },
                    { name: "Magaambya Month", days: 35 }
                ],
                weekdays: ["Moonday", "Toilday", "Wealday", "Oathday", "Fireday", "Starday", "Sunday"],
                leapYearRule: (year) => (year % 4 === 0),
                yearZero: 0,
                weekdayStart: 0
            }
        };

    _ensureCache(targetYear) {
        if (targetYear <= this._cache.maxCachedYear) return;
        
        // Build cache from current max up to target
        let currentTotal = this._cache.cumulative[this._cache.cumulative.length - 1];
        
        for (let y = this._cache.maxCachedYear + 1; y <= targetYear; y++) {
            const days = this.getDaysInYear(y);
            this._cache.years[y] = days;
            currentTotal += days;
            this._cache.cumulative[y + 1] = currentTotal; // cumulative[1] is end of year 0 / start of year 1
        }
        
        this._cache.maxCachedYear = targetYear;
    }

    getDate(worldSeconds) {
        // Assume Year 0 starts at 0 seconds for simplicity, or handle offset?
        // Foundry time usually implies 0 = start of world.
        // Let's calculate purely from total seconds.

        const SECONDS_IN_DAY = 86400;
        let totalDays = Math.floor(worldSeconds / SECONDS_IN_DAY);

        // --- OPTIMIZED YEAR SEARCH ---
        // Instead of while(totalDays >= daysInYear), we use our cumulative cache
        // We need to find Y such that cumulative[Y] <= totalDays < cumulative[Y+1]
        
        // Heuristic: Estimate target year to ensure cache is built far enough.
        // We calculate the minimum days in a standard year to be safe for any calendar length.
        const sysConfig = CalendarSystem.SYSTEMS[this.system];
        const minDays = sysConfig.months.reduce((sum, m) => sum + m.days, 0);
        const estimatedYear = Math.floor(totalDays / minDays);
        this._ensureCache(estimatedYear + 2); // Buffer to ensure cumulative[estimatedYear+1] exists

        // Binary Search on cumulative array to find the year
        let low = 0;
        let high = this._cache.maxCachedYear + 1; // Search up to maxCachedYear + 1 for cumulative array
        let year = 0;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (mid >= this._cache.cumulative.length) { // Handle cases where mid might exceed cache bounds
                high = mid - 1;
                continue;
            }
            if (this._cache.cumulative[mid] <= totalDays) {
                year = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        
        // 'year' is now the largest index where cumulative[year] <= totalDays
        // totalDays -= cumulative[year] to get days within that year
        totalDays -= this._cache.cumulative[year];

        // Calculate Month (Standard Logic)
        let monthIndex = 0;
        let isLeap = this.isLeapYear(year);

        while (true) {
            let monthData = this.config.months[monthIndex];
            let daysInThisMonth = (isLeap && monthData.leap) ? monthData.leap : monthData.days;

            if (totalDays < daysInThisMonth) {
                break;
            }

            totalDays -= daysInThisMonth;
            monthIndex++;
            if (monthIndex >= 12) {
                break;
            }
        }

        const weekdayOffset = game.settings.get("phils-day-night-cycle", "weekdayOffset") || 0;
        const totalOffsets = (this.config.weekdayStart || 0) + weekdayOffset;

        // Ensure positive modulo result
        const rawIndex = (Math.floor(worldSeconds / SECONDS_IN_DAY) + totalOffsets) % this.config.weekdays.length;
        const weekdayIndex = (rawIndex + this.config.weekdays.length) % this.config.weekdays.length;

        // The monthName and weekday are already localized by the config getter
        return {
            year: year + (this.config.yearZero || 0),
            month: monthIndex, // 0-indexed
            monthName: this.config.months[monthIndex].name,
            day: totalDays + 1, // 1-indexed (1st, 2nd...)
            weekdayIndex: weekdayIndex,
            weekday: this.config.weekdays[weekdayIndex]
        };
    }

    isLeapYear(year) {
        return this.config.leapYearRule(year);
    }

    getDaysInYear(year) {
        // Cached?
        if (year <= this._cache.maxCachedYear && this._cache.years[year] !== undefined) {
            return this._cache.years[year];
        }
        let isLeap = this.isLeapYear(year);
        const days = this.config.months.reduce((sum, m) => sum + ((isLeap && m.leap) ? m.leap : m.days), 0);
        // If this is called for a year beyond maxCachedYear, we don't cache it here
        // It will be cached by _ensureCache when it catches up.
        return days;
    }

    getDaysInMonth(year, monthIndex) {
        let isLeap = this.isLeapYear(year);
        let m = this.config.months[monthIndex];
        return (isLeap && m.leap) ? m.leap : m.days;
    }

    getTimestamp(targetYear, targetMonth, targetDay = 1) {
        // targetMonth is 0-indexed (0 = Jan)
        const SECONDS_IN_DAY = 86400;
        
        // --- OPTIMIZED CALCULATION ---
        this._ensureCache(targetYear);
        let totalDays = this._cache.cumulative[targetYear];

        // Add days for full past months in current year
        const config = this.config;
        for (let m = 0; m < targetMonth; m++) {
            totalDays += config.months[m].days;
            // Leap day for February (or whatever second month is logic)?
            // Wait, logic is usually in getDaysInMonth or similar.
            // Let's rely on standard logic used in getDate maybe? 
            // Or replicate:
            if (config.months[m].leap && config.leapYearRule(targetYear)) {
                totalDays += (config.months[m].leap - config.months[m].days); // Add the extra day(s) difference if any
            }
        }

        // Add days in current month (1-based day input)
        totalDays += (targetDay - 1);

        return totalDays * SECONDS_IN_DAY;
    }

    getWeekdayName(year, month, day) {
        const ts = this.getTimestamp(year, month, day);
        const totalDays = Math.floor(ts / 86400);
        const weekdayOffset = game.settings.get("phils-day-night-cycle", "weekdayOffset") || 0;
        const index = (totalDays + (this.config.weekdayStart || 0) + weekdayOffset) % this.config.weekdays.length;
        // Handle negative result from modulo
        const positiveIndex = (index + this.config.weekdays.length) % this.config.weekdays.length;
        return this.config.weekdays[positiveIndex];
    }

    isRecurringMatch(event, srcY, srcM, srcD, targetY, targetM, targetD) {
        const type = event.recurring;
        if (!type || type === 'none') return false;

        // Check for Exceptions (Exclude Dates)
        if (event.excludeDates && Array.isArray(event.excludeDates)) {
            const targetKey = `${targetY}-${targetM}-${targetD}`;
            if (event.excludeDates.includes(targetKey)) return false;
        }
        
        // Ensure strictly future/current, don't recurse backwards in time
        // (Optional, but usually desirable)
        const startTs = this.getTimestamp(srcY, srcM, srcD);
        const targetTs = this.getTimestamp(targetY, targetM, targetD);
        if (targetTs < startTs) return false;

        // Check for Recurrence End Date (for "Delete Future" logic)
        if (event.untilDate) {
            const [uY, uM, uD] = event.untilDate.split('-').map(Number);
            const untilTs = this.getTimestamp(uY, uM, uD);
            if (targetTs > untilTs) return false;
        }

        if (type === 'daily') return true;

        if (type === 'weekly') {
            const diffDays = Math.floor((targetTs - startTs) / 86400);
            return (diffDays % 7 === 0);
        }

        if (type === 'monthly') {
            // Same Day Number
            return (srcD === targetD);
        }

        if (type === 'yearly') {
            // Same Month and Day
            return (srcM === targetM && srcD === targetD);
        }

        return false;
    }
}
