import { PhilsCalendarApp } from "./calendar-app.js";
import { CalendarSystem } from "./calendar-system.js";
import { CalendarDB } from "./calendar-db.js";

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
    }

    init() {
        console.log(`${MODULE_ID} | Initializing...`);

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
                // Determine if open? V2 manages instances differently, usually ID based.
                // We can just try to re-render if it exists in the registry, OR just let user re-open.
                const app = foundry.applications.instances.get("phils-calendar-app");
                if (app) app.render({ force: true });
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

        Hooks.on("updateWorldTime", () => this.updateClock());

        // Expose API for Macros
        window.PhilsDayNightCycle = {
            toggle: () => this.toggleSetting(),
            resetPosition: () => this.resetPosition(),
            setTime: (h, m) => this.setTime(h, m)
        };

        this.calendar = new CalendarSystem();
        // this.updateClock(); // Moved to ready/updateWorldTime
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
        <div class="pdnc-clock-line" style="display: flex; justify-content: center; align-items: center;">
            <i class="fas fa-clock pdnc-toggle-btn" title="${game.i18n.localize("PDNC.ToggleClock")}" style="margin-right: 5px; margin-left: 0;"></i>
            <div class="pdnc-clock-text"></div>
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

        console.log("PDNC Debug | Day Offset:", offsetDays, "Time Offset:", offsetMinutes);
        console.log("PDNC Debug | Original Time:", game.time.worldTime, "Adjusted Time:", worldTime);

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

class TimeMachineApp extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "phils-time-machine",
            title: "Time Machine",
            template: `modules/${MODULE_ID}/templates/time-machine.html`,
            classes: ["pdnc-event-editor-window", "pdnc-nav-window"],
            width: 400,
            height: "auto",
            resizable: false
        });
    }

    getData() {
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

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name="submit"]').click(async (e) => {
            e.preventDefault();
            const d = Number(html.find('#pdnc-nav-day').val());
            const m = Number(html.find('#pdnc-nav-month').val());
            const y = Number(html.find('#pdnc-nav-year').val());

            const timestamp = dayNightCycle.calendar.getTimestamp(y, m, d);
            await game.settings.set("core", "time", timestamp);

            this.close();

            // Refresh Calendar if open
            const app = foundry.applications.instances.get("phils-calendar-app");
            if (app) {
                app.viewYear = y;
                app.viewMonth = m;
                app.render();
            }
        });
    }

    async _updateObject(event, formData) {
        // Handled in button click to avoid standard form submit
    }
}
