export class CalendarSystem {
    constructor() {
        this.system = game.settings.get("phils-day-night-cycle", "calendarSystem") || "gregorian";
    }

    get config() {
        return CalendarSystem.SYSTEMS[this.system];
    }

    static get SYSTEMS() {
        return {
            gregorian: {
                name: "Gregorian (Standard)",
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
                weekdays: ["Firstday", "Seconday", "Thirdday", "Middleday", "Fifthday", "Sixthday", "Seventhday"], // Generic or custom names
                leapYearRule: (year) => (year % 4 === 0)
            },
            simple: {
                name: "Simple (30 Days)",
                months: Array.from({ length: 12 }, (_, i) => ({ name: `Month ${i + 1}`, days: 30 })),
                weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                leapYearRule: () => false
            },
            magaambya: {
                name: "Magaambya (Mwangi)",
                months: [
                    { name: "Falke", days: 28 },
                    { name: "Schlange", days: 28 },
                    { name: "Jatembe", days: 36 },
                    { name: "Leopard", days: 28 },
                    { name: "Shory", days: 28 },
                    { name: "Elefant", days: 35 },
                    { name: "Hyäne", days: 28 },
                    { name: "Frosch", days: 28 },
                    { name: "Steinbock", days: 35, leap: 36 },
                    { name: "Stier", days: 28 },
                    { name: "Spinne", days: 28 },
                    { name: "Magaambya", days: 35 }
                ],
                weekdays: ["Mondtag", "Mühtag", "Wohltag", "Schwurtag", "Feuertag", "Sterntag", "Sonntag"],
                leapYearRule: (year) => (year % 4 === 0),
                yearZero: 2700,
                weekdayStart: 6
            }
        };
    }

    getDate(worldSeconds) {
        // Assume Year 0 starts at 0 seconds for simplicity, or handle offset?
        // Foundry time usually implies 0 = start of world.
        // Let's calculate purely from total seconds.

        const SECONDS_IN_DAY = 86400;
        let totalDays = Math.floor(worldSeconds / SECONDS_IN_DAY);

        let year = 0;
        let daysInYear = this.getDaysInYear(year);

        // Calculate Year
        // Optimization: Estimate years to skip large loops if totalDays is huge?
        // For now, simple loop is safer for varied leap rules unless performance issues arise.
        // Actually, for Golarion/Gregorian roughly 365.25.
        while (totalDays >= daysInYear) {
            totalDays -= daysInYear;
            year++;
            daysInYear = this.getDaysInYear(year);
        }

        // Calculate Month
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
                // Should not happen if daysInYear is correct, but safety break
                break;
            }
        }

        const weekdayIndex = (Math.floor(worldSeconds / SECONDS_IN_DAY) + (this.config.weekdayStart || 0)) % this.config.weekdays.length;

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
        let isLeap = this.isLeapYear(year);
        return this.config.months.reduce((sum, m) => sum + ((isLeap && m.leap) ? m.leap : m.days), 0);
    }

    getDaysInMonth(year, monthIndex) {
        let isLeap = this.isLeapYear(year);
        let m = this.config.months[monthIndex];
        return (isLeap && m.leap) ? m.leap : m.days;
    }

    getTimestamp(targetYear, targetMonth, targetDay = 1) {
        // targetMonth is 0-indexed (0 = Jan)
        const SECONDS_IN_DAY = 86400;
        let totalDays = 0;

        // Add days for full past years
        for (let y = 0; y < targetYear; y++) {
            totalDays += this.getDaysInYear(y);
        }

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
}
