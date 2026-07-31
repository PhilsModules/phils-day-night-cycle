import { PhilsCalendarApp } from "./calendar-app.js";
import { CalendarSystem } from "./calendar-system.js";
import { CalendarDB } from "./calendar-db.js";
import { WeatherSystem } from "./weather-system.js";
import { LightingSystem, MOON_DATA } from "./lighting-system.js";
import { WeatherConfigApp } from "./apps/weather-config.js";
import { WeatherMixerApp } from "./apps/weather-mixer.js";
import { MoonConfigApp } from "./apps/moon-config.js";
import { CustomClimateApp } from "./apps/custom-climate.js";
import { SeasonConfigApp } from "./apps/season-config.js";
import { StartupWizard } from "./apps/startup-wizard.js";
import { ClimateDataWizard } from "./climate-data-wizard.js";
import { DungeonModeConfig } from "./apps/dungeon-mode-config.js";
import { ThemeConfigApp } from "./apps/theme-config.js";
import { ThemeSystem } from "./theme-system.js";
import { CustomCalendarList } from "./apps/custom-calendar.js";
import { SimpleCalendarMigrationApp } from "./apps/simple-calendar-migration.js";
import { WeatherRulesRegistry } from "./weather-rules.js";

import { WeatherHUD } from "./weather-hud.js";

const MODULE_ID = "phils-day-night-cycle";

function stripRestrictedWeatherChatContent(html) {
    if (game.user.isGM) return;

    const root = html?.[0] ?? html;
    if (!root?.querySelectorAll) return;

    root.querySelectorAll('[data-visibility="gm"]').forEach(element => element.remove());
}

class PhilsDayNightCycle {
    constructor() {
        this.container = null;
        this.calendar = null;
        this.hand = null;
        this.minuteHand = null;
        this.icon = null;
        this.label = null;
        this.clockText = null;

        // Phases are now handled dynamically via ThemeSystem.PHASES
        this.phases = [];

        this.lastPromptedDate = "";
    }

    init() {
        // Initializing...

        // Global Listener for Calendar Links in Chat
        $('body').on('click', '.pdnc-event-link', async (e) => {
            e.preventDefault();
            const target = $(e.currentTarget);
            const dateKey = target.data('date');
            const docId = target.data('document-id');

            // 1. Check for Linked Document (e.g. Quest)
            if (docId) {
                // Priority: Quest Tracker API
                if (window.PhilsQuestTracker) {
                    window.PhilsQuestTracker.openQuest(docId);
                    return;
                }
                
                // Fallback: Default Sheet
                const doc = game.journal.get(docId);
                if (doc) {
                    doc.sheet.render(true);
                    return;
                }
            }
            
            // Ensure app is open
            let app = foundry.applications.instances.get("phils-calendar-app");
            if (!app) {
                app = new PhilsCalendarApp();
            }

            if (dateKey) {
                const [y, m, d] = dateKey.split('-').map(Number);
                app.viewYear = y;
                app.viewMonth = m;

                // Render the main calendar first
                await app.render({ force: true });
                
                // Then Open the Day Viewer (Simulate Click)
                // Pass a mock target with dataset
                app._onDayClick(null, { dataset: { datekey: dateKey } });
            } else {
                 app.render({ force: true });
            }
        });


        // Register Templates
        const templatePaths = [
            `modules/${MODULE_ID}/templates/weather-config-form.hbs`,
            `modules/${MODULE_ID}/templates/custom-climate-list.hbs`,
            `modules/${MODULE_ID}/templates/custom-climate-list.hbs`,
            `modules/${MODULE_ID}/templates/custom-climate-editor.hbs`,
            `modules/${MODULE_ID}/templates/climate-wizard.hbs`
        ];
        loadTemplates(templatePaths);

        // ========================================================================
        // 1. ACTIONS & MENUS (Top of Settings)
        // ========================================================================

        // ========================================================================
        // 0. KEYBINDINGS
        // ========================================================================
        game.keybindings.register(MODULE_ID, "toggleCalendar", {
            name: "PDNC.Keybinding.ToggleCalendar.Name",
            hint: "PDNC.Keybinding.ToggleCalendar.Hint",
            editable: [
                { key: "KeyC", modifiers: [ "Alt" ] }
            ],
            onDown: () => this.toggleCalendar(),
            restricted: false,
            precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
        });

        game.settings.registerMenu(MODULE_ID, "restartWizard", {
            name: "Restart Setup Wizard",
            label: game.i18n.localize("PDNC.Wizard.RestartWizardLabel"),
            hint: game.i18n.localize("PDNC.Wizard.RestartWizardHint"),
            icon: "fas fa-magic",
            type: StartupWizard,
            restricted: true
        });

        game.settings.registerMenu(MODULE_ID, "timeMachine", {
            name: "Time Machine",
            label: game.i18n.localize("PDNC.OpenTimeMachine"),
            hint: "Jump to a specific date and set the world time.",
            icon: "fas fa-hourglass-start",
            type: TimeMachineApp,
            restricted: true
        });

        game.settings.registerMenu(MODULE_ID, "customCalendarMenu", {
            name: "Custom Calendars",
            label: "Manage Custom Calendars",
            hint: "Create or import custom calendar definitions.",
            icon: "fas fa-calendar-alt",
            type: CustomCalendarList,
            restricted: true
        });

        game.settings.registerMenu(MODULE_ID, "simpleCalendarMigrationMenu", {
            name: "Simple Calendar Migration",
            label: "PDNC.SimpleCalendarMigration.Title",
            hint: "PDNC.SimpleCalendarMigration.MenuHint",
            icon: "fas fa-right-left",
            type: SimpleCalendarMigrationApp,
            restricted: true
        });

        game.settings.registerMenu(MODULE_ID, "seasonConfigMenu", {
            name: "Season Config",
            label: game.i18n.localize("PDNC.OpenSeasonConfig"),
            hint: game.i18n.localize("PDNC.SettingSeasonConfigHint"),
            icon: "fas fa-calendar-alt",
            type: SeasonConfigApp,
            restricted: true
        });

        game.settings.registerMenu(MODULE_ID, "customClimateMenu", {
            name: "Custom Climates",
            label: game.i18n.localize("PDNC.CustomClimate.OpenMenu"),
            hint: game.i18n.localize("PDNC.CustomClimate.Hint"),
            icon: "fas fa-cloud-sun-rain",
            type: CustomClimateApp,
            restricted: true
        });

        game.settings.registerMenu(MODULE_ID, "moonConfigMenu", {
            name: "Configure Moon Phases",
            label: "Edit Phases",
            hint: "Open the Moon Phase editor to customize the cycle.",
            icon: "fas fa-moon",
            type: MoonConfigApp,
            restricted: true
        });

        // ========================================================================
        // 2. VISUALS & DISPLAY
        // ========================================================================

        ThemeSystem.init();

        game.settings.registerMenu(MODULE_ID, "themeConfigMenu", {
            name: "Theme Config",
            label: "PDNC.ThemeConfig.Title",
            hint: "PDNC.ThemeConfig.Hint",
            icon: "fas fa-images",
            type: ThemeConfigApp,
            restricted: true
        });



        game.settings.register(MODULE_ID, "clockImage", {
            name: game.i18n.localize("PDNC.SettingClockImageName"),
            hint: game.i18n.localize("PDNC.SettingClockImageHint"),
            scope: "world",
            config: true,
            type: String,
            filePicker: "image",
            default: "modules/phils-day-night-cycle/assets/clock.webp",
            onChange: () => this.applyTheme()
        });

        game.settings.register(MODULE_ID, "temperatureUnit", {
            name: "Temperature Unit",
            hint: "Select the unit for temperature display.",
            scope: "world",
            config: true,
            type: String,
            choices: {
                "C": "Celsius (°C)",
                "F": "Fahrenheit (°F)"
            },
            default: "C",
            onChange: () => {
                WeatherSystem.refreshWeather();
                Hooks.callAll("pdnc.unitChanged");
            }
        });

        game.settings.register(MODULE_ID, "showRealNames", {
            name: game.i18n.localize("PDNC.SettingShowRealNamesName"),
            hint: game.i18n.localize("PDNC.SettingShowRealNamesHint"),
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
            onChange: () => {
                this.calendar = new CalendarSystem();
                this.refreshCalendar();
            }
        });

        game.settings.register(MODULE_ID, "use12HourFormat", {
            name: game.i18n.localize("PDNC.SettingUse12HourFormatName"),
            hint: game.i18n.localize("PDNC.SettingUse12HourFormatHint"),
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
            onChange: () => {
                this.refreshCalendar();
            }
        });

        game.settings.register(MODULE_ID, "clockPosition", {
            name: game.i18n.localize("PDNC.SettingClockPositionName"),
            hint: game.i18n.localize("PDNC.SettingClockPositionHint"),
            scope: "client",
            config: true,
            type: String,
            choices: {
                "auto": game.i18n.localize("PDNC.ClockPosition.Auto"),
                "above": game.i18n.localize("PDNC.ClockPosition.Above"),
                "below": game.i18n.localize("PDNC.ClockPosition.Below"),
                "left": game.i18n.localize("PDNC.ClockPosition.Left"),
                "right": game.i18n.localize("PDNC.ClockPosition.Right")
            },
            default: "auto",
            onChange: () => {
                this._updateSmartPosition();
            }
        });

        // ========================================================================
        // 3. WEATHER & CLIMATE
        // ========================================================================
        game.settings.register(MODULE_ID, "enableWeather", {
            name: game.i18n.localize("PDNC.SettingEnableWeatherName"),
            hint: game.i18n.localize("PDNC.SettingEnableWeatherHint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onChange: () => {
                this.updateClock();
                if (!game.user.isGM) return;
            }
        });

        game.settings.register(MODULE_ID, "weatherRuleNotesEnabled", {
            name: game.i18n.localize("PDNC.WeatherRules.SettingName"),
            hint: game.i18n.localize("PDNC.WeatherRules.SettingHint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });

        // Dependency: Register customClimates BEFORE climateZone so getClimateList() works
        game.settings.register(MODULE_ID, "customClimates", {
            name: "Custom Climate Zones",
            scope: "world",
            config: false,
            type: Object,
            default: {}
        });

        const climateChoices = WeatherSystem.getClimateList();
        game.settings.register(MODULE_ID, "climateZone", {
            name: game.i18n.localize("PDNC.SettingClimateZoneName"),
            hint: game.i18n.localize("PDNC.SettingClimateZoneHint"),
            scope: "world",
            config: true,
            type: String,
            choices: climateChoices,
            default: "marine_west_coast"
        });

        // ========================================================================
        // 4. DAY / NIGHT & MOON
        // ========================================================================
        game.settings.register(MODULE_ID, "autoLighting", {
            name: game.i18n.localize("PDNC.SettingAutoLightingName"),
            hint: game.i18n.localize("PDNC.SettingAutoLightingHint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });

        game.settings.register(MODULE_ID, "enableMoonLighting", {
            name: "Enable Moon Lighting", // TODO: localize
            hint: "If enabled, the moon phase will affect the darkness level of the scene at night.",
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onChange: () => LightingSystem.refresh()
        });
        
        game.settings.register(MODULE_ID, "useCustomMoonPhases", {
            name: "Use Custom Moon Phases",
            hint: "Enable to use the custom phase data defined in the configuration menu.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: () => LightingSystem.refresh()
        });

        // ========================================================================
        // 5. CALENDAR & TIME (Advanced)
        // ========================================================================
        
        game.settings.register(MODULE_ID, "customCalendars", { scope: "world", config: false, type: Object, default: {} });

        const customCals = game.settings.get(MODULE_ID, "customCalendars") || {};
        const calendarChoices = {
            "gregorian": "Gregorian (Standard)",
            "golarion": "Golarion (Pathfinder 2e)",
            "harptos": "Harptos (DnD 5e)",
            "magaambya": "Magaambya (Mwangi/PF2e)",
            "vikingar": "Víkingar"
        };
        for (const [id, data] of Object.entries(customCals)) {
            calendarChoices[id] = data.name || "Custom Calendar";
        }

        game.settings.register(MODULE_ID, "calendarSystem", {
            name: game.i18n.localize("PDNC.SettingCalendarSystemName"),
            hint: game.i18n.localize("PDNC.SettingCalendarSystemHint"),
            scope: "world",
            config: true,
            type: String,
            choices: calendarChoices,
            default: "gregorian",
            onChange: () => {
                this.calendar = new CalendarSystem();
                const calendarApp = foundry.applications.instances.get("phils-calendar-app");
                if (calendarApp) calendarApp.render({ force: true });
                const seasonApp = foundry.applications.instances.get("phils-season-config");
                if (seasonApp) seasonApp.render({ force: true });
                const timeApp = foundry.applications.instances.get("phils-time-machine");
                if (timeApp) timeApp.render({ force: true });
            }
        });

        game.settings.register(MODULE_ID, "syncPF2e", {
            name: "Sync Pathfinder 2e",
            hint: "Automatically sets the day offset to 1,725,595 to align with Golarion's epoch.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false,
            onChange: async (value) => {
                if (!value) return;

                await game.settings.set(MODULE_ID, "dayOffset", 1725595);
                ui.notifications.info("PDNC | Calendar Synced to Pathfinder 2e Epoch.");
            }
        });

        game.settings.register(MODULE_ID, "timeOffset", {
            name: game.i18n.localize("PDNC.SettingTimeOffsetName"),
            hint: game.i18n.localize("PDNC.SettingTimeOffsetHint"),
            scope: "world",
            config: true,
            type: Number,
            default: 0,
            onChange: () => this.updateClock()
        });

        game.settings.register(MODULE_ID, "dayOffset", {
            name: game.i18n.localize("PDNC.SettingDayOffsetName"),
            hint: game.i18n.localize("PDNC.SettingDayOffsetHint"),
            scope: "world",
            config: true,
            type: Number,
            default: 0,
            onChange: (value) => {
                this.updateClock();
                if (value !== 1725595 && game.settings.get(MODULE_ID, "syncPF2e")) {
                    game.settings.set(MODULE_ID, "syncPF2e", false);
                }
            }
        });

        game.settings.register(MODULE_ID, "weekdayOffset", {
            name: game.i18n.localize("PDNC.SettingWeekdayOffsetName"),
            hint: game.i18n.localize("PDNC.SettingWeekdayOffsetHint"),
            scope: "world",
            config: true,
            type: Number,
            default: 0,
            onChange: () => this.updateClock()
        });

        // ========================================================================
        // 6. PERMISSIONS
        // ========================================================================
        game.settings.register(MODULE_ID, "permissionTimeControl", {
            name: "Permission: Time Control",
            scope: "world",
            config: true,
            type: Number,
            choices: { 1: "PLAYER", 2: "TRUSTED", 3: "ASSISTANT", 4: "GAMEMASTER" },
            default: 2
        });
        game.settings.register(MODULE_ID, "permissionWeatherControl", {
            name: "Permission: Weather Control",
            scope: "world",
            config: true,
            type: Number,
            choices: { 1: "PLAYER", 2: "TRUSTED", 3: "ASSISTANT", 4: "GAMEMASTER" },
            default: 2
        });
        
         game.settings.register(MODULE_ID, "playerAdvanceTime", {
            name: game.i18n.localize("PDNC.SettingPlayerAdvanceName"),
            hint: game.i18n.localize("PDNC.SettingPlayerAdvanceHint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });
        game.settings.register(MODULE_ID, "playerCreateEvents", {
            name: game.i18n.localize("PDNC.SettingPlayerCreateName"),
            hint: game.i18n.localize("PDNC.SettingPlayerCreateHint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });

        // ========================================================================
        // 7. HIDDEN & CLIENT SETTINGS
        // ========================================================================
        game.settings.register(MODULE_ID, "visible", {
            name: game.i18n.localize("PDNC.SettingVisibleName"),
            hint: game.i18n.localize("PDNC.SettingVisibleHint"),
            scope: "client",
            config: false,
            type: Boolean,
            default: true,
            onChange: (value) => this.toggle(value)
        });

        game.settings.register(MODULE_ID, "posX", {
            name: game.i18n.localize("PDNC.SettingPostXName"), 
            scope: "client",
            config: false,
            type: Number,
            default: -1 
        });
        game.settings.register(MODULE_ID, "posY", {
            name: game.i18n.localize("PDNC.SettingPosYName"),
            scope: "client",
            config: false,
            type: Number,
            default: -1
        });
        game.settings.register(MODULE_ID, "posBottom", {
            name: "Position Bottom",
            scope: "client",
            config: false,
            type: Number,
            default: -1
        });
        
        game.settings.register(MODULE_ID, "customMoonPhases", {
            name: "Custom Moon Phase JSON",
            scope: "world",
            config: false, 
            type: String, 
            default: "[]",
            onChange: () => LightingSystem.refresh()
        });

        game.settings.register(MODULE_ID, "weatherDisplayMode", {
            name: "Weather Display Mode",
            scope: "client",
            config: false,
            type: String,
            default: "global"
        });

        game.settings.register(MODULE_ID, "weatherPaused", {
            name: "Weather Paused",
            scope: "client",
            config: false,
            type: Boolean,
            default: false,
            onChange: (value) => { }
        });

        game.settings.register(MODULE_ID, "weatherPreviewState", {
            name: "Weather Preview State",
            scope: "client",
            config: false,
            type: Object,
            default: { open: false, x: null, y: null, width: 350, height: 350, paused: false }
        });

        game.settings.register(MODULE_ID, "weatherMixerFavorites", {
            name: "Weather Mixer Favorites",
            scope: "world",
            config: false,
            type: Object,
            default: {} 
        });

        // New Detailed Settings (Hidden State)
        game.settings.register(MODULE_ID, "year", { scope: "world", config: false, type: Number, default: 2024 });
        game.settings.register(MODULE_ID, "month", { scope: "world", config: false, type: Number, default: 1 });
        game.settings.register(MODULE_ID, "day", { scope: "world", config: false, type: Number, default: 1 });
        game.settings.register(MODULE_ID, "time", { scope: "world", config: false, type: Number, default: 720 });
        game.settings.register(MODULE_ID, "yearPrefix", { name: "Default Year Prefix", scope: "world", config: true, type: String, default: "" });
        game.settings.register(MODULE_ID, "yearPostfix", { name: "Default Year Postfix", scope: "world", config: true, type: String, default: "" });
        game.settings.register(MODULE_ID, "negativeYearPrefix", { name: "Default Negative Year Prefix", scope: "world", config: true, type: String, default: "" });
        game.settings.register(MODULE_ID, "negativeYearPostfix", { name: "Default Negative Year Postfix", scope: "world", config: true, type: String, default: "bs" });
        
        game.settings.register(MODULE_ID, "wizardCompleted", { scope: "world", config: false, type: Boolean, default: false });
        
        game.settings.register(MODULE_ID, "calendarEvents", { scope: "world", config: false, type: Object, default: {} });
        
        game.settings.register(MODULE_ID, "dbJournalId", { scope: "world", config: false, type: String, default: "" });
        


        game.settings.register(MODULE_ID, "seasonConfig", {
            name: "Season Configuration",
            scope: "world",
            config: false,
            type: Object,
            default: {
                spring: { month: 2, day: 20 },
                summer: { month: 5, day: 21 },
                autumn: { month: 8, day: 22 },
                winter: { month: 11, day: 21 }
            }
        });
        
        game.settings.register(MODULE_ID, "lastWeatherGenerationTime", { scope: "world", config: false, type: Number, default: 0 });
        game.settings.register(MODULE_ID, "lastWeatherDateId", { scope: "world", config: false, type: String, default: "" });
        game.settings.register(MODULE_ID, "currentWeather", { 
            scope: "world", 
            config: false, 
            type: Object, 
            default: { tempMin: 0, tempMax: 0, text: "", description: "", fx: null, generated: false } 
        });
        game.settings.register(MODULE_ID, "lastNotificationState", { scope: "world", config: false, type: Object, default: {} });

        Hooks.on("updateWorldTime", (worldTime, dt) => {
             this.updateClock();

             // Lighting updates on EVERY time change (forward AND backward)
             if (game.user.isGM) {
                 LightingSystem.update(game.time.worldTime);
             }

             // Weather and notifications only on forward time movement
             if (game.user.isGM && dt > 0) {
                 this.checkCalendarNotifications();

                 if (game.settings.get(MODULE_ID, "enableWeather")) {
                     if (WeatherSystem.checkForNewDay()) {
                         const todayId = WeatherSystem.getTodayId();
                         if (this.lastPromptedDate !== todayId) {
                             this.lastPromptedDate = todayId;
                             const draftWeather = WeatherSystem.generateWeather();
                             if (!Object.values(ui.windows).some(w => w instanceof WeatherConfigApp)) {
                                 new WeatherConfigApp({ weather: draftWeather }).render({ force: true });
                             }
                         }
                     }
                 }
             }
        });

        Hooks.on("canvasReady", () => {
             if (game.user.isGM) {
                 LightingSystem.update(game.time.worldTime);
             }
        });

        // Add Scene Control Button
        // Add Scene Control Button
        Hooks.on("getSceneControlButtons", (controls) => {
            if (!game.user.isGM) return;
            
            let controlsArray = controls;

            // Handle non-array input (e.g. from module conflicts or core updates)
            if (!Array.isArray(controls)) {
                if (typeof controls === 'object' && controls !== null) {
                    controlsArray = Object.values(controls);
                } else {
                    console.warn("PDNC | getSceneControlButtons hook received invalid controls:", controls);
                    return;
                }
            }

            const lightingControl = controlsArray.find(c => c.name === "lighting");
            if (lightingControl) {
                if (!lightingControl.tools) lightingControl.tools = [];
                
                // Helper to check for existing tool
                let exists = false;
                if (Array.isArray(lightingControl.tools)) {
                    exists = !!lightingControl.tools.find(t => t.name === "climate-wizard");
                } else if (typeof lightingControl.tools === 'object') {
                    exists = Object.values(lightingControl.tools).some(t => t.name === "climate-wizard");
                }

                if (!exists) {
                    const newTool = {
                        name: "climate-wizard",
                        title: "Climate Data Wizard",
                        icon: "fas fa-cloud-sun-rain",
                        onClick: () => {
                            new ClimateDataWizard().render({ force: true });
                        },
                        button: true
                    };

                    // Add new tool
                    if (Array.isArray(lightingControl.tools)) {
                        lightingControl.tools.push(newTool);
                    } else if (typeof lightingControl.tools === 'object') {
                        // If it's an object, we assume we need to assign it by key?
                        // Or maybe it's a numeric dictionary?
                        // We'll try to use the name as key if it's an object map.
                        if (lightingControl.tools instanceof Map) {
                             lightingControl.tools.set("climate-wizard", newTool);
                        } else {
                             // Plain object logic
                             // Check if numeric keys?
                             const keys = Object.keys(lightingControl.tools);
                             const isNumeric = keys.every(k => !isNaN(parseInt(k)));
                             
                             if (isNumeric) {
                                 const nextIdx = keys.length > 0 ? Math.max(...keys.map(Number)) + 1 : 0;
                                 lightingControl.tools[nextIdx] = newTool;
                             } else {
                                 lightingControl.tools["climate-wizard"] = newTool;
                             }
                        }
                    }
                }
            }
        });

        this.calendar = new CalendarSystem();

        // Expose API for Macros
        window.PhilsDayNightCycle = {
            toggle: () => this.toggleSetting(),
            toggleCalendar: () => this.toggleCalendar(),
            toggleDungeonMode: () => this.toggleDungeonMode(),
            refresh: () => this.refreshCalendar(),
            resetPosition: () => this.resetPosition(),
            setTime: (h, m) => this.setTime(h, m),
            addEvent: (date, data) => CalendarDB.addEvent(date, data),
            removeEvent: (date, title) => CalendarDB.removeEvent(date, title),
            removeLinkedEvent: (docId) => CalendarDB.removeEventByDocumentId(docId),
            PhilsCalendarApp: PhilsCalendarApp, // Expose Class for Picker
            calendar: this.calendar, // Expose Calendar System
            createUI: () => this.createUI(),
            updateClock: () => this.updateClock(),
            setPreviewIconState: (isOpen) => this.setPreviewIconState(isOpen),
            registerWeatherRulesProvider: (id, provider) => WeatherRulesRegistry.register(id, provider),
            unregisterWeatherRulesProvider: (id) => WeatherRulesRegistry.unregister(id)
        };
        // this.updateClock(); // Moved to ready/updateWorldTime

        // Auto-Open Weather HUD if it was open
        Hooks.once("ready", () => {
             const state = game.settings.get(MODULE_ID, "weatherPreviewState");
             if (state && state.open) {
                 new WeatherHUD().render(true);
             }

             // Validate Settings (Fix for deleted climates)
             WeatherSystem.validateSettings();

             // Launch Startup Wizard if needed
             if (game.user.isGM && !game.settings.get(MODULE_ID, "wizardCompleted")) {
                 new StartupWizard().render({ force: true });
              }
         });

        Hooks.on("renderChatMessage", (message, html) => {
            if (!message?.flags?.[MODULE_ID]?.isWeather) return;
            stripRestrictedWeatherChatContent(html);
        });

        Hooks.on("renderChatMessageHTML", (message, html) => {
            if (!message?.flags?.[MODULE_ID]?.isWeather) return;
            stripRestrictedWeatherChatContent(html);
        });

        Hooks.on("renderSettingsConfig", (app, html, data) => {
            const root = html instanceof HTMLElement ? html : html[0];
            if (!root) return;

            const injectResetButton = () => {
                // Find the core container for the setting (V14 uses data-setting-id on the article/group)
                let settingContainer = root.querySelector(`[data-setting-id="${MODULE_ID}.clockImage"]`);
                
                // V11/V12 Fallback: find the input or file-picker element directly
                let targetInput = root.querySelector(`[name="${MODULE_ID}.clockImage"]`);
                if (!targetInput && root.shadowRoot) {
                    // Dive into shadow DOM if root is a web component wrapper
                    targetInput = root.shadowRoot.querySelector(`[name="${MODULE_ID}.clockImage"]`);
                }
                
                if (!targetInput) {
                     const elements = root.querySelectorAll('input, file-picker');
                     targetInput = Array.from(elements).find(i => 
                         (i.name && i.name.includes("clockImage")) || 
                         (i.id && i.id.includes("clockImage"))
                     );
                }

                if (!settingContainer && targetInput) {
                    settingContainer = targetInput.closest('.form-group, .setting');
                }
                
                if (targetInput || settingContainer) {
                    // Resolve the actual element receiving the value
                    const workingInput = targetInput || settingContainer.querySelector('input, file-picker');
                    if (!workingInput) return false;

                    // Prevent duplicate renders
                    const containerToCheck = settingContainer ? settingContainer : workingInput.parentNode;
                    if (containerToCheck.querySelector('.pdnc-reset-btn')) return true;

                    const resetBtn = document.createElement("button");
                    resetBtn.type = "button";
                    resetBtn.className = "pdnc-reset-btn";
                    resetBtn.innerHTML = "<i class=\"fas fa-undo\"></i>";
                    resetBtn.title = "Auf Standard zurücksetzen";
                    
                    // Style to match FilePicker buttons in V14 & V11
                    resetBtn.style.flex = "0 0 30px";
                    resetBtn.style.width = "30px";
                    resetBtn.style.height = "26px"; // Standard foundry button height
                    resetBtn.style.minWidth = "30px";
                    resetBtn.style.marginLeft = "5px";
                    resetBtn.style.textAlign = "center";
                    resetBtn.style.cursor = "pointer";

                    resetBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        workingInput.value = "modules/phils-day-night-cycle/assets/clock.webp";
                        workingInput.dispatchEvent(new Event("change", { bubbles: true }));
                    });

                    // Insert intelligently depending on V14 vs V11 layout
                    const controlDiv = settingContainer ? settingContainer.querySelector('.setting-control, .form-fields') : workingInput.parentNode;
                    
                    if (controlDiv) {
                        // V14 or V11 Layout - appending at the end of the input group
                        controlDiv.appendChild(resetBtn);
                        // Ensure layout allows side-by-side placing
                        controlDiv.style.display = "flex";
                        controlDiv.style.flexDirection = "row";
                        controlDiv.style.alignItems = "center";
                    } else {
                        // Fallback: place directly after the input/web component
                        workingInput.parentNode.insertBefore(resetBtn, workingInput.nextSibling);
                    }
                    return true;
                }
                return false;
            };

            // Attempt injection immediately
            if (!injectResetButton()) {
                // For V12 or other systems with delayed rendering, use an observer
                const observer = new MutationObserver(() => {
                    if (injectResetButton()) observer.disconnect();
                });
                observer.observe(root, { childList: true, subtree: true });
                // Fallback disconnect after 5s just in case
                setTimeout(() => observer.disconnect(), 5000);
            }
        });
    }

    refreshCalendar() {
        const app = foundry.applications.instances.get("phils-calendar-app");
        if (app) app.render();
        this.checkCalendarNotifications();
    }

    resetPosition() {
        if (!this.container) return;
        this.container.style.left = "";
        this.container.style.top = "";
        this.container.style.bottom = "25px";
        this.container.style.right = "310px";
        game.settings.set(MODULE_ID, "posX", -1);
        game.settings.set(MODULE_ID, "posY", -1);
    }

    setTime(targetHour, targetMinute) {
        const dayLength = 86400;
        const currentSeconds = game.time.worldTime % dayLength;
        const currentMinutesTotal = Math.floor(currentSeconds / 60);
        const targetMinutesTotal = (targetHour * 60) + targetMinute;
        let offset = targetMinutesTotal - currentMinutesTotal;
        game.settings.set(MODULE_ID, "timeOffset", offset);
        ui.notifications.info(`${MODULE_ID} | Clock synchronized to ${CalendarSystem.formatTime(targetHour, targetMinute)}`);
        this.updateClock();
    }

    toggleSetting() {
        const current = game.settings.get(MODULE_ID, "visible");
        game.settings.set(MODULE_ID, "visible", !current);
    }

    toggleCalendar() {
        const app = foundry.applications.instances.get("phils-calendar-app");
        if (app) {
            app.close();
        } else {
            new PhilsCalendarApp().render({ force: true });
        }
    }

    toggle(isVisible) {
        if (!this.container) return;
        if (isVisible) {
            this.container.style.display = "flex";
            this.updateClock();
        } else {
            this.container.style.display = "none";
        }
    }

    setPreviewIconState(isOpen) {
        if (!this.previewIcon) return;
        // Direct element manipulation
        if (isOpen) {
            this.previewIcon.classList.remove("fa-search-plus");
            this.previewIcon.classList.add("fa-search-minus");
        } else {
            this.previewIcon.classList.remove("fa-search-minus");
            this.previewIcon.classList.add("fa-search-plus");
        }
    }

    createUI() {
        if (document.getElementById("phils-day-night-cycle-container")) return;

        const uiContainer = document.createElement("div");
        uiContainer.id = "phils-day-night-cycle-container";

        // Added Weather Icon and Temp to HTML structure
        const dungeonBtnHtml = game.user.isGM ? `<i class="fas fa-dungeon pdnc-dungeon-btn" title="Dungeon Mode" style="position: absolute; top: 10px; left: 10px; cursor: pointer; color: #ccc; z-index: 10; font-size: 1.2em;"></i>` : "";

        uiContainer.innerHTML = `
      <div class="pdnc-disk">
        <div class="pdnc-hand"></div>
        <div class="pdnc-hand-minute"></div>
        <div class="pdnc-center-cap"></div>
        <div class="pdnc-labels-container"></div>
      </div>
      <div class="pdnc-time-display">
        <!-- Dungeon Mode Button (Top Left) -->
        ${dungeonBtnHtml}

        <span class="pdnc-phase-icon"></span>
        <div class="pdnc-phase-text"></div>
        <div class="pdnc-solar-arc-container">
            <svg class="pdnc-solar-svg">
                <!-- Track Arc -->
                <path class="pdnc-solar-track" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" />
                <!-- Progress Arc (Optional, showing passed time?) - Let's just do the Sun Icon for now -->
                <!-- Sun Icon Group -->
                <g class="pdnc-solar-sun-group">
                    <circle cx="0" cy="0" r="4" fill="#ffcc00" stroke="#ffaa00" stroke-width="1" />
                    <!-- Rays -->
                    <line x1="0" y1="-6" x2="0" y2="-8" stroke="#ffcc00" stroke-width="1" />
                    <line x1="0" y1="6" x2="0" y2="8" stroke="#ffcc00" stroke-width="1" />
                    <line x1="-6" y1="0" x2="-8" y2="0" stroke="#ffcc00" stroke-width="1" />
                    <line x1="6" y1="0" x2="8" y2="0" stroke="#ffcc00" stroke-width="1" />
                    <line x1="-4" y1="-4" x2="-6" y2="-6" stroke="#ffcc00" stroke-width="1" />
                    <line x1="4" y1="-4" x2="6" y2="-6" stroke="#ffcc00" stroke-width="1" />
                    <line x1="-4" y1="4" x2="-6" y2="6" stroke="#ffcc00" stroke-width="1" />
                    <line x1="4" y1="4" x2="6" y2="6" stroke="#ffcc00" stroke-width="1" />
                </g>
                <!-- Moon Group -->
                <g class="pdnc-moon-group" style="opacity: 0;">
                    <!-- Base Dark Moon -->
                    <circle cx="0" cy="0" r="5" fill="#222" stroke="#555" stroke-width="1" />
                    <!-- Lit Part (Phase) -->
                    <path class="pdnc-moon-phase" fill="#eee" d="" />
                </g>
            </svg>
        </div>
        <div class="pdnc-clock-line" style="display: flex; justify-content: center; align-items: center; gap: 8px;">
            <div class="pdnc-clock-group" style="display: flex; align-items: center; gap: 4px;">
                <i class="fas fa-clock pdnc-toggle-btn" title="${game.i18n.localize("PDNC.ToggleClock")}" style="margin-left: 0;"></i>
                <div class="pdnc-clock-text"></div>
            </div>
            <div class="pdnc-weather-group" style="display: flex; align-items: center; gap: 4px; display: none;">
                <i class="fas fa-cloud-sun pdnc-weather-icon" title="${game.i18n.localize("PDNC.Weather")}" style="cursor: pointer; opacity: 0.8;"></i>
                <span class="pdnc-temp-text" style="font-size: 0.9em; opacity: 0.8;"></span>
                <i class="fas fa-search-plus pdnc-preview-icon" title="${game.i18n.localize("PDNC.WeatherPreview")}" style="cursor: pointer; opacity: 0.8; margin-left: 2px;"></i>
            </div>
        </div>
        <div class="pdnc-date-text"></div>
        <div class="pdnc-controls" style="display: none; flex-direction: column; gap: 4px;">
            <div class="pdnc-shortcuts" style="display: flex; width: 100%; justify-content: center; gap: 5px;">
                <button class="pdnc-btn" data-action="add-10m" style="padding: 4px 6px; font-size: 0.8em;">+10m</button>
                <button class="pdnc-btn" data-action="add-1h" style="padding: 4px 6px; font-size: 0.8em;">+1h</button>
                <button class="pdnc-btn" data-action="add-1d" style="padding: 4px 6px; font-size: 0.8em;">+1d</button>
                <button class="pdnc-btn" data-action="add-1w" style="padding: 4px 6px; font-size: 0.8em;">+1w</button>
                <button class="pdnc-btn pdnc-btn-nextsun" data-action="next-sun" title="${game.i18n.localize('PDNC.NextSunriseSunset')}" style="padding: 4px 6px; font-size: 0.8em;"><i class="fas fa-moon"></i></button>
            </div>
            <div class="pdnc-manual-controls" style="display: flex; gap: 8px; justify-content: center; align-items: center; width: 100%;">
                <button class="pdnc-btn" data-action="rewind">-</button>
                <input type="number" class="pdnc-input" value="1" min="1">
                <select class="pdnc-select">
                    <option value="60">${game.i18n.localize("PDNC.TimeMin")}</option>
                    <option value="3600">${game.i18n.localize("PDNC.TimeHour")}</option>
                    <option value="86400">${game.i18n.localize("PDNC.TimeDay")}</option>
                </select>
                <button class="pdnc-btn" data-action="advance">+</button>
            </div>
        </div>
      </div>
    `;

        document.body.appendChild(uiContainer);

        this.container = uiContainer;
        this.hand = uiContainer.querySelector(".pdnc-hand");
        this.minuteHand = uiContainer.querySelector(".pdnc-hand-minute");
        this.icon = uiContainer.querySelector(".pdnc-phase-icon");
        this.label = uiContainer.querySelector(".pdnc-phase-text");
        this.clockText = uiContainer.querySelector(".pdnc-clock-text");
        this.dateText = uiContainer.querySelector(".pdnc-date-text");
        this.shortcuts = uiContainer.querySelector(".pdnc-shortcuts");
        this.controls = uiContainer.querySelector(".pdnc-controls");
        
        // Weather Elements
        this.weatherIcon = uiContainer.querySelector(".pdnc-weather-icon");
        this.previewIcon = uiContainer.querySelector(".pdnc-preview-icon");
        this.tempText = uiContainer.querySelector(".pdnc-temp-text");
        this.sunGroup = uiContainer.querySelector(".pdnc-solar-sun-group");
        this.moonGroup = uiContainer.querySelector(".pdnc-moon-group");
        this.moonPhasePath = uiContainer.querySelector(".pdnc-moon-phase");

        // Check Permissions for Controls
        if (game.user.isGM || game.settings.get(MODULE_ID, "playerAdvanceTime")) {
            this.controls.style.display = "flex";
            // Shortcuts display is now handled by parent flex, but we might want to ensure they aren't hidden
            // Since we set display:flex inline in the HTML above, this is fine.
        }

        // Restore Position
        const savedX = game.settings.get(MODULE_ID, "posX");
        const savedBottom = game.settings.get(MODULE_ID, "posBottom");

        if (savedX !== -1 && savedBottom !== -1) {
            uiContainer.style.right = "auto";
            uiContainer.style.top = "auto";
            uiContainer.style.left = `${savedX}px`;
            uiContainer.style.bottom = `${savedBottom}px`;
        } else if (savedX !== -1) {
            // Legacy Fallback (only X and Y were saved)
            const savedY = game.settings.get(MODULE_ID, "posY");
            if (savedY !== -1) {
                uiContainer.style.right = "auto";
                uiContainer.style.top = "auto";
                uiContainer.style.left = `${savedX}px`;
                // Best effort conversion for first load after update
                // We don't have offsetHeight reliably yet if not rendered, but we try:
                // Let's just default to a safe bottom if we can't calc
                uiContainer.style.bottom = "25px"; 
            }
        }

        // Add Drag Listeners
        this.dragElement(uiContainer);
        this._updateSmartPosition();
        window.addEventListener("resize", () => this._updateSmartPosition());

        // Tooltip & Hover Listeners
        this.createTooltipElement(uiContainer);
        const disk = uiContainer.querySelector(".pdnc-disk");
        disk.addEventListener("mousemove", (e) => this.handleDiskHover(e));
        disk.addEventListener("mouseleave", () => {
            if (this.tooltip) this.tooltip.classList.remove("visible");
        });



        // Open Calendar on Click (Disk)
        disk.addEventListener("click", () => {
            new PhilsCalendarApp().render(true);
        });

        // Open Calendar on Click (Date Text)
        this.dateText.addEventListener("click", () => {
            new PhilsCalendarApp().render(true);
        });
        this.dateText.style.cursor = "pointer";
        
        // Open Weather on Click (Icon)

        // Open Weather on Click (Icon)
        // Open Weather Config on Click (Icon) - RESTORED
        this.weatherIcon.addEventListener("click", () => {
            const weather = game.settings.get(MODULE_ID, "currentWeather");
            
            if (game.user.isGM) {
                // GM: Open Config to Edit/Reroll
                let weatherData = weather;
                if (!weatherData || !weatherData.generated) {
                    weatherData = WeatherSystem.generateWeather();
                }
                if (!weatherData.climateName) {
                    const clim = WeatherSystem.getCurrentClimate();
                    weatherData.climateName = clim.name;
                }
                new WeatherConfigApp({ weather: weatherData }).render({ force: true });
            } else {
                // Player: View Only
                if(weather && weather.description) {
                    new Dialog({
                        title: game.i18n.localize("PDNC.WeatherForecast"),
                        content: `<p style="text-align:center; font-size: 1.1em; margin: 10px 0;">${weather.description}</p>`,
                        buttons: {
                            ok: { icon: '<i class="fas fa-check"></i>', label: "OK" }
                        },
                        default: "ok"
                    }).render(true);
                }
            }
        });

        // Open Weather Preview Window on Click (Magnifying Glass) - NEW
        // Open Weather Preview Window on Click (Magnifying Glass) - TOGGLE
        this.previewIcon.addEventListener("click", () => {
             // Check if already open
             const existingApp = foundry.applications.instances.get("weather-hud");
             
             if (existingApp) {
                 existingApp.close();
             } else {
                 new WeatherHUD().render(true);
             }
        });

        // Hook to update Icon State when WeatherHUD opens/closes (handles manual close via X)
        const updateIconState = (isOpen) => {
             // this.previewIcon is the <i> element itself since createUI assigns it via querySelector(".pdnc-preview-icon")
             const icon = this.previewIcon; 
             if (icon) {
                 if (isOpen) {
                     icon.classList.remove("fa-search-plus");
                     icon.classList.add("fa-search-minus");
                 } else {
                     icon.classList.remove("fa-search-minus");
                     icon.classList.add("fa-search-plus");
                 }
             }
        };

        // Check initial state
        if (foundry.applications.instances.get("weather-hud")) {
            updateIconState(true);
        }

        Hooks.on("renderApplication", (app) => {
             // LOG: console.log("PDNC DEBUG | Render App:", app.id, app?.options?.id);
             if (app.id === "weather-hud" || app?.options?.id === "weather-hud") {
                 updateIconState(true);
             }
        });

        Hooks.on("closeApplication", (app) => {
             // LOG: console.log("PDNC DEBUG | Close App:", app.id);
             if (app.id === "weather-hud" || app?.options?.id === "weather-hud") {
                 updateIconState(false);
             }
        });



        // Time Controls
        const btnRewind = this.controls.querySelector('[data-action="rewind"]');
        const btnAdvance = this.controls.querySelector('[data-action="advance"]');
        const inputAmount = this.controls.querySelector('.pdnc-input');
        const selectUnit = this.controls.querySelector('.pdnc-select');

        const modifyTime = (multiplier) => {
            const amount = parseInt(inputAmount.value) || 1;
            const unit = parseInt(selectUnit.value);
            const delta = amount * unit * multiplier;
            // game.time.advance is usually for forward, but we can do simple worldTime update via Hook or execute
            // For simple usage: game.time.advance(delta) works perfectly for positive.
            // For negative? game.time.advance only adds. We might need to manually set worldTime.

            if (delta > 0) {
                if (game.user.isGM) {
                    game.time.advance(delta);
                } else {
                    // game.socket.emit(`module.${MODULE_ID}`, { action: "changeTime", delta: delta });
                    game.user.setFlag(MODULE_ID, "timeRequest", { delta: delta, id: Date.now() });
                }
            } else {
                if (!game.user.isGM) {
                    // game.socket.emit(`module.${MODULE_ID}`, { action: "changeTime", delta: delta });
                    game.user.setFlag(MODULE_ID, "timeRequest", { delta: delta, id: Date.now() });
                    return;
                }
                // GM Local Rewind
                const newTime = game.time.worldTime + delta;
                game.settings.set("core", "time", newTime);
            }
        };

        btnRewind.addEventListener("click", (e) => { e.stopPropagation(); modifyTime(-1); });
        btnAdvance.addEventListener("click", (e) => { e.stopPropagation(); modifyTime(1); });

        // Shortcut Listeners
        const shortcuts = this.shortcuts.querySelectorAll('.pdnc-btn');
        shortcuts.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                let delta = 0;
                if (action === "add-10m") delta = 600;
                if (action === "add-1h") delta = 3600;
                if (action === "add-1d") delta = 86400;
                if (action === "add-1w") delta = 604800;
                if (action === "next-sun") {
                    const totalTime = game.time.worldTime
                        + ((game.settings.get(MODULE_ID, "dayOffset") || 0) * 86400)
                        + ((game.settings.get(MODULE_ID, "timeOffset") || 0) * 60);
                    const timeOfDay = ((totalTime % 86400) + 86400) % 86400;
                    const mins = Math.floor(timeOfDay / 60);
                    let dawn = 360, dusk = 1080;
                    const lP = LightingSystem.getClimateParams();
                    if (lP) {
                        if (lP.dawn) dawn = LightingSystem.parseTime(lP.dawn) || dawn;
                        if (lP.dusk) dusk = LightingSystem.parseTime(lP.dusk) || dusk;
                    }
                    // Smart: before dawn -> sunrise, daytime -> dusk, after dusk -> next dawn
                    let target;
                    if (mins < dawn)       { target = dawn; }
                    else if (mins < dusk)  { target = dusk; }
                    else                   { target = dawn; }
                    let diff = target - mins;
                    if (target === dawn && mins >= dusk) diff += (this.calendar?.config?.hours_per_day || 24) * 60;
                    delta = diff * 60;
                }

                // Modifiers
                if (e.ctrlKey) delta *= -1;

                if (delta !== 0) {
                     if (game.user.isGM) {
                        if (delta > 0) {
                            game.time.advance(delta);
                        } else {
                            // Negative advance (Rewind)
                            const newTime = game.time.worldTime + delta;
                            game.settings.set("core", "time", newTime);
                        }
                    } else {
                        game.user.setFlag(MODULE_ID, "timeRequest", { delta: delta, id: Date.now() });
                    }
                }
            });
        });

        // Toggle Clock Visibility
        const dungeonBtn = uiContainer.querySelector(".pdnc-dungeon-btn");
        if (dungeonBtn) {
            dungeonBtn.addEventListener("click", () => this.toggleDungeonMode());
        }

        const toggleBtn = uiContainer.querySelector(".pdnc-toggle-btn");
        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const disk = uiContainer.querySelector(".pdnc-disk");
            const isHidden = disk.classList.toggle("hidden");
            uiContainer.classList.toggle("clock-hidden", isHidden);
            // Toggle active state on button for styling
            toggleBtn.classList.toggle("active");
            this._updateSmartPosition();
        });

        toggleBtn.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._showOrientationMenu(toggleBtn);
        });

        // Prevent click propagation to disk/drag
        this.controls.addEventListener("mousedown", (e) => e.stopPropagation());

        // Ctrl Key Listeners for UI Feedback
        const updateShortcutLabels = (invert) => {
            if (!this.shortcuts) return;
            const btns = this.shortcuts.querySelectorAll('.pdnc-btn');
            btns.forEach(btn => {
                const action = btn.dataset.action;
                let base = "";
                if (action === "add-10m") base = "10m";
                if (action === "add-1h") base = "1h";
                if (action === "add-1d") base = "1d";
                if (action === "add-1w") base = "1w";
                
                if (base) {
                    btn.textContent = (invert ? "-" : "+") + base;
                    btn.style.color = invert ? "#ff6b6b" : "";
                }

                // next-sun: show undo icon when Ctrl held (= backward), restore smart icon on release
                if (action === "next-sun") {
                    if (invert) {
                        // Show the OPPOSITE icon in red (= what you jump back to)
                        const isCurrentlyMoon = btn.querySelector(".fa-moon") !== null;
                        if (isCurrentlyMoon) {
                            btn.innerHTML = '<i class="fas fa-sun"></i>';  // Ctrl+click goes back to sunrise
                        } else {
                            btn.innerHTML = '<i class="fas fa-moon"></i>'; // Ctrl+click goes back to dusk
                        }
                        btn.style.color = "#ff6b6b";
                    } else {
                        this._updateNextSunBtn(); // restore correct icon, no color
                        btn.title = game.i18n.localize("PDNC.NextSunriseSunset");
                    }
                }
            });
        };

        if (!this._keyDownBound) {
            this._keyDownHandler = (e) => {
                if (e.repeat) return; // ignore key-repeat events while held
                if (e.key === "Control" || e.keyCode === 17) updateShortcutLabels(true);
            };
            this._keyUpHandler = (e) => {
                 if (e.key === "Control" || e.keyCode === 17) updateShortcutLabels(false);
            };
            document.addEventListener("keydown", this._keyDownHandler);
            document.addEventListener("keyup", this._keyUpHandler);
            this._keyDownBound = true;
        }

        this.applyTheme();
        this.updateClock();

        // Hook for Theme Updates
        Hooks.on("pdnc.themeUpdated", () => {
            this.applyTheme();
            this.updateClock();
        });
    }

    applyTheme() {
        if (!this.container) return;
        
        const disk = this.container.querySelector(".pdnc-disk");
        if (!disk) return;

        // Cleanup existing SVG if re-rendering or switching modes
        const existingSvg = disk.querySelector(".pdnc-composite-face");
        if (existingSvg) existingSvg.remove();
        const existingFrame = disk.querySelector(".pdnc-composite-frame");
        if (existingFrame) existingFrame.remove();

        // Always use Composite Mode
        disk.style.backgroundImage = "none";
        this._renderCompositeFace(disk);
    }

    _renderCompositeFace(container) {
        const sectors = ThemeSystem.getPhaseSectors();
        const size = 300; // Arbitrary coordinate space size
        const center = size / 2;
        const radius = size / 2;

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
        svg.setAttribute("class", "pdnc-composite-face");
        // Style: Absolute fill, behind hands
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.zIndex = "0"; // Behind hands (hands are usually higher z-index or DOM order)
        svg.style.borderRadius = "50%";
        svg.style.overflow = "hidden"; // Clip to circle

        const defs = document.createElementNS(svgNS, "defs");
        svg.appendChild(defs);

        // Defined Visual Order for 9 Sectors (Clockwise from Top)
        // 1. Night (Top)
        // 2. Midnight
        // 3. Dawn
        // 4. Morning
        // 5. Forenoon
        // 6. Noon
        // 7. Dusk
        // 8. Evening
        // 9. LateEvening
        // --- SECTOR ATLAS (Manual Configuration) ---
        // Defined visual fields for the 8-part clock frame (mwclock.png).
        // User confirmed 8 Windows.
        // We have 8 Phases. Perfect 1:1 Mapping.
        // Geometry: 360 / 8 = 45 degrees per sector.
        // Anchor: Night Centered at Top (-90).
        // Start: -90 - 22.5 = -112.5.
        
        const SECTOR_ATLAS = [
            { id: "night",        start: -112.5, end: -67.5, label: "Night (Top)" },
            { id: "dawn",         start: -67.5,  end: -22.5, label: "Dawn" },
            { id: "morning",      start: -22.5,  end: 22.5,  label: "Morning" },
            { id: "late_morning", start: 22.5,   end: 67.5,  label: "Forenoon" },
            { id: "noon",         start: 67.5,   end: 112.5, label: "Noon (Bottom)" },
            { id: "afternoon",    start: 112.5,  end: 157.5, label: "Afternoon" },
            { id: "evening",      start: 157.5,  end: 202.5, label: "Evening" },
            { id: "late_evening", start: 202.5,  end: 247.5, label: "Late Evening" }
        ];

        // DEBUG MODE: Set to true to see colored sectors and labels instead of images
        const DEBUG_MODE = false;
        const DEBUG_COLORS = [
            "#000000", // Night (Black)
            "#4B0082", // Midnight (Indigo)
            "#FFC0CB", // Dawn (Pink)
            "#FFA500", // Morning (Orange)
            "#FFFF00", // Late Morning (Yellow)
            "#FFFFFF", // Noon (White)
            "#FF4500", // Dusk (OrangeRed)
            "#FF0000", // Evening (Red)
            "#8B0000"  // Late Evening (DarkRed)
        ];

        SECTOR_ATLAS.forEach((slot, index) => {
            // Find which dynamic phase covers this visual slot's center time
            const centerDeg = (slot.start + slot.end) / 2;
            let centerHour = (centerDeg + 90) / 15;
            if (centerHour < 0) centerHour += 24;
            if (centerHour >= 24) centerHour -= 24;

            const phases = ThemeSystem.PHASES;
            const phase = phases.find(p => {
                if (p.start < p.end) return centerHour >= p.start && centerHour < p.end;
                return centerHour >= p.start || centerHour < p.end;
            }) || phases[0]; // Fallback to first phase if gap exists

            const startRad = (slot.start * Math.PI) / 180;
            const endRad = (slot.end * Math.PI) / 180;

            // Coordinates
            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);

            const largeArc = 0;

            const pathData = [
                `M ${center} ${center}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`
            ].join(" ");

            // Create ClipPath
            const clipId = `clip-${index}`;
            const clipPath = document.createElementNS(svgNS, "clipPath");
            clipPath.setAttribute("id", clipId);
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathData);
            clipPath.appendChild(path);
            defs.appendChild(clipPath);

            // Group
            const g = document.createElementNS(svgNS, "g");
            
            // Calculate Translation for image alignment
            const midRad = (centerDeg * Math.PI) / 180;
            const dist = radius * 0.52;
            const tx = dist * Math.cos(midRad);
            const ty = dist * Math.sin(midRad);

            if (DEBUG_MODE) {
                const coloredPath = document.createElementNS(svgNS, "path");
                coloredPath.setAttribute("d", pathData);
                coloredPath.setAttribute("fill", DEBUG_COLORS[index] || "#ccc");
                coloredPath.setAttribute("stroke", "white");
                coloredPath.setAttribute("stroke-width", "1");
                g.appendChild(coloredPath);
            } else {
                g.setAttribute("clip-path", `url(#${clipId})`);

                const config = game.settings.get(MODULE_ID, "themeConfig");
                const imageUrl = ThemeSystem.resolvePhaseImage(config, phase.id);

                const img = document.createElementNS(svgNS, "image");
                img.setAttribute("href", imageUrl);
                
                const imgSize = 150;
                const offset = (size - imgSize) / 2;
                
                img.setAttribute("x", offset);
                img.setAttribute("y", offset);
                img.setAttribute("width", imgSize);
                img.setAttribute("height", imgSize);
                
                img.setAttribute("preserveAspectRatio", "xMidYMid slice"); 
                img.setAttribute("transform", `translate(${tx}, ${ty})`);
                
                g.appendChild(img);
            }

            svg.appendChild(g);
        });
        
        // Prepend to container so it sits behind existing hands
        // But hands are DIVs inside the container. SVG needs to be behind them.
        // Container has .pdnc-hand, .pdnc-hand-minute, etc.
        // If we append, it covers them unless z-index is lower.
        // Inserting as first child is safer. // SVG at bottom
        
        // --- FRAME OVERLAY ---
        // Create an overlay image for the "Frame" (clock.png)
        // This sits ON TOP of the SVG sectors (filling the transparent holes)
        // but BEHIND the hands.
        const frameImg = document.createElement("img");
        // Using clock.webp as requested (in root assets folder)
        frameImg.src = game.settings.get(MODULE_ID, "clockImage") || `modules/${MODULE_ID}/assets/clock.webp`;
        frameImg.className = "pdnc-composite-frame";
        frameImg.style.position = "absolute";
        frameImg.style.top = "0";
        frameImg.style.left = "0";
        frameImg.style.width = "100%";
        frameImg.style.height = "100%";
        frameImg.style.zIndex = "1"; // Above SVG sections
        frameImg.style.pointerEvents = "none"; // Let clicks pass through to disk/sectors

        // Append SVG then Frame
        // But we want them to be the FIRST children, so hands (zIndex auto/higher) are on top.
        // SVG first (z=0)
        container.insertBefore(svg, container.firstChild);
        // Frame second (z=1) - Insert before Hands (which we assume are after the first child now)
        // Actually, just append to container? No, hands need to be top.
        // If we insertBefore(svg, first) -> SVG is first.
        // Then insertBefore(frame, svg.nextSibling) -> Frame is second.
        container.insertBefore(frameImg, svg.nextSibling);
    }

    createTooltipElement(parent) {
        let tooltip = document.createElement("div");
        tooltip.className = "pdnc-tooltip";
        tooltip.innerHTML = `
            <div class="pdnc-tooltip-phase"></div>
            <div class="pdnc-tooltip-time"></div>
        `;
        parent.appendChild(tooltip);
        this.tooltip = tooltip;
        this.tooltipPhase = tooltip.querySelector(".pdnc-tooltip-phase");
        this.tooltipTime = tooltip.querySelector(".pdnc-tooltip-time");
    }

    handleDiskHover(e) {
        if (!this.tooltip) return;

        const rect = this.container.querySelector(".pdnc-disk").getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const x = e.clientX - centerX;
        const y = e.clientY - centerY;

        // Calculate Angle
        let angleRad = Math.atan2(y, x);
        let angleDeg = angleRad * (180 / Math.PI);

        // Convert to Clockwise from Top (0deg)
        let clockDeg = angleDeg + 90;
        if (clockDeg < 0) clockDeg += 360;

        // Convert to hours (0-24)
        const hoursHover = (clockDeg / 360) * 24;

        // Find Phase
        const phases = ThemeSystem.PHASES;
        const phase = phases.find(p => {
            if (p.start < p.end) {
                return hoursHover >= p.start && hoursHover < p.end;
            } else {
                // Wrap around (Night)
                return hoursHover >= p.start || hoursHover < p.end;
            }
        });

        if (phase) {
            this.tooltipPhase.textContent = phase.label.startsWith("PDNC.Phases") ? game.i18n.localize(phase.label) : phase.label;

            // Format Time Range
            const formatTime = (val) => {
                const h = Math.floor(val);
                const m = Math.round((val % 1) * 60);
                return CalendarSystem.formatTime(h, m);
            };

            this.tooltipTime.textContent = `${formatTime(phase.start)} – ${formatTime(phase.end)} Uhr`;

            // Position Tooltip
            const containerRect = this.container.getBoundingClientRect();
            let localX = e.clientX - containerRect.left;
            let localY = e.clientY - containerRect.top;

            this.tooltip.style.left = `${localX}px`;
            this.tooltip.style.top = `${localY}px`;
            this.tooltip.classList.add("visible");
        } else {
            this.tooltip.classList.remove("visible");
        }
    }

    _updateSmartPosition() {
        if (!this.container) return;
        const modeSetting = game.settings.get(MODULE_ID, "clockPosition") || "auto";

        let targetPos = modeSetting;
        if (modeSetting === "auto") {
            const displayEl = this.container.querySelector(".pdnc-time-display");
            const rect = displayEl ? displayEl.getBoundingClientRect() : this.container.getBoundingClientRect();
            
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;

            const spaceTop = rect.top;
            const spaceBottom = winHeight - rect.bottom;
            const spaceLeft = rect.left;
            const spaceRight = winWidth - rect.right;

            const DISK_NEEDED = 210;

            if (spaceRight < 80 && spaceLeft >= DISK_NEEDED) {
                targetPos = "left";
            } else if (spaceLeft < 80 && spaceRight >= DISK_NEEDED) {
                targetPos = "right";
            } else if (spaceTop < DISK_NEEDED && spaceBottom >= DISK_NEEDED) {
                targetPos = "below";
            } else {
                targetPos = "above";
            }
        }

        this.container.classList.remove("pdnc-pos-above", "pdnc-pos-below", "pdnc-pos-left", "pdnc-pos-right");
        this.container.classList.add(`pdnc-pos-${targetPos}`);
    }

    _showOrientationMenu(anchorBtn) {
        const existing = document.querySelector(".pdnc-orientation-menu");
        if (existing) {
            existing.remove();
            return;
        }

        const currentSetting = game.settings.get(MODULE_ID, "clockPosition") || "auto";

        const menu = document.createElement("div");
        menu.className = "pdnc-orientation-menu";
        menu.innerHTML = `
            <div style="font-size: 0.75em; color: #c5a059; opacity: 0.85; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px;">Ausrichtung</div>
            <div class="pdnc-orientation-grid">
                <button class="pdnc-orient-btn ${currentSetting === 'above' ? 'active' : ''}" data-pos="above" title="Über dem Bedienfeld (Oben)"><i class="fas fa-arrow-up"></i></button>
                <button class="pdnc-orient-btn ${currentSetting === 'left' ? 'active' : ''}" data-pos="left" title="Links vom Bedienfeld"><i class="fas fa-arrow-left"></i></button>
                <button class="pdnc-orient-btn ${currentSetting === 'auto' ? 'active' : ''}" data-pos="auto" title="Automatisch (Smart)"><i class="fas fa-wand-magic-sparkles"></i></button>
                <button class="pdnc-orient-btn ${currentSetting === 'right' ? 'active' : ''}" data-pos="right" title="Rechts vom Bedienfeld"><i class="fas fa-arrow-right"></i></button>
                <button class="pdnc-orient-btn ${currentSetting === 'below' ? 'active' : ''}" data-pos="below" title="Unter dem Bedienfeld (Unten)"><i class="fas fa-arrow-down"></i></button>
            </div>
        `;

        document.body.appendChild(menu);
        const rect = anchorBtn.getBoundingClientRect();
        menu.style.left = `${Math.max(10, rect.left + rect.width / 2 - 55)}px`;
        menu.style.top = `${Math.max(10, rect.top - 125)}px`;

        const btns = menu.querySelectorAll(".pdnc-orient-btn");
        btns.forEach(btn => {
            btn.addEventListener("click", async (ev) => {
                ev.stopPropagation();
                const pos = btn.dataset.pos;
                await game.settings.set(MODULE_ID, "clockPosition", pos);
                this._updateSmartPosition();
                menu.remove();
            });
        });

        const closeHandler = (ev) => {
            if (!menu.contains(ev.target) && ev.target !== anchorBtn) {
                menu.remove();
                document.removeEventListener("click", closeHandler);
                document.removeEventListener("contextmenu", closeHandler);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", closeHandler);
            document.addEventListener("contextmenu", closeHandler);
        }, 10);
    }

    dragElement(elmnt) {
        const self = this;
        let pos3 = 0, pos4 = 0;

        elmnt.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            // Capture initial cursor
            pos3 = e.clientX;
            pos4 = e.clientY;

            // Ensure inline styles are set (handling initial CSS state)
            if (!elmnt.style.left) {
                elmnt.style.left = window.getComputedStyle(elmnt).left;
            }
            if (!elmnt.style.bottom) {
                elmnt.style.bottom = window.getComputedStyle(elmnt).bottom;
            }

            // Clear contradictory styles
            elmnt.style.top = "auto";
            elmnt.style.right = "auto";

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            elmnt.style.cursor = "grabbing";
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            // Calculate Deltas
            // X: New - Old (Moving Right = Positive)
            const deltaX = e.clientX - pos3;
            // Y: Old - New (Moving Up = Decreasing Y = Positive Delta for Bottom)
            const deltaY = pos4 - e.clientY;

            // Update Cursor for next frame
            pos3 = e.clientX;
            pos4 = e.clientY;

            // Apply to Styles
            const currentLeft = parseFloat(elmnt.style.left) || 0;
            const currentBottom = parseFloat(elmnt.style.bottom) || 0;

            elmnt.style.left = (currentLeft + deltaX) + "px";
            elmnt.style.bottom = (currentBottom + deltaY) + "px";

            if (self) self._updateSmartPosition();
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
            elmnt.style.cursor = "grab";

            // Save position (Left and Bottom)
            // We save Bottom so that changes in height (toggling UI) don't shift the clock relative to the bottom of the screen.
            const rect = elmnt.getBoundingClientRect();
            // Calculate bottom distance relative to viewport height
            const bottomVal = window.innerHeight - rect.bottom;
            
            game.settings.set(MODULE_ID, "posX", elmnt.offsetLeft);
            // We use the computed bottom style or calculation
            // elmnt.style.bottom should be accurate from the drag function, but let's be safe
            // The drag function sets style.bottom directly.
            game.settings.set(MODULE_ID, "posBottom", parseInt(elmnt.style.bottom));
            game.settings.set(MODULE_ID, "posY", elmnt.offsetTop); // Keep for legacy or debug

            if (self) self._updateSmartPosition();
        }
    }

    _updateNextSunBtn() {
        if (!this.shortcuts) return;
        const btn = this.shortcuts.querySelector('[data-action="next-sun"]');
        if (!btn) return;

        const totalTime = game.time.worldTime
            + ((game.settings.get(MODULE_ID, "dayOffset") || 0) * 86400)
            + ((game.settings.get(MODULE_ID, "timeOffset") || 0) * 60);
        const timeOfDay = ((totalTime % 86400) + 86400) % 86400;
        const mins = Math.floor(timeOfDay / 60);

        let dawn = 360, dusk = 1080;
        const lP = LightingSystem.getClimateParams();
        if (lP) {
            if (lP.dawn) dawn = LightingSystem.parseTime(lP.dawn) || dawn;
            if (lP.dusk) dusk = LightingSystem.parseTime(lP.dusk) || dusk;
        }

        const nextIsDusk = (mins >= dawn && mins < dusk); // true = daytime -> next event is dusk
        if (nextIsDusk) {
            // Daytime: next event is sunset/dusk -> show moon icon
            btn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            // Night/Pre-Dawn: next event is sunrise -> show sun icon
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        }
        btn.style.color = ""; // always default color (no override)
    }

    updateClock() {
        if (!this.container) return;

        // Get current world time in seconds
        let worldTime = game.time.worldTime;

        // Apply Offset (Days)
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset");
        worldTime += (offsetDays * 86400);

        // Apply Offset (Minutes)
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset");
        worldTime += (offsetMinutes * 60);

        // // Log:("PDNC Debug | Day Offset:", offsetDays, "Time Offset:", offsetMinutes);
        // // Log:("PDNC Debug | Original Time:", game.time.worldTime, "Adjusted Time:", worldTime);

        // Calculate seconds elapsed in the current day
        // Assuming a standard 24h day = 86400 seconds
        const dayLength = 86400;
        let timeOfDay = worldTime % dayLength; // Seconds since midnight

        // Handle negative modulo result if offset keeps it negative (JS % operator behavior)
        if (timeOfDay < 0) timeOfDay += dayLength;

        const minutesOfDay = Math.floor(timeOfDay / 60);
        const hours = Math.floor(minutesOfDay / 60);
        const minutes = minutesOfDay % 60;

        // Calculate rotation (0 to 360 degrees)
        const rotation = (minutesOfDay / 1440) * 360;
        this.hand.style.transform = `rotate(${rotation}deg)`;

        // Minute Hand Rotation
        const minuteRotation = (minutes / 60) * 360;
        this.minuteHand.style.transform = `rotate(${minuteRotation}deg)`;

        // Update smart next-sun button icon
        this._updateNextSunBtn();

        // Solar Arc Update

    if (this.sunGroup) {
        const svg = this.sunGroup.closest("svg");
        const track = svg.querySelector(".pdnc-solar-track");
        
        // Measure Container
        const rect = svg.getBoundingClientRect();
        const cw = rect.width;
        const ch = rect.height;
        
        // Find Reference Points
        // Find Reference Points
        const controls = this.container.querySelector(".pdnc-controls");
        
        // Fix: Check visibility. If display:none, offsetTop is 0, causing inverted arc.
        const controlsVisible = controls && controls.offsetParent !== null;
        // If visible, use its top. If hidden, use container bottom with some padding.
        const controlsY = controlsVisible ? controls.offsetTop : ch - 15; 

        // Define Geometry (Dynamic)
        // Anchor slightly above the separator line (align with Weekday text)
        // ControlsY is the top of the buttons.
        const startY = controlsY - 45;
        const endY = controlsY - 45;
        
        // Padding from sides
        const paddingX = 15;
        
        
        // Peak Position (Top of card, or just above "Dawn/Morning" text)
        const peakY = 10; // Compromise: 14px gives clearance but keeps it tight 

        const p0 = { x: paddingX, y: startY };
        const p2 = { x: cw - paddingX, y: endY };
        
        // Calculate Control Point (P1) to force Vertex at peakY
        const p1 = { x: cw / 2, y: (2 * peakY) - startY };

        // Update Track Path
        if (track) {
            const d = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;
            track.setAttribute("d", d);
        }

        // Get Dynamic Dawn/Dusk/Noon from Lighting System
        const lightingParams = LightingSystem.getClimateParams();
        let dawnMinutes = 360; // Default 06:00
        let duskMinutes = 1080; // Default 18:00
        let noonMinutes = 720; // Default 12:00
        
        if (lightingParams) {
            if (lightingParams.dawn) dawnMinutes = LightingSystem.parseTime(lightingParams.dawn);
            if (lightingParams.dusk) duskMinutes = LightingSystem.parseTime(lightingParams.dusk);
            if (lightingParams.noon) noonMinutes = LightingSystem.parseTime(lightingParams.noon);
            else noonMinutes = dawnMinutes + (duskMinutes - dawnMinutes) / 2; // Fallback
        }

        // Calculate Progress using Dawn -> Noon -> Dusk interpolation
        // This ensures the sun is exactly at the peak (t=0.5) at Noon
        let sunT = -1;
        
        if (minutesOfDay >= dawnMinutes && minutesOfDay < noonMinutes) {
            // First Half: Dawn to Noon -> 0.0 to 0.5
            sunT = 0.5 * (minutesOfDay - dawnMinutes) / (noonMinutes - dawnMinutes);
        } else if (minutesOfDay >= noonMinutes && minutesOfDay <= duskMinutes) {
            // Second Half: Noon to Dusk -> 0.5 to 1.0
            sunT = 0.5 + 0.5 * (minutesOfDay - noonMinutes) / (duskMinutes - noonMinutes);
        } else if (minutesOfDay < dawnMinutes) {
             // Pre-Dawn: Clamp to Start
             sunT = 0;
        } else {
             // Post-Dusk: Clamp to End
             sunT = 1;
        }
        
        // Visibility Check
        if (minutesOfDay < dawnMinutes || minutesOfDay > duskMinutes) {
             this.sunGroup.style.opacity = "0";
        } else {
             this.sunGroup.style.opacity = "1";
        }

        // Update Position (always, to avoid jumps when appearing)
        const t = sunT;
        const invT = 1 - t;

        const x = (invT * invT * p0.x) + (2 * invT * t * p1.x) + (t * t * p2.x);
        const y = (invT * invT * p0.y) + (2 * invT * t * p1.y) + (t * t * p2.y);

        this.sunGroup.style.transform = `translate(${x}px, ${y}px)`;
    }

    // --- MOON ARC UPDATE ---
    if (this.moonGroup) {
        const lightingParams = LightingSystem.getClimateParams();
        let duskMinutes = 1080;
        let dawnMinutes = 360;
        
        if (lightingParams) {
             if (lightingParams.dusk) duskMinutes = LightingSystem.parseTime(lightingParams.dusk);
             if (lightingParams.dawn) dawnMinutes = LightingSystem.parseTime(lightingParams.dawn);
        }

        // --- VISUALS: Phase & Rotation ---
        const moonData = LightingSystem.getMoonData(worldTime);

        // Opacity Logic
        // Position Logic: Use Explicit Cinematic Offsets from DATA
        // determining position strictly by phase definition, ensuring night visibility.
        const continuousOffset = moonData.phase.solar_offset_hours;
        
        // Sun Glare Rule: If Moon is within +/- 2.5 hours of Sun, hide it.
        const dist = Math.min(Math.abs(continuousOffset), 24 - Math.abs(continuousOffset));
        if (dist < 2.5) {
             this.moonGroup.style.opacity = "0";
        } else {
             // Calculate Virtual Moon Time (0-24h)
             // Formula: (CurrentTime - Offset + 24) % 24
             // Use high-precision Seconds for smoothness
             const currentHours = timeOfDay / 3600;
             let moonVirtualTime = (currentHours - continuousOffset + 24) % 24;
             
             // Mapping to Arc (Horizon Window)
             // The visual arc represents the "Sky" from Horizon to Horizon.
             // We define the Sky Window as: Rising (06:00) -> Zenith (12:00) -> Setting (18:00).
             // Any MoonVirtualTime outside 06:00-18:00 is below the horizon (Invisible).
             
             // Map 6..18 to 0..1
             const RISE = 6;
             const SET = 18;
             


             let moonT = -1;
             
             if (moonVirtualTime >= RISE && moonVirtualTime <= SET) {
                 moonT = (moonVirtualTime - RISE) / (SET - RISE);
             } else if (moonVirtualTime < RISE) {
                 moonT = 0; // Pre-Rise Clamp
             } else {
                 moonT = 1; // Post-Set Clamp
             }
             
             // --- VISUALS: Opacity ---
             // Determine Opacity (visible only if in range AND not glared)
             const isVisible = (moonVirtualTime >= RISE && moonVirtualTime <= SET);
             
             if (isVisible) {
                 // Determine Opacity (Day vs Night)
                 // Use ACTUAL Seasonal Dawn/Dusk to determine "Is it bright out?"
                 // If so, render faint moon.
                 let isDay = false;
                 if (dawnMinutes < duskMinutes) {
                     if (minutesOfDay >= dawnMinutes && minutesOfDay <= duskMinutes) isDay = true;
                 } else {
                     if (minutesOfDay >= dawnMinutes || minutesOfDay <= duskMinutes) isDay = true;
                 }
                 
                 // Render Opacity
                 // Day: 0.6, Night: 1.0
                 this.moonGroup.style.opacity = isDay ? "0.6" : "1.0";
             } else {
                 this.moonGroup.style.opacity = "0";
             }

             // --- GEOMETRY & TRANSFORM (Always Update) ---
             // Calculate geometry even if hidden so it snaps to Start/End
             // This prevents "flying back" animation when it reappears
             
             const svg = this.moonGroup.closest("svg");
             const rect = svg.getBoundingClientRect();
             const cw = rect.width;
             const ch = rect.height;
             const controls = this.container.querySelector(".pdnc-controls");
             
             // Fix: Check visibility. If display:none, offsetTop is 0, causing inverted arc.
             const controlsVisible = controls && controls.offsetParent !== null;
             const controlsY = controlsVisible ? controls.offsetTop : ch - 15;
 
             const startY = controlsY - 45;
             const endY = controlsY - 45;
             const paddingX = 15;
             const peakY = 10;
             const p0 = { x: paddingX, y: startY };
             const p2 = { x: cw - paddingX, y: endY };
             const p1 = { x: cw / 2, y: (2 * peakY) - startY };

             const t = moonT; // Uses clamped value if invalid
             const invT = 1 - t;
             const x = (invT * invT * p0.x) + (2 * invT * t * p1.x) + (t * t * p2.x);
             const y = (invT * invT * p0.y) + (2 * invT * t * p1.y) + (t * t * p2.y);
             
             // --- VISUALS: Phase & Rotation ---
             // (Reuse already calculated moonData)
             
             // 1. Rotation based on Region + Waxing/Waning
             // Midpoint is day 15.
             // If dayInCycle <= 15: Waxing (Standard).
             // If dayInCycle > 15: Waning (Flipped).
             
             const isWaning = moonData.dayInCycle > 15;
             let rotation = moonData.region.rotation;
             
             // If Waning, we flip 180 degrees to show the "Other side" lit
             if (isWaning) rotation += 180;
             
             // Apply Transform: Translate + Rotate
             this.moonGroup.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
             
             // 2. Draw Phase Shape (Standard Waxing from Right)
             const r = 5; // Radius
             let d = "";
             
             switch (moonData.phase.icon_state) {
                 case "empty": d = ""; break;
                 case "crescent": d = `M 0 -${r} A ${r} ${r} 0 0 1 0 ${r} A 2.5 ${r} 0 0 1 0 -${r}`; break;
                 case "half": d = `M 0 -${r} A ${r} ${r} 0 0 1 0 ${r} Z`; break;
                 case "gibbous": d = `M 0 -${r} A ${r} ${r} 0 1 1 0 ${r} A 2.5 ${r} 0 0 1 0 -${r}`; break;
                 case "full": d = `M 0 -${r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 -${r}`; break;
             }
             
             if (this.moonPhasePath) this.moonPhasePath.setAttribute("d", d);
        }


        // Determine Phase
        const phases = ThemeSystem.PHASES;
        const currentPhase = phases.find(p => {
             const h = timeOfDay / 3600;
             if (p.start < p.end) return h >= p.start && h < p.end;
             return h >= p.start || h < p.end;
        });

        if (currentPhase) {
            this.icon.textContent = "";
            this.icon.style.display = "none";
            this.label.textContent = currentPhase.label.startsWith("PDNC.Phases") ? game.i18n.localize(currentPhase.label) : currentPhase.label;
        } else {
            this.icon.textContent = "??";
            this.label.textContent = "Unknown Time";
        }

        // Update Digital Clock Text
        const timeString = CalendarSystem.formatTime(hours, minutes);
        this.clockText.textContent = timeString;

        // Update Date Text
        if (this.dateText && this.calendar) {
            const dateData = this.calendar.getDate(worldTime); // Use adjusted worldTime
            
            const showRealNames = game.settings.get(MODULE_ID, "showRealNames");
            this.dateText.innerHTML = this.calendar.formatDate(dateData, {
                includeWeekday: true,
                multiline: showRealNames
            });
        }

        // Update Weather UI
        if (this.weatherIcon) {
            const weatherGroup = this.container.querySelector(".pdnc-weather-group");
            const weatherEnabled = game.settings.get(MODULE_ID, "enableWeather");
            
            if (!weatherEnabled) {
                if (weatherGroup) weatherGroup.style.display = "none";
                this.tempText.textContent = "";
                return;
            }

            const weather = game.settings.get(MODULE_ID, "currentWeather");
            
            // ALWAYS show the icon if weather system is enabled, so GM can click to configure/generate
            if (weatherGroup) weatherGroup.style.display = "flex";

            if (weather && weather.generated) {
                // Get dynamic temperature
                const currentTemp = WeatherSystem.getCurrentTemperature();
                const unit = game.settings.get(MODULE_ID, "temperatureUnit") || "C";
                this.tempText.textContent = `${currentTemp}°${unit}`;
            } else {
                // Not generated yet
                this.tempText.textContent = "--";
            }
        }

        }


    }

    async toggleDungeonMode() {
        if (!game.user.isGM) return;
        const scene = canvas.scene;
        if (!scene) {
            ui.notifications.warn("PDNC | No active scene to configure.");
            return;
        }
        
        new DungeonModeConfig().render({ force: true });
    }

    async checkCalendarNotifications() {
        if (!game.user.isGM) return;

        // Apply offsets to get "Calendar Time"
        const worldTime = game.time.worldTime;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const adjustedTime = worldTime + (offsetDays * 86400) + (offsetMinutes * 60);

        const currentDate = this.calendar.getDate(adjustedTime);
        const todayId = `${currentDate.year}-${currentDate.month}-${currentDate.day}`;

        // Load Last State
        let lastState = game.settings.get(MODULE_ID, "lastNotificationState") || {};
        if (typeof lastState !== 'object') lastState = {};

        // Calculate sortable date values (YYYYMMDD)
        const currentVal = (currentDate.year * 10000) + (currentDate.month * 100) + currentDate.day;
        const lastVal = (lastState.year * 10000) + (lastState.month * 100) + lastState.day || 0;

        // State Management
        let notifiedEvents = new Set(lastState.notifiedEvents || []);
        
        // New Day Detected: Clear tracked events
        if (currentVal > lastVal) {
            notifiedEvents.clear();
        }
        // Backwards Time Travel
        else if (currentVal < lastVal) {
            // DETECT WORLD RESET: If we jumped back more than 1 year, assume a campaign reset and allow it.
            // Also explicitly allow Year 0 if we were previously much further ahead.
            const yearDiff = lastState.year - currentDate.year;
            if (yearDiff >= 1) {
                // Log:("PDNC | World Time Reset detected (Backward Jump > 1 Year). Resetting notification state.");
                notifiedEvents.clear();
                // We proceed (do not return)
            } else {
                // Small backward jump (scrubbing timeline) -> Block to avoid spam
                return;
            }
        }

        // Perform Checks
        const savedEvents = await CalendarDB.getEvents();
        const contentEntries = [];
        const newNotificationIds = [];

        // Iterate all events
        for (const [key, eventList] of Object.entries(savedEvents)) {
            if (!eventList || key.startsWith("-=")) continue;
            for (const event of eventList) {
                // EXCLUDE WEATHER EVENTS FROM GENERIC NOTIFICATIONS
                if (event.type === 'weather') continue;

                // Determine Unique ID for this notification instance (EventID + Date)
                // Use the event's internal ID if available, or title hash/timestamp fallback
                const eventId = event.id || event.documentId || event.title; 
                // We suffix with the TARGET DATE of the notification to handle recurring events uniquely per day
                
                // 1. Check for TODAY occurrence
                const [srcY, srcM, srcD] = key.split('-').map(Number);
                let isToday = false;
                
                if (!event.recurring || event.recurring === 'none') {
                    if (srcY === currentDate.year && srcM === currentDate.month && srcD === currentDate.day) isToday = true;
                } else {
                    if (this.calendar.isRecurringMatch(event, srcY, srcM, srcD, currentDate.year, currentDate.month, currentDate.day)) {
                        isToday = true;
                    }
                }

                if (isToday) {
                     const uniqueKey = `TODAY:${eventId}:${todayId}`;
                     
                     if (!notifiedEvents.has(uniqueKey)) {
                         // Add clickable link class and data attribute
                         let entryHtml = `<p><strong>${game.i18n.localize("PDNC.EventCreated")}:</strong> <a class="pdnc-event-link" data-date="${todayId}" data-document-id="${event.documentId || ''}"><i class="fas fa-calendar-check"></i> ${event.title}</a>`;
                         
                         if (event.link && event.documentId) {
                             // User requested removal of icon link
                         } else if (event.link) {
                              entryHtml += ` ${event.link}`;
                         }
                         
                         entryHtml += `</p>`;
                         contentEntries.push(entryHtml);
                         newNotificationIds.push(uniqueKey);
                     }
                }

                // 2. Check for REMINDERS
                const reminderDays = Number(event.reminder) || 0;
                if (reminderDays > 0) {
                    const targetFutureTime = adjustedTime + (reminderDays * 86400);
                    const targetFutureDate = this.calendar.getDate(targetFutureTime);
                    
                    let isUpcoming = false;
                    
                    if (!event.recurring || event.recurring === 'none') {
                        if (srcY === targetFutureDate.year && srcM === targetFutureDate.month && srcD === targetFutureDate.day) {
                             isUpcoming = true;
                        }
                    } else {
                         if (this.calendar.isRecurringMatch(event, srcY, srcM, srcD, targetFutureDate.year, targetFutureDate.month, targetFutureDate.day)) {
                             isUpcoming = true;
                         }
                    }

                    if (isUpcoming) {
                         const futureDateId = `${targetFutureDate.year}-${targetFutureDate.month}-${targetFutureDate.day}`;
                         const uniqueKey = `REMIND:${eventId}:${futureDateId}`;
                         
                         if (!notifiedEvents.has(uniqueKey)) {
                             contentEntries.push(`<p><strong>${game.i18n.localize("PDNC.ReminderDays")} (${reminderDays} ${game.i18n.localize("PDNC.TimeDay")}):</strong> <a class="pdnc-event-link" data-date="${futureDateId}"><i class="fas fa-calendar-alt"></i> ${event.title}</a></p>`);
                             newNotificationIds.push(uniqueKey);
                         }
                    }
                }
            }
        }

        // Post Chat Message if entries exist
        if (contentEntries.length > 0) {
            const dateStr = `${currentDate.day}. ${currentDate.monthName} ${currentDate.year}`;
            const content = `
                <div class="pdnc-chat-card">
                    <h3>${game.i18n.localize("PDNC.CalendarTitle")} - ${dateStr}</h3>
                    ${contentEntries.join('')}
                </div>
            `;
            
            ChatMessage.create({
                user: game.user.id,
                content: content,
                speaker: ChatMessage.getSpeaker({ alias: "Calendar" })
            });
            
            // Add new IDs to set
            newNotificationIds.forEach(id => notifiedEvents.add(id));
        }

        // Update State (Lazy Save)
        const newState = { 
            dateId: todayId,
            year: currentDate.year,
            month: currentDate.month,
            day: currentDate.day,
            notifiedEvents: Array.from(notifiedEvents) // Serialize Set
        };

        // Check if anything actually changed before hitting the database
        // We compare critical fields: dateId and the contents of notifiedEvents
        const eventsChanged = JSON.stringify(newState.notifiedEvents) !== JSON.stringify(lastState.notifiedEvents);
        const dateChanged = newState.dateId !== lastState.dateId;

        if (dateChanged || eventsChanged) {
            await game.settings.set(MODULE_ID, "lastNotificationState", newState);
        }
    }

    toggleDungeonMode() {
        new DungeonModeConfig().render(true);
    }
}

const dayNightCycle = new PhilsDayNightCycle();
window.PhilsDayNightCycle = dayNightCycle;
window.dayNightCycle = dayNightCycle;
Hooks.once("init", () => dayNightCycle.init());

Hooks.once("ready", async () => {
    try {
        // --- SETTINGS VALIDATION & TRANSLATION FIX ---
        // Ensure the setting choices are localized correctly (as init might run before i18n is fully passed)
        const currentChoices = WeatherSystem.getClimateList();
        const setting = game.settings.settings.get(`${MODULE_ID}.climateZone`);
        if (setting) {
            setting.choices = currentChoices;
        }

        // Validate current selection (reset if deleted)
        await WeatherSystem.validateSettings(); 
        // --- TIME CHANGE HANDLING (User Flags Fallback) ---
        // Sockets failed, so we use User Flags as a communication channel.
        if (game.user.isGM) {
            Hooks.on("updateUser", async (user, changes, options, userId) => {
                const request = changes.flags?.[MODULE_ID]?.timeRequest;
                if (request) {
                    const { delta, id } = request;

                    if (delta > 0) {
                        game.time.advance(delta);
                    } else {
                        const newTime = game.time.worldTime + delta;
                        await game.settings.set("core", "time", newTime);
                    }

                    // Acknowledge/Clear the request so it can be sent again
                    // Use unsetFlag with -null syntax or native function
                    await user.unsetFlag(MODULE_ID, "timeRequest");
                }
            });
        }

        // --- CALENDAR REFRESH HANDLING ---
        // Listen for changes to the DB Journal to auto-refresh the UI and flush cache
        Hooks.on("updateJournalEntry", (doc, change, options, userId) => {
            const dbId = game.settings.get(MODULE_ID, "dbJournalId");
            if (doc.id === dbId) {
                // Flush cache so we fetch new data next time
                CalendarDB.flushCache();
                dayNightCycle.refreshCalendar();
            }
        });

        await CalendarDB.ensureDB();

        // FORCE CLEANUP: WIPE LEGACY SETTINGS
        if (game.user.isGM) {
            const legacyData = game.settings.get(MODULE_ID, "calendarEvents");
            if (legacyData && Object.keys(legacyData).length > 0) {
                // Log:(`${MODULE_ID} | Force-clearing legacy 'calendarEvents' setting to prevent zombie data.`);
                await game.settings.set(MODULE_ID, "calendarEvents", {});
            }
        }

        dayNightCycle.createUI();
        if (!game.settings.get(MODULE_ID, "visible")) {
            dayNightCycle.toggle(false);
        }
        dayNightCycle.updateClock();

        // --- Automatic Macro Creation ---
        const macros = [
            {
                name: "Toggle Day/Night Clock",
                command: `if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggle();`,
                img: "icons/magic/time/day-night-sunset-sunrise.webp",
                type: "script"
            },
            {
                name: "Reset Clock Position",
                command: `if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.resetPosition();`,
                img: "icons/commodities/tech/cog-bronze.webp",
                type: "script"
            },
            {
                name: "Set Time (Day/Night)",
                command: `// Change the time below (Hour, Minute)\nif (window.PhilsDayNightCycle) window.PhilsDayNightCycle.setTime(12, 0);`,
                img: "icons/commodities/tech/watch.webp",
                type: "script"
            },
            {
                name: "Toggle Calendar Window",
                command: `if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggleCalendar();`,
                img: "icons/sundries/documents/document-bound-white.webp",
                type: "script"
            },
            {
                name: "Dungeon Mode (Scene Toggle)",
                command: `if (window.PhilsDayNightCycle) window.PhilsDayNightCycle.toggleDungeonMode();`,
                img: "icons/environment/wilderness/mine-interior-dungeon-door.webp",
                type: "script"
            }
        ];

        if (game.user.isGM) {
            for (const data of macros) {
                const existing = game.macros.find(m => m.name === data.name);
                if (!existing) {
                    await Macro.create(data);
                    // Log:(`${MODULE_ID} | Created macro: ${data.name}`);
                } else {
                    await existing.update(data);
                    // Log:(`${MODULE_ID} | Updated macro: ${data.name}`);
                }
            }
        }
    } catch (err) {
        console.error(`${MODULE_ID} | CRITICAL ERROR in Ready Hook:`, err);
    }
});

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class TimeMachineApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static get DEFAULT_OPTIONS() {
        return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            tag: "form",
            id: "phils-time-machine",
            window: {
                title: "PDNC.TimeMachineTitle",
                icon: "fas fa-hourglass-start",
                resizable: false
            },
            position: {
                width: 400,
                height: "auto"
            },
            classes: ["pdnc-event-editor-window", "pdnc-nav-window"],
            actions: {
                save: TimeMachineApp.prototype._onSave,
                nextSun: TimeMachineApp.prototype._onNextSun
            }
        });
    }

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/time-machine.html`
        }
    };

    get title() {
        return game.i18n.localize("PDNC.TimeMachineTitle");
    }

    /** @override */
    async _prepareContext(options) {
        const calendar = dayNightCycle.calendar;
        const config = calendar.config;

        // Apply Offsets for Visual Consistency
        let worldTime = game.time.worldTime;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        worldTime += (offsetDays * 86400) + (offsetMinutes * 60);

        // Get current date
        const dateData = calendar.getDate(worldTime);
        // dateData has: year, month (index), day (1-based), etc.

        return {
            config: config,
            currentYear: dateData.year,
            currentMonth: dateData.month, // Index
            currentDay: dateData.day, // 1-based
            months: config.months.map((m, i) => {
                // Strip HTML tags for dropdown visibility
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = m.name;
                const plainName = tempDiv.textContent || tempDiv.innerText || m.name;

                return {
                    value: i,
                    label: plainName,
                    selected: i === dateData.month
                };
            })
        };
    }

    /**
     * Handle save action
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    async _onSave(event, target) {
        event.preventDefault();
        event.stopPropagation();
        // Log:("PDNC | Time Machine Save Action Triggered");
        
        const form = this.element; // In V2, this.element is the form if tag: 'form'
        // Or if tag is div, we look for form. But manual ID access works fine here.

        const d = Number(form.querySelector('#pdnc-nav-day').value);
        const m = Number(form.querySelector('#pdnc-nav-month').value);
        const y = Number(form.querySelector('#pdnc-nav-year').value);

        let timestamp = dayNightCycle.calendar.getTimestamp(y, m, d);

        // Reverse Offsets to set correct engine time
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        timestamp -= (offsetDays * 86400) + (offsetMinutes * 60);

        await game.settings.set("core", "time", timestamp);

        // Refresh Calendar if open
        const app = foundry.applications.instances.get("phils-calendar-app");
        if (app) {
            app.viewYear = y;
            app.viewMonth = m;
            app.render();
        }
        this.close();
    }

    async _onNextSun(event, target) {
        event.preventDefault();
        event.stopPropagation();
        
        if (!window.dayNightCycle) return;

        const currentWorldTime = game.time.worldTime;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const totalTime = currentWorldTime + (offsetDays * 86400) + (offsetMinutes * 60);

        const dateData = dayNightCycle.calendar.getDate(totalTime);
        const minutesOfDay = (dateData.hours * 60) + dateData.minutes;

        const season = dayNightCycle.weather?.currentSeason || "spring";
        const zone = game.settings.get(MODULE_ID, "climateZone") || "marine_west_coast";
        let dawnMinutes = 360; 
        let duskMinutes = 1080; 

        if (dayNightCycle.lighting) {
             const lightingParams = dayNightCycle.lighting.getLightingForSeasonAndZone(season, zone);
             if (lightingParams) {
                 if (lightingParams.dawn) dawnMinutes = dayNightCycle.lighting.constructor.parseTime(lightingParams.dawn) || dawnMinutes;
                 if (lightingParams.dusk) duskMinutes = dayNightCycle.lighting.constructor.parseTime(lightingParams.dusk) || duskMinutes;
             }
        }

        let targetMinutesOfDay = 0;
        let daysToAdd = 0;

        if (minutesOfDay < dawnMinutes) {
            targetMinutesOfDay = dawnMinutes;
        } else if (minutesOfDay < duskMinutes) {
            targetMinutesOfDay = duskMinutes;
        } else {
            targetMinutesOfDay = dawnMinutes;
            daysToAdd = 1;
        }

        let diffMinutes = targetMinutesOfDay - minutesOfDay;
        if (daysToAdd > 0) {
            // Check if dayNightCycle.calendar config has hours per day, assume 24 hours
            const hoursPerDay = dayNightCycle.calendar.config?.hours_per_day || 24;
            diffMinutes += hoursPerDay * 60;
        }

        const advanceSeconds = diffMinutes * 60;
        await game.time.advance(advanceSeconds);
        this.close();
    }
}
