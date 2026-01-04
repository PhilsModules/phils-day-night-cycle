import { CLIMATE_DATA_DE } from "./climate-data-de.js";
import { CLIMATE_DATA_EN } from "./climate-data-en.js";
import { CalendarSystem } from "./calendar-system.js";
import { CalendarDB } from "./calendar-db.js";

const MODULE_ID = "phils-day-night-cycle";

export class WeatherSystem {

    static getClimateList() {
        const data = (game.i18n.lang === "de") ? CLIMATE_DATA_DE : CLIMATE_DATA_EN;
        const coreClimates = Object.entries(data).reduce((acc, [key, climate]) => {
            acc[key] = climate.name;
            return acc;
        }, {});

        // Merge Custom Climates
        const customClimates = game.settings.get(MODULE_ID, "customClimates") || {};
        const customList = Object.entries(customClimates).reduce((acc, [key, climate]) => {
            acc[key] = climate.name + " (Custom)";
            return acc;
        }, {});

        return { ...coreClimates, ...customList };
    }

    static getCurrentClimate() {
        const key = game.settings.get(MODULE_ID, "climateZone");
        
        // Check Custom First
        const customClimates = game.settings.get(MODULE_ID, "customClimates") || {};
        if (customClimates[key]) {
            return customClimates[key];
        }

        const data = (game.i18n.lang === "de") ? CLIMATE_DATA_DE : CLIMATE_DATA_EN;
        return data[key] || data["marine_west_coast"]; // Fallback
    }

    /**
     * Determines the season based on the calendar date.
     * Uses simplified realistic approximations if no config provided.
     * @param {number} month Month index (0-11)
     * @param {number} day Day (1-based)
     */
    static getSeason(month, day) {
        try {
            // month is 0-based from CalendarSystem, day is 1-based
            const config = game.settings.get(MODULE_ID, "seasonConfig");
            
            // Define fallback if somehow empty
            const defaultSeasons = [
                { id: "spring", month: 2, day: 20 },
                { id: "summer", month: 5, day: 21 },
                { id: "autumn", month: 8, day: 22 },
                { id: "winter", month: 11, day: 21 }
            ];

            // Prepare comparison values (MonthIndex * 100 + Day)
            // We use the configured days.
            const seasons = [];
            for (const [key, val] of Object.entries(config || {})) {
                // Ensure data integrity
                if (val && typeof val.month === 'number' && typeof val.day === 'number') {
                    seasons.push({ id: key, value: (val.month * 100) + val.day });
                }
            }

            // If config is broken, use default
            if (seasons.length < 4) {
                 // Fallback logic could go here, or just populate missing
                 // This happens if user sets weird things, strictly we should trust settings
                 // But let's assume valid config for now or push defaults if empty
                 if (seasons.length === 0) {
                     // Push defaults
                     defaultSeasons.forEach(s => seasons.push({ id: s.id, value: (s.month * 100) + s.day }));
                 }
            }

            // Sort descending by value (Latest in year first)
            seasons.sort((a, b) => b.value - a.value);

            const currentValue = (month * 100) + day;

            // Find the first season start that is before or equal to today
            for (const season of seasons) {
                if (currentValue >= season.value) {
                    return season.id;
                }
            }

            // If we are before the first start date of the year (e.g. Early Jan),
            // we are in the season that started latest in the *previous* year (e.g. Winter in Dec).
            // Which is the first element in our descending list.
            return seasons[0].id;
        } catch (err) {
            console.error("PDNC | Error in getSeason, falling back to spring:", err);
            return "spring";
        }
    }

    static parseTemperature(tempStr) {
        // Matches "X bis Y°C" or "-X to -Y°C"
        // Also handles simple numbers if needed, but data is usually range.
        // Regex for finding two numbers (integers, potentially negative) separated by text
        // Looks for patterns like "-5 bis 2"
        const regex = /(-?\d+)\s*(?:bis|to)\s*(-?\d+)/i;
        const match = tempStr.match(regex);
        if (match) {
            return {
                min: parseInt(match[1]),
                max: parseInt(match[2])
            };
        }
        // Fallback for single number or weird format?
        // If single number "5°C"
        const singleRegex = /(-?\d+)/;
        const singleMatch = tempStr.match(singleRegex);
        if (singleMatch) {
            const val = parseInt(singleMatch[1]);
            return { min: val, max: val };
        }
        return { min: 10, max: 15 }; // Total Fallback
    }

    /**
     * Calculates current temperature based on time of day using a Sine Wave approximation.
     * Coldest at 04:00 (Dawnish), Warmest at 16:00 (Afternoon).
     */
    static getCurrentTemperature() {
        // Get stored weather data
        const weather = game.settings.get(MODULE_ID, "currentWeather");
        if (!weather || !weather.generated) return 0;

        const time = game.time.worldTime;
        const dayLength = 86400;
        const secondsOfDay = time % dayLength;
        const hours = secondsOfDay / 3600;

        // Sine Wave Logic
        // We want Min at 4 (height -1) and Max at 16 (height 1).
        // Period is 24h.
        // Standard Sine: sin(x) starts 0 at 0. Peak 1 at PI/2.
        // We want Peak at 16. 
        // 16 hours = (16/24) * 2PI = 4/3 PI ≈ 4.18 rad
        // Formula: Temp = Avg + (Amp * sin( (Hours - Shift) * Frequency ))
        // Peak of sin(t) is at PI/2.
        // t = (h - shift) * (2PI / 24)
        // We want PI/2 when h=16.
        // (16 - shift) * (PI/12) = PI/2
        // 16 - shift = 6
        // shift = 10.
        // So: sin( (h - 10) * PI/12 )
        // Check 4: (4-10)*PI/12 = -6PI/12 = -PI/2 -> -1 (Min). Correct.
        // Check 16: (16-10)*PI/12 = 6PI/12 = PI/2 -> 1 (Max). Correct.

        const min = weather.tempMin;
        const max = weather.tempMax;
        const avg = (min + max) / 2;
        const amp = (max - min) / 2;
        
        const shift = 10;
        const freq = Math.PI / 12;
        
        const currentTmp = avg + (amp * Math.sin((hours - shift) * freq));
        return Math.round(currentTmp * 10) / 10; // Round to 1 decimal
    }

    /**
     * Generates a weather object based on the current climate and season.
     * Does NOT save to settings or post to chat. Returns data only.
     */
    static generateWeather() {
        const currentWorldTime = game.time.worldTime;
        const calendar = new CalendarSystem();
        const dateData = calendar.getDate(currentWorldTime);
        const climate = this.getCurrentClimate();
        const season = this.getSeason(dateData.month, dateData.day);

        // Default / Fallback structure
        let weatherStore = {
            tempMin: 10,
            tempMax: 15,
            text: "Sunny",
            description: "Default Fallback",
            fx: null,
            generated: true,
            climateName: climate.name,
            seasonName: game.i18n.localize(`PDNC.Season.${season}`),
            seasonId: season
        };

        if (climate.seasons[season] && climate.seasons[season].length > 0) {
            const table = climate.seasons[season];
            const index = Math.floor(Math.random() * table.length);
            const weatherEntry = table[index];

            const text = weatherEntry.text;
            const temps = this.parseTemperature(weatherEntry.temp);

            weatherStore = {
                tempMin: temps.min,
                tempMax: temps.max,
                text: text, // Short text
                description: text, // Currently same as text
                fx: weatherEntry.fx || null,
                generated: true,
                climateName: climate.name,
                seasonName: game.i18n.localize(`PDNC.Season.${season}`),
                seasonId: season
            };
        } else {
            console.warn(`${MODULE_ID} | No weather data for ${climate.name} in ${season}.`);
        }

        return weatherStore;
    }

    /**
     * Applies the given weather data to the system (Settings, Chat, Scene, Calendar).
     * @param {Object} weatherStore 
     */
    static async applyWeather(weatherStore) {
        const currentWorldTime = game.time.worldTime;
        const calendar = new CalendarSystem();
        const dateData = calendar.getDate(currentWorldTime);
        const todayId = `${dateData.year}-${dateData.month}-${dateData.day}`;

        // Save Data
        await game.settings.set(MODULE_ID, "currentWeather", weatherStore);
        await game.settings.set(MODULE_ID, "lastWeatherGenerationTime", currentWorldTime);
        await game.settings.set(MODULE_ID, "lastWeatherDateId", todayId);

        // Post Chat Message
        // We might want to avoid spamming if we are just editing? 
        // The user request implies "Reroll" -> So likely new chat message is desired.
        // If "Editing" existing? Maybe just update?
        // For simplicity, we always post a "Weather Update" for now, or we could check if it changed significantly.
        // Let's just Post.
        const messageContent = await renderTemplate(`modules/${MODULE_ID}/templates/weather-chat.html`, {
            climate: weatherStore.climateName,
            season: weatherStore.seasonName,
            text: weatherStore.description,
            temp: `${weatherStore.tempMin}°C - ${weatherStore.tempMax}°C`, // Re-formatting might be needed if original string lost
            date: `${dateData.weekday}, ${dateData.day}. ${dateData.monthName} ${dateData.year}`
        });

        // Create Chat Message
        ChatMessage.create({
            user: game.user.id,
            speaker: { alias: game.i18n.localize("PDNC.WeatherForecast") },
            content: messageContent,
            flags: { [MODULE_ID]: { isWeather: true } }
        });
        
        console.log(`${MODULE_ID} | Applied weather for ${todayId}:`, weatherStore);

        // Update Scene Weather (if canvas is ready)
        if (canvas && canvas.scene) {
             let fxEffect = weatherStore.fx;
             if (fxEffect === "storm") fxEffect = "rain"; // Fallback for core
             await canvas.scene.update({ weather: fxEffect });
        }

        // Log to Calendar
        try {
            const events = await CalendarDB.getEvents();
            const dateKey = `${dateData.year}-${dateData.month}-${dateData.day}`;

            if (!events[dateKey]) events[dateKey] = [];
            
            const reportTitle = game.i18n.localize("PDNC.WeatherReport");
            const existingIndex = events[dateKey].findIndex(e => e.title === reportTitle);

            const weatherContent = `${weatherStore.description}\n${weatherStore.seasonName} | ${weatherStore.climateName}\nTemp: ${weatherStore.tempMin}°C — ${weatherStore.tempMax}°C`;

            const eventData = {
                title: reportTitle,
                description: weatherContent,
                type: "event", // Public
                author: game.user.id,
                timestamp: Date.now()
            };

            if (existingIndex >= 0) {
                events[dateKey][existingIndex] = eventData;
            } else {
                events[dateKey].push(eventData);
            }

            await CalendarDB.saveEvents(events);
        } catch (err) {
            console.error(`${MODULE_ID} | Failed to log weather to calendar:`, err);
        }
    }

    /**
     * Returns the unique ID for the current day (e.g. "2024-5-21")
     * @returns {string}
     */
    static getTodayId() {
        const currentWorldTime = game.time.worldTime;
        const calendar = new CalendarSystem();
        const dateData = calendar.getDate(currentWorldTime);
        return `${dateData.year}-${dateData.month}-${dateData.day}`;
    }

    /**
     * Checks if it's a new day compared to the last weather generation.
     * @returns {boolean}
     */
    static checkForNewDay() {
        const todayId = this.getTodayId();
        const lastGenId = game.settings.get(MODULE_ID, "lastWeatherDateId");
        return todayId !== lastGenId;
    }

    /**
     * Legacy/Automated method. Now primarily used if "Manual/Prompt" is disabled, or to trigger the flow.
     */
    static async generateDailyWeather() {
        if (!game.user.isGM) return;

        if (!this.checkForNewDay()) return;

        // If we are here, it IS a new day.
        // We should just generate and apply IF we are in auto-mode?
        // But we want to support the PROMPT.
        // So this method might be split: "handleNewDay()"
        
        // For backwards compatibility or default auto behavior:
        const weather = this.generateWeather();
        await this.applyWeather(weather);
    }
}

