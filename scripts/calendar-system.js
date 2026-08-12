export class CalendarSystem {
    constructor(systemOverride = null) {
        CalendarSystem.loadCustomCalendars();

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

        const sysName = this.system || "gregorian";
        const sourceConfig = CalendarSystem.SYSTEMS[sysName] || CalendarSystem.SYSTEMS["gregorian"];
        if (!sourceConfig) {
            console.error(`PDNC | No valid calendar system configuration found for '${sysName}'.`);
            return { name: "Fallback", months: [], weekdays: [], leapYearRule: () => false };
        }

        const conf = foundry.utils.deepClone(sourceConfig);
        if (sourceConfig.leapYearRule) {
            conf.leapYearRule = sourceConfig.leapYearRule;
        }
        
        // Localize Months using keys
        // Keys follow format: PDNC.Calendar.<System>.Months.<EnglishName>
        const sysKey = this.system.charAt(0).toUpperCase() + this.system.slice(1);
        const showRealNames = game.settings.get("phils-day-night-cycle", "showRealNames");

        conf.months.forEach(m => {
            const key = `PDNC.Calendar.${sysKey}.Months.${m.name}`;
            let loc = game.i18n.localize(key);
            if (loc === key) loc = m.name; // Fallback to english name if not found

            let plainName = loc;
            let htmlName = loc;

            if (showRealNames) {
                const altKey = `${key}_Alt`;
                const altLoc = game.i18n.localize(altKey);
                if (altLoc && altLoc !== altKey) {
                    plainName = `${loc} (${altLoc})`;
                    htmlName = `<span class="pdnc-nowrap">${loc} <span class="pdnc-alt-name">(${altLoc})</span></span>`;
                }
            }
            m.name = plainName;
            m.nameHtml = htmlName;
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
                    loc = `${loc} (${altLoc})`;
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
        const SECONDS_IN_DAY = 86400;
        let totalDays = Math.floor(worldSeconds / SECONDS_IN_DAY);






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
                monthIndex = this.config.months.length - 1;
                break;
            }
        }

        const weekdayOffset = game.settings.get("phils-day-night-cycle", "weekdayOffset") || 0;
        const totalOffsets = (this.config.weekdayStart || 0) + weekdayOffset;
        // Ensure positive modulo result
        const rawIndex = (Math.floor(worldSeconds / SECONDS_IN_DAY) + totalOffsets) % this.config.weekdays.length;
        const weekdayIndex = (rawIndex + this.config.weekdays.length) % this.config.weekdays.length;

        const timeOfDay = ((worldSeconds % SECONDS_IN_DAY) + SECONDS_IN_DAY) % SECONDS_IN_DAY;
        const hours = Math.floor(timeOfDay / 3600);
        const minutes = Math.floor((timeOfDay % 3600) / 60);
        const seconds = Math.floor(timeOfDay % 60);

        const displayYearNumber = this.toDisplayYear(year);
        const displayYear = this.formatYear(displayYearNumber);

        return {
            year: displayYearNumber,
            displayYear: displayYear,
            month: monthIndex, // 0-indexed
            monthName: CalendarSystem.stripMarkup(this.config.months[monthIndex].name),
            monthNameHtml: this.config.months[monthIndex].nameHtml || this.config.months[monthIndex].name,
            day: totalDays + 1, // 1-indexed (1st, 2nd...)
            weekdayIndex: weekdayIndex,
            weekday: CalendarSystem.stripMarkup(this.config.weekdays[weekdayIndex]),
            hours: hours,
            hour: hours,
            minutes: minutes,
            minute: minutes,
            seconds: seconds,
            second: seconds
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

    /**
     * Safely updates game.time.worldTime to match a specific date and time in the given calendar system.
     * Resets dayOffset and timeOffset settings to 0 so game.time.worldTime becomes the single source of truth.
     * Falls back to setting offset settings if direct worldTime mutation is restricted.
     */
    static async syncWorldTimeToDateTime(calendarSystem, year, month, day, hour = 0, minute = 0) {
        const sys = new CalendarSystem(calendarSystem);
        const daySeconds = sys.getTimestamp(Number(year), Number(month), Number(day));
        const targetSeconds = daySeconds + (Number(hour) * 3600) + (Number(minute) * 60);

        try {
            if (game.user.isGM) {
                const diff = targetSeconds - game.time.worldTime;
                if (diff !== 0) {
                    await game.time.advance(diff);
                }
                await game.settings.set("phils-day-night-cycle", "dayOffset", 0);
                await game.settings.set("phils-day-night-cycle", "timeOffset", 0);
                return { success: true, mode: "worldTime", targetSeconds };
            }
        } catch (err) {
            console.warn("PDNC | Direct worldTime update failed or restricted. Falling back to offset calculation.", err);
        }

        // Fallback offset calculation if direct worldTime mutation fails
        const diffSeconds = targetSeconds - game.time.worldTime;
        const offsetDays = Math.floor(diffSeconds / 86400);
        const remainderSeconds = diffSeconds % 86400;
        const offsetMinutes = Math.round(remainderSeconds / 60);

        await game.settings.set("phils-day-night-cycle", "dayOffset", offsetDays);
        await game.settings.set("phils-day-night-cycle", "timeOffset", offsetMinutes);
        return { success: true, mode: "fallbackOffsets", offsetDays, offsetMinutes };
    }

    /**
     * Detects live date and time from active system clock (e.g. PF2e World Clock, Simple Calendar, or Foundry Core).
     * @returns {Object} { system, year, month, day, hour, minute, second, source }
     */
    static detectActiveSystemDate() {
        // 1. Pathfinder 2e System World Clock
        if (game.system.id === "pf2e" && game.pf2e?.worldClock) {
            try {
                const dt = game.pf2e.worldClock.date;
                if (dt && typeof dt.year === "number") {
                    return {
                        system: "golarion",
                        year: Number(dt.year),
                        month: Number(dt.month) - 1, // 0-based month index
                        day: Number(dt.day),
                        hour: Number(dt.hour || 0),
                        minute: Number(dt.minute || 0),
                        second: Number(dt.second || 0),
                        source: "PF2e World Clock"
                    };
                }
            } catch (e) {
                console.warn("PDNC | Error detecting PF2e World Clock date:", e);
            }
        }

        // 2. Simple Calendar API (if active)
        if (window.SimpleCalendar?.api?.currentDateTime) {
            try {
                const sc = window.SimpleCalendar.api.currentDateTime();
                if (sc && typeof sc.year === "number") {
                    return {
                        system: game.settings.get("phils-day-night-cycle", "calendarSystem") || "gregorian",
                        year: Number(sc.year),
                        month: Number(sc.month),
                        day: Number(sc.day),
                        hour: Number(sc.hour || 0),
                        minute: Number(sc.minute || 0),
                        second: Number(sc.seconds || 0),
                        source: "Simple Calendar"
                    };
                }
            } catch (e) {
                console.warn("PDNC | Error detecting Simple Calendar date:", e);
            }
        }

        // 3. Fallback: Core Foundry World Time
        const currentCal = new CalendarSystem();
        const dateData = currentCal.getDate(game.time.worldTime);
        const secondsInDay = ((game.time.worldTime % 86400) + 86400) % 86400;
        return {
            system: currentCal.system,
            year: dateData.year,
            month: dateData.month,
            day: dateData.day,
            hour: Math.floor(secondsInDay / 3600),
            minute: Math.floor((secondsInDay % 3600) / 60),
            second: secondsInDay % 60,
            source: "Foundry Core"
        };
    }

    /**
     * Pushes PDNC's master clock date & time to Foundry's worldTime — system-independent.
     *
     * Strategy:
     * 1. ALWAYS set game.time.worldTime = PDNC's natural calendar seconds.
     *    This ensures PDNC widget, day/night cycle and weather all work correctly for ALL systems.
     * 2. For PF2e: ADDITIONALLY install the date getter override on game.pf2e.worldClock
     *    so PF2e's WorldClock window shows PDNC's date.
     *    (We cannot change worldCreatedOn, so this is the only PF2e-compatible approach.)
     */
    static async pushPDNCDateToSystem(calendarSystem, year, month, day, hour = 0, minute = 0) {
        if (!game.user.isGM) return { success: false, error: "Not GM" };

        // Step 1: Set worldTime to PDNC natural calendar seconds (works for ALL systems)
        const result = await CalendarSystem.syncWorldTimeToDateTime(calendarSystem, year, month, day, hour, minute);

        // Step 2: PF2e-specific: install date getter override so PF2e's World Clock window
        // reads PDNC's date (since worldCreatedOn cannot be changed in current PF2e).
        if (game.system.id === "pf2e") {
            try {
                CalendarSystem.syncPF2eClockToPDNC();

                // Set dateTheme to Absalom Reckoning if available
                if (game.settings.settings.has("pf2e.worldClock.dateTheme")) {
                    const currentTheme = game.settings.get("pf2e", "worldClock.dateTheme");
                    if (currentTheme !== "AR") {
                        await game.settings.set("pf2e", "worldClock.dateTheme", "AR");
                        console.log("PDNC | Set PF2e dateTheme to AR (Absalom Reckoning).");
                    }
                }

                // Re-render PF2e World Clock window only if it is already open
                if (game.pf2e?.worldClock?.rendered) {
                    game.pf2e.worldClock.render(true);
                }
            } catch (e) {
                console.warn("PDNC | Could not apply PF2e-specific display override:", e);
            }
        }

        return result;
    }


    /**
     * Synchronizes Pathfinder 2e's native worldCreatedOn setting and worldTime
     * so PF2e's internal clock engine, active effects, spell durations, and UI
     * natively evaluate to PDNC's master calendar date & time in the background.
     */
    static async syncPF2eClockToPDNC() {
        if (game.system.id !== "pf2e") return;

        try {
            const MODULE_ID = "phils-day-night-cycle";
            const activeSys = game.settings.get(MODULE_ID, "calendarSystem") || "golarion";
            const sys = (window.dayNightCycle && window.dayNightCycle.calendar) ? window.dayNightCycle.calendar : new CalendarSystem(activeSys);

            const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
            const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
            const totalTime = game.time.worldTime + (offsetDays * 86400) + (offsetMinutes * 60);

            const pdncDate = sys.getDate(totalTime);

            // 1. Calculate Luxon DateTime for PDNC master date
            // In Absalom Reckoning (AR), PF2e adds 2700 years to the Luxon ISO year (4720 AR = 2020 ISO)
            let isoYear = pdncDate.year;
            if (isoYear > 2700) isoYear -= 2700;

            const pad = (n) => String(n).padStart(2, "0");
            const isoMonth = pad(pdncDate.month + 1);
            const isoDay = pad(pdncDate.day);
            const isoHour = pad(pdncDate.hour ?? pdncDate.hours ?? 0);
            const isoMin = pad(pdncDate.minute ?? pdncDate.minutes ?? 0);
            const isoSec = pad(pdncDate.second ?? pdncDate.seconds ?? 0);

            const targetIso = `${String(isoYear).padStart(4, "0")}-${isoMonth}-${isoDay}T${isoHour}:${isoMin}:${isoSec}.000Z`;

            if (window.luxon?.DateTime) {
                const targetDt = window.luxon.DateTime.fromISO(targetIso);

                if (game.user.isGM && targetDt.isValid) {
                    const createdOnDt = targetDt.minus({ seconds: game.time.worldTime });
                    const newCreatedOnIso = createdOnDt.toISOString();

                    if (game.settings.settings.has("pf2e.worldClock")) {
                        try {
                            const clock = game.settings.get("pf2e", "worldClock");
                            if (clock && typeof clock === "object") {
                                await game.settings.set("pf2e", "worldClock", {
                                    ...clock,
                                    worldCreatedOn: newCreatedOnIso,
                                    dateTheme: "AR"
                                });
                            }
                        } catch (e) {}
                    }

                    if (game.settings.settings.has("pf2e.worldClock.worldCreatedOn")) {
                        try {
                            await game.settings.set("pf2e", "worldClock.worldCreatedOn", newCreatedOnIso);
                        } catch (e) {}
                    }

                    if (game.settings.settings.has("pf2e.worldCreatedOn")) {
                        try {
                            await game.settings.set("pf2e", "worldCreatedOn", newCreatedOnIso);
                        } catch (e) {}
                    }

                    if (game.settings.settings.has("pf2e.worldClock.dateTheme")) {
                        try {
                            await game.settings.set("pf2e", "worldClock.dateTheme", "AR");
                        } catch (e) {}
                    }
                }
            }

            // 3. Fallback getter hook on game.pf2e.worldClock and prototypes
            if (game.pf2e?.worldClock) {
                const getterSpec = {
                    get: function () {
                        if (window.luxon?.DateTime) {
                            return window.luxon.DateTime.fromISO(targetIso);
                        }
                        return null;
                    },
                    configurable: true,
                    enumerable: true
                };

                try { Object.defineProperty(game.pf2e.worldClock, "date", getterSpec); } catch (e) {}
                const proto = Object.getPrototypeOf(game.pf2e.worldClock);
                if (proto) {
                    try { Object.defineProperty(proto, "date", getterSpec); } catch (e) {}
                }
            }

            // Re-render PF2e World Clock app only if currently open
            if (game.pf2e?.worldClock?.rendered) {
                game.pf2e.worldClock.render(true);
            }
            if (ui.windows) {
                Object.values(ui.windows).forEach(w => {
                    if (w && w.rendered && w.constructor && (w.constructor.name === "WorldClock" || w.id === "world-clock")) {
                        w.render(true);
                    }
                });
            }

            CalendarSystem.hookWorldClockRender();
        } catch (e) {
            console.warn("PDNC | Could not sync native PF2e world clock:", e);
        }
    }

    /**
     * Reset any window title modifications to ensure PF2e World Clock window frame is clean.
     */
    static hookWorldClockRender() {
        if (this._pf2eHooked) return;
        this._pf2eHooked = true;

        Hooks.on("renderWorldClock", (app, html, data) => {
            try {
                const root = (html instanceof HTMLElement) ? html : (html[0] || document);
                const winTitle = root.querySelector(".window-title");
                if (winTitle && (winTitle.textContent.includes("AR") || winTitle.textContent.includes("AK") || winTitle.textContent.includes("Erastus") || winTitle.textContent.includes("Sarenith"))) {
                    winTitle.textContent = game.i18n.localize("PF2E.WorldClock.Title") || "Weltuhr";
                }
            } catch (e) {}
        });
    }

    /**
     * Forces Pathfinder 2e's World Clock settings and date display to align 100% with PDNC's date.
     */
    static async alignPF2eClockToPDNC(targetYear = 4720, targetMonth1 = 7, targetDay = 8, targetHour = 20, targetMinute = 1) {
        if (!game.user.isGM) return;

        try {
            console.log(`PDNC | Aligning System World Time (${targetYear}-${targetMonth1}-${targetDay} ${targetHour}:${targetMinute})...`);

            const pad = (n) => String(n).padStart(2, "0");
            const isoYear = Number(targetYear) > 2700 ? Number(targetYear) - 2700 : Number(targetYear);
            const isoString = `${String(isoYear).padStart(4, "0")}-${pad(targetMonth1)}-${pad(targetDay)}T${pad(targetHour)}:${pad(targetMinute)}:00.000Z`;

            if (window.luxon?.DateTime) {
                const targetDt = window.luxon.DateTime.fromISO(isoString);
                if (targetDt.isValid) {
                    const createdOnDt = targetDt.minus({ seconds: game.time.worldTime });
                    const newCreatedOnIso = createdOnDt.toISOString();

                    try {
                        const clock = game.settings.get("pf2e", "worldClock");
                        if (clock && typeof clock === "object") {
                            await game.settings.set("pf2e", "worldClock", {
                                ...clock,
                                worldCreatedOn: newCreatedOnIso,
                                dateTheme: "AR"
                            });
                        }
                    } catch (e) {}

                    try {
                        await game.settings.set("pf2e", "worldClock.worldCreatedOn", newCreatedOnIso);
                    } catch (e) {}

                    try {
                        await game.settings.set("pf2e", "worldClock.dateTheme", "AR");
                    } catch (e) {}
                }
            }

            await game.settings.set("phils-day-night-cycle", "dayOffset", 0);
            await game.settings.set("phils-day-night-cycle", "timeOffset", 0);

            await CalendarSystem.syncPF2eClockToPDNC();

            return { success: true };
        } catch (err) {
            console.error("PDNC | Error aligning World Clock to PDNC:", err);
            return { success: false, error: err };
        }
    }
}
