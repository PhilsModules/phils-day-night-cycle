import { CLIMATE_DATA_DE } from "./climate-data-de.js";
import { CLIMATE_DATA_EN } from "./climate-data-en.js";
import { CalendarSystem } from "./calendar-system.js";
import { CalendarDB } from "./calendar-db.js";
import { collectWeatherTags, ensureWeatherSemantics } from "./weather-tags.js";
import { WeatherRulesRegistry } from "./weather-rules.js";

const MODULE_ID = "phils-day-night-cycle";

export class WeatherSystem {

    static getClimateList() {
        const data = (game.i18n.lang === "de") ? CLIMATE_DATA_DE : CLIMATE_DATA_EN;
        const coreClimates = Object.entries(data).reduce((acc, [key, climate]) => {
            acc[key] = climate.data.name;
            return acc;
        }, {});

        // Merge Custom Climates
        const customClimates = game.settings.get(MODULE_ID, "customClimates") || {};
        const customList = Object.entries(customClimates).reduce((acc, [key, climate]) => {
            acc[key] = (climate.data?.name || climate.name) + " (Custom)";
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

    static getClimateData(key) {
        const data = (game.i18n.lang === "de") ? CLIMATE_DATA_DE : CLIMATE_DATA_EN;
        return data[key];
    }

    /**
     * Validates the current climate setting on startup.
     * If the ID is invalid (e.g. deleted), resets to default.
     */
    static async validateSettings() {
        if (!game.user.isGM) return;

        const currentKey = game.settings.get(MODULE_ID, "climateZone");
        const availableClimates = this.getClimateList();

        if (!availableClimates[currentKey]) {
            console.warn(`${MODULE_ID} | Active Climate Zone '${currentKey}' not found. Resetting to default.`);
            ui.notifications.warn("PDNC | Active Climate Zone not found. Resetting to default.");
            await game.settings.set(MODULE_ID, "climateZone", "marine_west_coast");
            
            // Also invalidate current weather if it was generated from the missing climate
            const weather = game.settings.get(MODULE_ID, "currentWeather");
            if (weather && weather.generated) {
                // We force a regeneration or just let the next cycle handle it.
                // But safer to reset description so it doesn't show "Old Climate Name".
                weather.climateName = "Marine West Coast";
                await game.settings.set(MODULE_ID, "currentWeather", weather);
            }
        }
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

            // If config is incomplete (fewer than 4 seasons), fill missing entries from defaults
            if (seasons.length < 4) {
                for (const def of defaultSeasons) {
                    if (!seasons.some(s => s.id === def.id)) {
                        seasons.push({ id: def.id, value: (def.month * 100) + def.day });
                    }
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
        if (!tempStr || typeof tempStr !== "string") return { min: 10, max: 15 };
        const regex = /(-?\d+)\s*(?:bis|to)\s*(-?\d+)/i;
        const match = tempStr.match(regex);
        if (match) {
            return {
                min: parseInt(match[1]),
                max: parseInt(match[2])
            };
        }
        const singleRegex = /(-?\d+)/;
        const singleMatch = tempStr.match(singleRegex);
        if (singleMatch) {
            const val = parseInt(singleMatch[1]);
            return { min: val, max: val };
        }
        return { min: 10, max: 15 };
    }

    static getTemperatureRange(entry, seasonStr) {
        if (typeof entry === "string") {
            const climateZone = entry;
            const season = seasonStr || "spring";
            const data = (game.i18n.lang === "de") ? CLIMATE_DATA_DE : CLIMATE_DATA_EN;
            const climateObj = data[climateZone] || data["marine_west_coast"];
            entry = climateObj?.seasons?.[season] || climateObj?.seasons?.["spring"] || {};
        }
        if (!entry) entry = {};
        if (typeof entry.temp === "object" && entry.temp !== null) {
            return {
                minC: entry.temp.minC,
                maxC: entry.temp.maxC,
                minF: entry.temp.minF,
                maxF: entry.temp.maxF
            };
        }
        
        const temps = this.parseTemperature(entry.temp);
        return {
            minC: temps.min,
            maxC: temps.max,
            minF: Math.round((temps.min * 9/5) + 32),
            maxF: Math.round((temps.max * 9/5) + 32)
        };
    }

    /**
     * Calculates current temperature based on time of day using a Sine Wave approximation.
     * Coldest at 04:00 (Dawnish), Warmest at 16:00 (Afternoon).
     *
     * FIX (Issue #35): Now uses the same time normalization as LightingSystem.calculateDarkness():
     *   - timeOffset is applied before calculation
     *   - Safe positive modulo ((x % n + n) % n) prevents negative worldTime values
     *     (e.g. from the Golarion/PF2e calendar) from landing on the wrong point of the sine wave.
     */
    static getCurrentTemperature() {
        // Get stored weather data
        const weather = game.settings.get(MODULE_ID, "currentWeather");
        if (!weather || !weather.generated) return 0;

        const time = game.time.worldTime;
        const dayLength = 86400;

        const timeOffset = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const adjustedTime = time + (timeOffset * 60);
        const currentSeconds = ((adjustedTime % dayLength) + dayLength) % dayLength;
        const hours = currentSeconds / 3600;

        const unit = game.settings.get(MODULE_ID, "temperatureUnit") || "C";
        
        let min, max;
        if (unit === "F") {
            if (weather.tempMinF !== undefined) {
                min = weather.tempMinF;
                max = weather.tempMaxF;
            } else {
                const baseMin = weather.tempMinC ?? weather.tempMin ?? 10;
                const baseMax = weather.tempMaxC ?? weather.tempMax ?? 20;
                min = (baseMin * 9/5) + 32;
                max = (baseMax * 9/5) + 32;
            }
        } else {
            min = weather.tempMinC ?? weather.tempMin ?? 10;
            max = weather.tempMaxC ?? weather.tempMax ?? 20;
        }

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
        let currentWorldTime = game.time.worldTime;
        
        // Apply Offsets
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        currentWorldTime += (offsetMinutes * 60);
        currentWorldTime += (offsetDays * 86400);

        const calendar = new CalendarSystem();
        const dateData = calendar.getDate(currentWorldTime);
        const climate = this.getCurrentClimate();
        const season = this.getSeason(dateData.month, dateData.day);

        // Default / Fallback structure
        let weatherStore = {
            tempMin: 10,
            tempMax: 15,
            tempMinC: 10,
            tempMaxC: 15,
            tempMinF: 50,
            tempMaxF: 59,
            text: "Sunny",
            description: "Default Fallback",
            fx: null,
            generated: true,
            climateName: climate.data.name,
            img: climate.data.img,
            seasonName: game.i18n.localize(`PDNC.Season.${season}`),
            seasonId: season
        };

        if (climate.data.seasons[season] && climate.data.seasons[season].length > 0) {
            const table = climate.data.seasons[season];
            const index = Math.floor(Math.random() * table.length);
            const weatherEntry = table[index];

            const text = weatherEntry.text;
            const temps = this.getTemperatureRange(weatherEntry);

            weatherStore = {
                tempMin: temps.minC,
                tempMax: temps.maxC,
                tempMinC: temps.minC,
                tempMaxC: temps.maxC,
                tempMinF: temps.minF,
                tempMaxF: temps.maxF,
                text: text, // Short text
                description: text, // Currently same as text
                fx: (Array.isArray(weatherEntry.fx) && weatherEntry.fx.length > 0) ? weatherEntry.fx[0] : null,
                fxList: Array.isArray(weatherEntry.fx) ? [...weatherEntry.fx] : [],
                tags: collectWeatherTags({
                    tags: weatherEntry.tags,
                    fx: weatherEntry.fx,
                    tempMin: temps.minC,
                    tempMax: temps.maxC
                }),
                generated: true,
                climateName: climate.data.name,
                img: climate.data.img,
                seasonName: game.i18n.localize(`PDNC.Season.${season}`),
                seasonId: season
            };
        } else {
            console.warn(`${MODULE_ID} | No weather data for ${climate.data.name} in ${season}.`);
        }

        return weatherStore;
    }

    /**
     * Re-applies the current weather settings (useful when toggling display modes).
     */
    static async refreshWeather() {
        const weather = game.settings.get(MODULE_ID, "currentWeather");
        if (weather) {
            await this.applyWeather(weather);
        }
    }

    /**
     * Applies the given weather data to the system (Settings, Chat, Scene, Calendar).
     * @param {Object} weatherStore 
     */
    static async applyWeather(weatherStore) {
        weatherStore = ensureWeatherSemantics(weatherStore);
        let currentWorldTime = game.time.worldTime;

        // Apply Offsets
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        currentWorldTime += (offsetMinutes * 60);
        currentWorldTime += (offsetDays * 86400);

        const calendar = new CalendarSystem();
        const dateData = calendar.getDate(currentWorldTime);
        const todayId = `${dateData.year}-${dateData.month}-${dateData.day}`;

        // Save Data
        await game.settings.set(MODULE_ID, "currentWeather", weatherStore);
        await game.settings.set(MODULE_ID, "lastWeatherGenerationTime", currentWorldTime);
        await game.settings.set(MODULE_ID, "lastWeatherDateId", todayId);

        // Post Chat Message
        const unit = game.settings.get(MODULE_ID, "temperatureUnit") || "C";
        let tempString = `${weatherStore.tempMin}°C - ${weatherStore.tempMax}°C`;
        if (unit === "F") {
            // Use F values if present, else calc
            const min = weatherStore.tempMinF !== undefined ? weatherStore.tempMinF : Math.round((weatherStore.tempMin * 9/5) + 32);
            const max = weatherStore.tempMaxF !== undefined ? weatherStore.tempMaxF : Math.round((weatherStore.tempMax * 9/5) + 32);
            tempString = `${min}°F - ${max}°F`;
        }

        const rulesEnabled = game.settings.get(MODULE_ID, "weatherRuleNotesEnabled");
        const weatherRules = rulesEnabled
            ? await WeatherRulesRegistry.collect(weatherStore, {
                dateData,
                dateLabel: `${dateData.weekday}, ${dateData.day}. ${dateData.monthName} ${dateData.year}`,
                todayId
            })
            : { publicSections: [], gmSections: [] };

        const messageContent = await foundry.applications.handlebars.renderTemplate(`modules/${MODULE_ID}/templates/weather-chat.html`, {
            climate: weatherStore.climateName,
            season: weatherStore.seasonName,
            text: weatherStore.description,
            temp: tempString,
            img: weatherStore.img,
            date: `${dateData.weekday}, ${dateData.day}. ${dateData.monthName} ${dateData.year}`,
            publicRulesSections: weatherRules.publicSections,
            gmRulesSections: weatherRules.gmSections,
            hasPublicRules: weatherRules.publicSections.length > 0,
            hasGmRules: weatherRules.gmSections.length > 0,
            rulesTitle: game.i18n.localize("PDNC.WeatherRules.ChatTitle"),
            gmRulesTitle: game.i18n.localize("PDNC.WeatherRules.ChatTitleGM")
        });

        // Create Chat Message
        ChatMessage.create({
            user: game.user.id,
            speaker: { alias: game.i18n.localize("PDNC.WeatherForecast") },
            content: messageContent,
            flags: { [MODULE_ID]: { isWeather: true } }
        });

        // Update All Scenes Weather
        let fxEffect = weatherStore.fx;
        const updates = [];
        // Iterate over all scenes to ensure consistent weather
        game.scenes.forEach(scene => {
            // Dungeon Mode Check
            if (scene.getFlag(MODULE_ID, "disableWeather")) return;
            
            updates.push({ _id: scene.id, weather: fxEffect });
        });
        
        if (updates.length > 0) {
             await Scene.updateDocuments(updates);
        }

        // Notify HUDs
        Hooks.callAll("pdnc.weatherUpdated", weatherStore);

        // Log to Calendar
        try {
            const events = await CalendarDB.getEvents();
            const dateKey = `${dateData.year}-${dateData.month}-${dateData.day}`;

            if (!events[dateKey]) events[dateKey] = [];
            
            // Calculate formatted time string (e.g. "12:30")
            const calendar = new CalendarSystem();
            const timeData = calendar.getDate(game.time.worldTime); // Actually needs basic math if getDate doesn't give time
            // Re-use main app helpers or simple calculation
            const dayLength = 86400;
            // Use offset-corrected time and ensure positive modulo
            const currentSeconds = ((currentWorldTime % dayLength) + dayLength) % dayLength;
            const hours = Math.floor(currentSeconds / 3600);
            const minutes = Math.floor((currentSeconds % 3600) / 60);
            const timeString = CalendarSystem.formatTime(hours, minutes);

            const baseTitle = game.i18n.localize("PDNC.WeatherReport");
            const reportTitle = `${baseTitle} (${timeString})`;
            
            // Look for event with THIS specific time-stamped title
            const existingIndex = events[dateKey].findIndex(e => e.title === reportTitle);

            const unit = game.settings.get(MODULE_ID, "temperatureUnit") || "C";
            let tempString = `${weatherStore.tempMin}°C — ${weatherStore.tempMax}°C`;
            if (unit === "F") {
                const min = weatherStore.tempMinF !== undefined ? weatherStore.tempMinF : Math.round((weatherStore.tempMin * 9/5) + 32);
                const max = weatherStore.tempMaxF !== undefined ? weatherStore.tempMaxF : Math.round((weatherStore.tempMax * 9/5) + 32);
                tempString = `${min}°F — ${max}°F`;
            }

            const weatherContent = `${weatherStore.description}\n${weatherStore.seasonName} | ${weatherStore.climateName}\nTemp: ${tempString}`;

            const eventData = {
                title: reportTitle,
                description: weatherContent,
                type: "weather", 
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
        let currentWorldTime = game.time.worldTime;
        
        // Apply Offsets
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        currentWorldTime += (offsetMinutes * 60);
        currentWorldTime += (offsetDays * 86400);

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
        
        if (todayId === lastGenId) return false;

        const parse = (id) => {
            if (!id) return 0;
            const parts = id.split('-');
            if (parts.length < 3) return 0;
            const [y, m, d] = parts.map(Number);
            return (y * 10000) + (m * 100) + d;
        };

        const todayVal = parse(todayId);
        const lastVal = parse(lastGenId);

        return todayVal > lastVal;
    }

    /**
     * Automated daily weather generation.
     */
    static async generateDailyWeather() {
        if (!game.user.isGM) return;
        if (!this.checkForNewDay()) return;

        const weather = this.generateWeather();
        await this.applyWeather(weather);
    }
}

