import { PhilsCalendarApp } from "./calendar-app.js";
import { CalendarSystem } from "./calendar-system.js";
import { CalendarDB } from "./calendar-db.js";
import { WeatherSystem } from "./weather-system.js";
import { LightingSystem } from "./lighting-system.js";
import { WeatherConfigApp } from "./apps/weather-config.js";
import { CustomClimateApp } from "./apps/custom-climate.js";
import { WeatherHUD } from "./weather-hud.js";

const MODULE_ID = "phils-day-night-cycle";

class PhilsDayNightCycle {
    constructor() {
        this.container = null;
        this.calendar = null;
        this.hand = null;
        this.minuteHand = null;
        this.icon = null;
        this.label = null;
        this.clockText = null;

        this.phases = [
            { start: 0, end: 179, label: "PDNC.Phases.Night" },
            { start: 180, end: 359, label: "PDNC.Phases.Dawn" },
            { start: 360, end: 539, label: "PDNC.Phases.Morning" },
            { start: 540, end: 719, label: "PDNC.Phases.Forenoon" },
            { start: 720, end: 899, label: "PDNC.Phases.Noon" },
            { start: 900, end: 1079, label: "PDNC.Phases.Afternoon" },
            { start: 1080, end: 1259, label: "PDNC.Phases.Evening" },
            { start: 1260, end: 1439, label: "PDNC.Phases.LateEvening" }
        ];

        this.lastPromptedDate = "";
    }

    init() {
        console.log(`${MODULE_ID} | Initializing...`);

        // Register Templates
        const templatePaths = [
            `modules/${MODULE_ID}/templates/weather-config-form.hbs`,
            `modules/${MODULE_ID}/templates/custom-climate-list.hbs`,
            `modules/${MODULE_ID}/templates/custom-climate-editor.hbs`
        ];
        loadTemplates(templatePaths);

        // Register Visibility Setting
        game.settings.register(MODULE_ID, "visible", {
            name: game.i18n.localize("PDNC.SettingVisibleName"),
            hint: game.i18n.localize("PDNC.SettingVisibleHint"),
            scope: "client",
            config: false, // Managed via macro/code
            type: Boolean,
            default: true,
            onChange: (value) => this.toggle(value)
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

        // Register Position Settings
        game.settings.register(MODULE_ID, "posX", {
            name: game.i18n.localize("PDNC.SettingPostXName"), // Typo in key "PostX" -> Fixed in json? I wrote "SettingPostXName".
            scope: "client",
            config: false,
            type: Number,
            default: -1 // Use -1 to indicate "default CSS position"
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

        game.settings.register(MODULE_ID, "timeOffset", {
            name: game.i18n.localize("PDNC.SettingTimeOffsetName"),
            hint: game.i18n.localize("PDNC.SettingTimeOffsetHint"),
            scope: "world",
            config: true, // Show in settings menu
            type: Number,
            default: 0,
            onChange: () => this.updateClock()
        });

        game.settings.register(MODULE_ID, "weatherDisplayMode", {
            name: "Weather Display Mode",
            scope: "client",
            config: false,
            type: String,
            default: "global" // 'global' or 'window'
        });

        game.settings.register(MODULE_ID, "weatherPreviewState", {
            name: "Weather Preview State",
            scope: "client",
            config: false,
            type: Object,
            default: {
                open: false,
                x: null,
                y: null,
                width: 350,
                height: 350,
                paused: false
            }
        });

        game.settings.register(MODULE_ID, "dayOffset", {
            name: game.i18n.localize("PDNC.SettingDayOffsetName"),
            hint: game.i18n.localize("PDNC.SettingDayOffsetHint"),
            scope: "world",
            config: true,
            type: Number,
            default: 0,
            onChange: () => this.updateClock()
        }); // END: dayOffset registration

        // Register Calendar Settings
        game.settings.register(MODULE_ID, "calendarSystem", {
            name: game.i18n.localize("PDNC.SettingCalendarSystemName"),
            hint: game.i18n.localize("PDNC.SettingCalendarSystemHint"),
            scope: "world",
            config: true,
            type: String,
            choices: {
                "gregorian": "Gregorian (Standard)",
                "golarion": "Golarion (Pathfinder 2e)",
                "harptos": "Harptos (DnD 5e)",
                "simple": "Simple (30 Days)",
                "magaambya": "Magaambya (Mwangi/PF2e)"
            },
            default: "gregorian",
            onChange: () => {
                // 1. Re-initialize the Calendar System with new setting
                this.calendar = new CalendarSystem();

                // 2. Refresh Calendar App if open
                const calendarApp = foundry.applications.instances.get("phils-calendar-app");
                if (calendarApp) calendarApp.render({ force: true });

                // 3. Refresh Season Config if open (to show new month names)
                const seasonApp = foundry.applications.instances.get("phils-season-config");
                if (seasonApp) seasonApp.render({ force: true });

                // 4. Refresh Time Machine if open
                const timeApp = foundry.applications.instances.get("phils-time-machine");
                if (timeApp) timeApp.render({ force: true });
            }
        });

        game.settings.register(MODULE_ID, "calendarEvents", {
            name: "Calendar Events (Deprecated)",
            scope: "world",
            config: false,
            type: Object,
            default: {}
        });

        game.settings.register(MODULE_ID, "dbJournalId", {
            name: game.i18n.localize("PDNC.SettingDbJournalIdName"),
            scope: "world",
            config: false,
            type: String,
            default: ""
        });

        // Permissions
        game.settings.register(MODULE_ID, "playerCreateEvents", {
            name: game.i18n.localize("PDNC.SettingPlayerCreateName"),
            hint: game.i18n.localize("PDNC.SettingPlayerCreateHint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });

        game.settings.registerMenu(MODULE_ID, "timeMachine", {
            name: "Time Machine",
            label: game.i18n.localize("PDNC.OpenTimeMachine"),
            hint: "Jump to a specific date and set the world time.",
            icon: "fas fa-hourglass-start",
            type: TimeMachineApp,
            restricted: true
        });

        game.settings.register(MODULE_ID, "playerAdvanceTime", {
            name: game.i18n.localize("PDNC.SettingPlayerAdvanceName"),
            hint: game.i18n.localize("PDNC.SettingPlayerAdvanceHint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });

        // Weather Settings
        game.settings.register(MODULE_ID, "customClimates", {
            name: "Custom Climate Zones",
            scope: "world",
            config: false,
            type: Object,
            default: {}
        });

        game.settings.registerMenu(MODULE_ID, "customClimateMenu", {
            name: "Custom Climates",
            label: game.i18n.localize("PDNC.CustomClimate.OpenMenu"),
            hint: game.i18n.localize("PDNC.CustomClimate.Hint"),
            icon: "fas fa-cloud-sun-rain",
            type: CustomClimateApp,
            restricted: true
        });

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
                // If disabled, maybe reset scene?
                // For now, next update loop will handle it (or stop handling it).
            }
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

        game.settings.registerMenu(MODULE_ID, "seasonConfigMenu", {
            name: "Season Config",
            label: game.i18n.localize("PDNC.OpenSeasonConfig"),
            hint: game.i18n.localize("PDNC.SettingSeasonConfigHint"),
            icon: "fas fa-calendar-alt",
            type: SeasonConfigApp,
            restricted: true
        });



        game.settings.register(MODULE_ID, "lastWeatherGenerationTime", {
            name: "Last Weather Gen Time",
            scope: "world",
            config: false,
            type: Number,
            default: 0
        });
        
        game.settings.register(MODULE_ID, "lastWeatherDateId", {
            name: "Last Weather Date ID",
            scope: "world",
            config: false,
            type: String,
            default: ""
        });

        game.settings.register(MODULE_ID, "currentWeather", {
            name: "Current Weather Data",
            scope: "world",
            config: false,
            type: Object,
            default: {
                tempMin: 0,
                tempMax: 0,
                text: "",
                description: "", // Full weather text
                fx: null, // Weather FX type
                generated: false
            }
        });

        game.settings.register(MODULE_ID, "autoLighting", {
            name: game.i18n.localize("PDNC.SettingAutoLightingName"),
            hint: game.i18n.localize("PDNC.SettingAutoLightingHint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });

        Hooks.on("updateWorldTime", (worldTime, dt) => {
             this.updateClock();
             if (game.user.isGM) {
                 if (game.settings.get(MODULE_ID, "enableWeather")) {
                     // Check for new day using WeatherSystem logic
                     // If new day, we want to PROMPT the GM instead of auto-applying.
                     // But we should check if a prompt is already open? 
                     // Or if we just generated it?
                     
                     if (WeatherSystem.checkForNewDay()) {
                         // It's a new day!
                         
                         // Latch: Only prompt ONCE per specific day
                         const todayId = WeatherSystem.getTodayId();
                         if (this.lastPromptedDate !== todayId) {
                             this.lastPromptedDate = todayId;
 
                             // Generate draft weather
                             const draftWeather = WeatherSystem.generateWeather();
                             
                             // Open Config App
                             // Check if already open to avoid spam
                             if (!Object.values(ui.windows).some(w => w instanceof WeatherConfigApp)) {
                                 new WeatherConfigApp({ weather: draftWeather }).render({ force: true });
                             }
                         }
                     }
                     
                     LightingSystem.update(game.time.worldTime); 
                 }
             }
        });

        // Expose API for Macros
        window.PhilsDayNightCycle = {
            toggle: () => this.toggleSetting(),
            resetPosition: () => this.resetPosition(),
            setTime: (h, m) => this.setTime(h, m)
        };

        this.calendar = new CalendarSystem();
        // this.updateClock(); // Moved to ready/updateWorldTime

        // Auto-Open Weather HUD if it was open
        Hooks.once("ready", () => {
             const state = game.settings.get(MODULE_ID, "weatherPreviewState");
             if (state && state.open) {
                 new WeatherHUD().render(true);
             }
        });
    }

    refreshCalendar() {
        const app = foundry.applications.instances.get("phils-calendar-app");
        if (app) app.render();
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
        ui.notifications.info(`${MODULE_ID} | Clock synchronized to ${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`);
        this.updateClock();
    }

    toggleSetting() {
        const current = game.settings.get(MODULE_ID, "visible");
        game.settings.set(MODULE_ID, "visible", !current);
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

    createUI() {
        if (document.getElementById("phils-day-night-cycle-container")) return;

        const uiContainer = document.createElement("div");
        uiContainer.id = "phils-day-night-cycle-container";

        // Added Weather Icon and Temp to HTML structure
        uiContainer.innerHTML = `
      <div class="pdnc-disk">
        <div class="pdnc-hand"></div>
        <div class="pdnc-hand-minute"></div>
        <div class="pdnc-center-cap"></div>
        <div class="pdnc-labels-container"></div>
      </div>
      <div class="pdnc-time-display">

        <span class="pdnc-phase-icon"></span>
        <div class="pdnc-phase-text"></div>
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
        <div class="pdnc-controls" style="display: none;">
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
    `;

        document.body.appendChild(uiContainer);

        this.container = uiContainer;
        this.hand = uiContainer.querySelector(".pdnc-hand");
        this.minuteHand = uiContainer.querySelector(".pdnc-hand-minute");
        this.icon = uiContainer.querySelector(".pdnc-phase-icon");
        this.label = uiContainer.querySelector(".pdnc-phase-text");
        this.clockText = uiContainer.querySelector(".pdnc-clock-text");
        this.dateText = uiContainer.querySelector(".pdnc-date-text");
        this.controls = uiContainer.querySelector(".pdnc-controls");
        
        // Weather Elements
        // Weather Elements
        this.weatherIcon = uiContainer.querySelector(".pdnc-weather-icon");
        this.previewIcon = uiContainer.querySelector(".pdnc-preview-icon");
        this.tempText = uiContainer.querySelector(".pdnc-temp-text");
        this.sunGroup = uiContainer.querySelector(".pdnc-solar-sun-group");

        // Check Permissions for Controls
        if (game.user.isGM || game.settings.get(MODULE_ID, "playerAdvanceTime")) {
            this.controls.style.display = "flex";
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
        this.previewIcon.addEventListener("click", () => {
             new WeatherHUD().render(true);
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

        // Toggle Clock Visibility
        const toggleBtn = uiContainer.querySelector(".pdnc-toggle-btn");
        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const disk = uiContainer.querySelector(".pdnc-disk");
            disk.classList.toggle("hidden");
            // Toggle active state on button for styling
            toggleBtn.classList.toggle("active");
        });

        // Prevent click propagation to disk/drag
        this.controls.addEventListener("mousedown", (e) => e.stopPropagation());

        this.applyTheme();
        this.updateClock();
    }

    applyTheme() {
        if (!this.container) return;
        const bgImage = game.settings.get(MODULE_ID, "clockImage");
        const disk = this.container.querySelector(".pdnc-disk");
        if (disk) {
            disk.style.backgroundImage = `url('${bgImage}')`;
        }
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
        // Atan2: Right=0, Down=90, Left=180, Up=-90
        // We want: Up=0, Right=90, Down=180, Left=270
        // So we add 90 degrees.
        let clockDeg = angleDeg + 90;
        if (clockDeg < 0) clockDeg += 360;

        // Convert to minutes (0-1440)
        const minutesHover = (clockDeg / 360) * 1440;

        // Find Phase
        const phase = this.phases.find(p => minutesHover >= p.start && minutesHover <= p.end);

        if (phase) {
            this.tooltipPhase.textContent = game.i18n.localize(phase.label);

            // Format Time Range
            const startH = Math.floor(phase.start / 60).toString().padStart(2, '0');
            const startM = (phase.start % 60).toString().padStart(2, '0');
            const endH = Math.floor(phase.end / 60).toString().padStart(2, '0');
            const endM = (phase.end % 60).toString().padStart(2, '0');

            this.tooltipTime.textContent = `${startH}:${startM} – ${endH}:${endM} Uhr`;

            // Position Tooltip
            // Relative to the container or fixed? tooltip is inside uiContainer (fixed)
            // e.clientX/Y is viewport. uiContainer is fixed.
            // Let's position relative to the disk container
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

    dragElement(elmnt) {
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
        }
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

        // console.log("PDNC Debug | Day Offset:", offsetDays, "Time Offset:", offsetMinutes);
        // console.log("PDNC Debug | Original Time:", game.time.worldTime, "Adjusted Time:", worldTime);

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

        // Solar Arc Update
        if (this.sunGroup) {
            const svg = this.sunGroup.closest("svg");
            const track = svg.querySelector(".pdnc-solar-track");
            
            // Measure Container
            const rect = svg.getBoundingClientRect();
            const cw = rect.width;
            const ch = rect.height;
            
            // Find Reference Points
            const controls = this.container.querySelector(".pdnc-controls");
            const controlsY = controls ? controls.offsetTop : ch - 50;

            // Define Geometry (Dynamic)
            // Anchor slightly above the separator line (align with Weekday text)
            // ControlsY is the top of the buttons.
            const startY = controlsY - 20;
            const endY = controlsY - 20;
            
            // Padding from sides
            const paddingX = 15;
            
            // Peak Position (Top of card, or just above "Dawn/Morning" text)
            const peakY = 5; 

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

        // Determine Phase
        const phase = this.phases.find(p => minutesOfDay >= p.start && minutesOfDay <= p.end);

        if (phase) {
            this.icon.textContent = "";
            this.icon.style.display = "none";
            this.label.textContent = game.i18n.localize(phase.label);
        } else {
            // Fallback or edge case (e.g. exactly 24:00 handling if % logic is off, though typically 0-1439 coverage is fine)
            this.icon.textContent = "??";
            this.label.textContent = "Unknown Time";
        }

        // Update Digital Clock Text
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        this.clockText.textContent = timeString;

        // Update Date Text
        if (this.dateText && this.calendar) {
            const dateData = this.calendar.getDate(worldTime); // Use adjusted worldTime
            this.dateText.textContent = `${dateData.weekday}, ${dateData.day}. ${dateData.monthName} ${dateData.year}`;
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
            
            if (weather && weather.generated) {
                if (weatherGroup) weatherGroup.style.display = "flex";
                // Get dynamic temperature
                const currentTemp = WeatherSystem.getCurrentTemperature();
                this.tempText.textContent = `${currentTemp}°C`;
            } else {
                if (weatherGroup) weatherGroup.style.display = "none";
                this.tempText.textContent = "";
            }
        }
    }
}

const dayNightCycle = new PhilsDayNightCycle();
Hooks.once("init", () => dayNightCycle.init());

Hooks.once("ready", async () => {
    try {
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
        // Listen for changes to the DB Journal to auto-refresh the UI
        Hooks.on("updateJournalEntry", (doc, change, options, userId) => {
            const dbId = game.settings.get(MODULE_ID, "dbJournalId");
            if (doc.id === dbId) {
                dayNightCycle.refreshCalendar();
            }
        });

        await CalendarDB.ensureDB();

        // FORCE CLEANUP: WIPE LEGACY SETTINGS
        if (game.user.isGM) {
            const legacyData = game.settings.get(MODULE_ID, "calendarEvents");
            if (legacyData && Object.keys(legacyData).length > 0) {
                console.log(`${MODULE_ID} | Force-clearing legacy 'calendarEvents' setting to prevent zombie data.`);
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
            }
        ];

        if (game.user.isGM) {
            for (const data of macros) {
                const existing = game.macros.find(m => m.name === data.name);
                if (!existing) {
                    await Macro.create(data);
                    console.log(`${MODULE_ID} | Created macro: ${data.name}`);
                } else {
                    await existing.update(data);
                    console.log(`${MODULE_ID} | Updated macro: ${data.name}`);
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
                save: TimeMachineApp.prototype._onSave
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

        // Get current date
        const dateData = calendar.getDate(game.time.worldTime);
        // dateData has: year, month (index), day (1-based), etc.

        return {
            config: config,
            currentYear: dateData.year,
            currentMonth: dateData.month, // Index
            currentDay: dateData.day, // 1-based
            months: config.months.map((m, i) => ({
                value: i,
                label: m.name,
                selected: i === dateData.month
            }))
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
        console.log("PDNC | Time Machine Save Action Triggered");
        
        const form = this.element; // In V2, this.element is the form if tag: 'form'
        // Or if tag is div, we look for form. But manual ID access works fine here.

        const d = Number(form.querySelector('#pdnc-nav-day').value);
        const m = Number(form.querySelector('#pdnc-nav-month').value);
        const y = Number(form.querySelector('#pdnc-nav-year').value);

        const timestamp = dayNightCycle.calendar.getTimestamp(y, m, d);
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
}

class SeasonConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static get DEFAULT_OPTIONS() {
        return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            tag: "form",
            id: "phils-season-config",
            window: {
                title: "PDNC.SeasonConfigTitle",
                icon: "fas fa-calendar-alt",
                resizable: false
            },
            position: {
                width: 400,
                height: "auto"
            },
            actions: {
                save: SeasonConfigApp.prototype._onSave,
                reset: SeasonConfigApp.prototype._onReset
            }
        });
    }

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/season-config.html`
        }
    };

    get title() {
        return game.i18n.localize("PDNC.SeasonConfigTitle");
    }

    /** @override */
    async _prepareContext(options) {
        const calendar = dayNightCycle.calendar;
        const config = calendar.config.months; // Array of month objects
        const currentSettings = game.settings.get(MODULE_ID, "seasonConfig");

        // Prepare month options for {{selectOptions}} helper
        // We want {index: name}
        const monthOptions = config.reduce((acc, m, i) => {
            acc[i] = m.name;
            return acc;
        }, {});

        // Data for template
        return {
            monthOptions: monthOptions,
            spring: currentSettings.spring,
            summer: currentSettings.summer,
            autumn: currentSettings.autumn,
            winter: currentSettings.winter
        };
    }

    /**
     * Handle reset action
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    async _onReset(event, target) {
        event.preventDefault();
        event.stopPropagation();
        
        const defaults = game.settings.settings.get(MODULE_ID + ".seasonConfig").default;
        await game.settings.set(MODULE_ID, "seasonConfig", defaults);
        this.render();
    }

    /**
     * Handle save action
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    async _onSave(event, target) {
        event.preventDefault();
        event.stopPropagation();
        console.log("PDNC | Season Config Save Action Triggered");

        const form = this.element;
        
        // Helper to safely get value
        const getVal = (name) => {
            const el = form.querySelector(`[name="${name}"]`);
            return el ? el.value : null;
        };

        const newSettings = {
            spring: { month: Number(getVal("spring.month")), day: Number(getVal("spring.day")) },
            summer: { month: Number(getVal("summer.month")), day: Number(getVal("summer.day")) },
            autumn: { month: Number(getVal("autumn.month")), day: Number(getVal("autumn.day")) },
            winter: { month: Number(getVal("winter.month")), day: Number(getVal("winter.day")) }
        };
        
        console.log("PDNC | Saving Settings:", newSettings);

        await game.settings.set(MODULE_ID, "seasonConfig", newSettings);
        ui.notifications.info(game.i18n.localize("SETTINGS.Save"));
        this.close();
    }
}
