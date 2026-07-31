export class CalendarSystem {
    constructor(systemOverride = null) {
        // Ensure Custom Calendars are loaded into SYSTEMS (if not already)
        // This is a bit hacky to do in constructor, but ensures it's available.
        // Better: Do it on main init. But let's check here too.
        CalendarSystem.loadCustomCalendars();

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

        const sourceConfig = CalendarSystem.SYSTEMS[this.system];
        const conf = foundry.utils.deepClone(sourceConfig);
        conf.leapYearRule = sourceConfig.leapYearRule;
        
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

        const globalYearPrefix = game.settings.get("phils-day-night-cycle", "yearPrefix");
        const globalYearPostfix = game.settings.get("phils-day-night-cycle", "yearPostfix");
        const globalNegativeYearPrefix = game.settings.get("phils-day-night-cycle", "negativeYearPrefix");
        const globalNegativeYearPostfix = game.settings.get("phils-day-night-cycle", "negativeYearPostfix");

        conf.yearPrefix = String(conf.yearPrefix ?? conf.prefix ?? globalYearPrefix ?? "").trim();
        conf.yearPostfix = String(conf.yearPostfix ?? conf.postfix ?? globalYearPostfix ?? "").trim();
        conf.negativeYearPrefix = String(conf.negativeYearPrefix ?? conf.negativePrefix ?? globalNegativeYearPrefix ?? "").trim();
        conf.negativeYearPostfix = String(conf.negativeYearPostfix ?? conf.negativePostfix ?? globalNegativeYearPostfix ?? "").trim();

        this._configCache = conf;
        return conf;
    }

    static stripMarkup(value) {
        return String(value ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    }

    static formatTime(hours, minutes) {
        const use12Hour = game.settings.get("phils-day-night-cycle", "use12HourFormat");
        if (use12Hour) {
            let period = "AM";
            let h = parseInt(hours, 10);
            if (h >= 12) {
                period = "PM";
                if (h > 12) h -= 12;
            } else if (h === 0) {
                h = 12;
            }
            return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    static parseDateKey(dateKey) {
        const match = String(dateKey ?? "").match(/^(-?\d+)-(\d+)-(\d+)$/);
        if (!match) return null;

        return {
            year: Number(match[1]),
            month: Number(match[2]),
            day: Number(match[3])
        };
    }

    static formatDateKey(year, month, day) {
        return `${Number(year)}-${Number(month)}-${Number(day)}`;
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
            },
            vikingar: {
                name: "Víkingar",
                description: "Viking lunisolar calendar (Misseri).",
                months: [
                    { name: "Gormanudur", days: 30 },
                    { name: "Ylir", days: 30 },
                    { name: "Morsugur", days: 30 },
                    { name: "Thorri", days: 30 },
                    { name: "Goa", days: 30 },
                    { name: "Einmanudur", days: 30 },
                    { name: "Harpa", days: 30 },
                    { name: "Skerpla", days: 30 },
                    { name: "Solmanudur", days: 34 },
                    { name: "Sumarauki", days: 0, leap: 7 },
                    { name: "Heyannir", days: 30 },
                    { name: "Tvimanudur", days: 30 },
                    { name: "Haustmanudur", days: 30 }
                ],
                weekdays: ["Sunnudagr", "Manadagr", "Tyrsdagr", "Odinsdagr", "Thorsdagr", "Frjadagr", "Laugardagr"],
                leapYearRule: (year) => {
                    // Viking leap year (Sumarauki) happens roughly every 5-6 years.
                    // A simple approximation for a 364-day-based year to stay in sync
                    // with the 365.2422 solar year.
                    // (365.25 - 364) = 1.25 days deficit per year.
                    // 7 days / 1.25 = 5.6 years.
                    // Common rule used in some reconstructions: Year is leap if (year * 11 + 6) % 28 < 11
                    // But for simplicity in RPGs, often 5-year cycles or specific rules are used.
                    // Let's use a common cyclic rule:
                    return ((year * 11) % 60) < 11; 
                },
                yearZero: 0,
                weekdayStart: 0
            }
        };

    static loadCustomCalendars() {
        const customs = game.settings.get("phils-day-night-cycle", "customCalendars") || {};
        for (const [id, data] of Object.entries(customs)) {
            // Validate data structure lightly
            if (!data.months || !data.weekdays) continue;
            
            // Convert leapYearRule to function
            let leapFunc = (y) => false;
            if (data.leapYearRule === 'gregorian') {
                leapFunc = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            } else if (data.leapYearRule === 'every4') {
                leapFunc = (year) => (year % 4 === 0);
            }
            
            CalendarSystem.SYSTEMS[id] = {
                name: data.name,
                description: data.description || "Custom Calendar",
                months: data.months, // { name, days, leap? }
                weekdays: data.weekdays,
                leapYearRule: leapFunc,
                yearZero: data.yearZero || 0,
                weekdayStart: data.weekdayStart || 0,
                yearPrefix: data.yearPrefix ?? data.prefix ?? "",
                yearPostfix: data.yearPostfix ?? data.postfix ?? "",
                negativeYearPrefix: data.negativeYearPrefix ?? data.negativePrefix ?? "",
                negativeYearPostfix: data.negativeYearPostfix ?? data.negativePostfix ?? ""
            };
        }
    }

    formatYear(year) {
        const config = this.config;
        const isNegative = year < 0;
        const prefix = isNegative ? config.negativeYearPrefix : config.yearPrefix;
        const postfix = isNegative ? config.negativeYearPostfix : config.yearPostfix;
        const numericYear = (isNegative && (prefix || postfix)) ? Math.abs(year) : year;

        return [prefix, numericYear, postfix].filter(part => part !== "" && part !== null && part !== undefined).join(" ");
    }

    formatDate(date, options = {}) {
        const {
            includeWeekday = false,
            multiline = false,
            plainText = false
        } = options;

        const year = Number(date?.year ?? 0);
        const month = Number(date?.month ?? 0);
        const day = Number(date?.day ?? 1);
        const monthNameSource = date?.monthName ?? this.config.months[month]?.name ?? "";
        const weekdaySource = date?.weekday ?? this.getWeekdayName(year, month, day);

        const monthName = plainText ? CalendarSystem.stripMarkup(monthNameSource) : monthNameSource;
        const weekday = plainText ? CalendarSystem.stripMarkup(weekdaySource) : weekdaySource;
        const yearText = this.formatYear(year);
        const dayText = `${day}.`;
        const dateText = `${dayText} ${monthName} ${yearText}`.replace(/\s+/g, " ").trim();

        if (!includeWeekday) return dateText;
        if (multiline) return `${weekday}, ${dayText}<br>${monthName} ${yearText}`.replace(/\s+<br>/g, "<br>");
        return `${weekday}, ${dateText}`;
    }

    toInternalYear(year) {
        return Number(year ?? 0) - (this.config.yearZero || 0);
    }

    toDisplayYear(internalYear) {
        return Number(internalYear ?? 0) + (this.config.yearZero || 0);
    }

    _getDaysInInternalYear(internalYear) {
        const displayYear = this.toDisplayYear(internalYear);
        const isLeap = this.isLeapYear(displayYear);
        return this.config.months.reduce((sum, month) => sum + ((isLeap && month.leap) ? month.leap : month.days), 0);
    }

    _getDaysInInternalMonth(internalYear, monthIndex) {
        const displayYear = this.toDisplayYear(internalYear);
        const isLeap = this.isLeapYear(displayYear);
        const month = this.config.months[monthIndex];
        return (isLeap && month.leap) ? month.leap : month.days;
    }

    _getTotalDaysBeforeInternalYear(internalYear) {
        if (internalYear >= 0) {
            this._ensureCache(internalYear);
            return this._cache.cumulative[internalYear] ?? 0;
        }

        let total = 0;
        for (let year = internalYear; year < 0; year++) {
            total -= this._getDaysInInternalYear(year);
        }

        return total;
    }

    _ensureCache(targetYear) {
        if (targetYear <= this._cache.maxCachedYear) return;
        
        // Build cache from current max up to target
        let currentTotal = this._cache.cumulative[this._cache.cumulative.length - 1];
        
        for (let y = this._cache.maxCachedYear + 1; y <= targetYear; y++) {
            const days = this._getDaysInInternalYear(y);
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
        let year = 0;

        if (totalDays >= 0) {
            const estimatedYear = Math.floor(totalDays / Math.max(minDays, 1));
            this._ensureCache(estimatedYear + 2); // Buffer to ensure cumulative[estimatedYear+1] exists

            // Binary Search on cumulative array to find the year
            let low = 0;
            let high = this._cache.maxCachedYear + 1; // Search up to maxCachedYear + 1 for cumulative array

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
        } else {
            year = -1;
            let yearStart = -this._getDaysInInternalYear(year);

            while (totalDays < yearStart) {
                year--;
                yearStart -= this._getDaysInInternalYear(year);
            }

            totalDays -= yearStart;
        }

        // Calculate Month (Standard Logic)
        let monthIndex = 0;

        while (true) {
            let monthData = this.config.months[monthIndex];
            let daysInThisMonth = this._getDaysInInternalMonth(year, monthIndex);

            if (totalDays < daysInThisMonth) {
                break;
            }

            totalDays -= daysInThisMonth;
            monthIndex++;
            if (monthIndex >= this.config.months.length) {
                break;
            }
        }

        const weekdayOffset = game.settings.get("phils-day-night-cycle", "weekdayOffset") || 0;
        const totalOffsets = (this.config.weekdayStart || 0) + weekdayOffset;

        // Ensure positive modulo result
        const rawIndex = (Math.floor(worldSeconds / SECONDS_IN_DAY) + totalOffsets) % this.config.weekdays.length;
        const weekdayIndex = (rawIndex + this.config.weekdays.length) % this.config.weekdays.length;

        // The monthName and weekday are already localized by the config getter
        const displayYearNumber = this.toDisplayYear(year);
        const displayYear = this.formatYear(displayYearNumber);
        return {
            year: displayYearNumber,
            displayYear: displayYear,
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
        return this._getDaysInInternalYear(this.toInternalYear(year));
    }

    getDaysInMonth(year, monthIndex) {
        return this._getDaysInInternalMonth(this.toInternalYear(year), monthIndex);
    }

    getTimestamp(targetYear, targetMonth, targetDay = 1) {
        // targetMonth is 0-indexed (0 = Jan)
        const SECONDS_IN_DAY = 86400;
        
        const internalYear = this.toInternalYear(targetYear);
        let totalDays = this._getTotalDaysBeforeInternalYear(internalYear);

        // Add days for full past months in current year
        for (let m = 0; m < targetMonth; m++) {
            totalDays += this._getDaysInInternalMonth(internalYear, m);
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
            const untilDate = CalendarSystem.parseDateKey(event.untilDate);
            if (untilDate) {
                const untilTs = this.getTimestamp(untilDate.year, untilDate.month, untilDate.day);
                if (targetTs > untilTs) return false;
            }
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
