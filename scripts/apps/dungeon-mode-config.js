const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const MODULE_ID = "phils-day-night-cycle";

export class DungeonModeConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "pdnc-dungeon-mode",
        window: {
            title: "PDNC.DungeonMode.Title", // "Dungeon Mode Configuration",
            icon: "fas fa-dungeon",
            resizable: false
        },
        position: {
            width: 400,
            height: "auto"
        },
        classes: ["pdnc-app-v2", "pdnc-dungeon-config"], // Standard V2 styling class
        actions: {
            save: DungeonModeConfig.prototype._onSave
        }
    };

    static PARTS = {
        form: {
            template: `modules/${MODULE_ID}/templates/dungeon-mode.hbs`
        }
    };

    /** @override */
    async _prepareContext(options) {
        const scene = canvas.scene;
        if (!scene) return {};

        const lightingDisabled = scene.getFlag(MODULE_ID, "disableLighting") || false;
        const weatherDisabled = scene.getFlag(MODULE_ID, "disableWeather") || false;

        return {
            sceneName: scene.name,
            disableLighting: lightingDisabled,
            disableWeather: weatherDisabled
        };
    }

    /**
     * Handle Save Action
     */
    async _onSave(event, target) {
        const scene = canvas.scene;
        if (!scene) return;

        // Manually gather values since we aren't using a form submit workflow
        const html = this.element;
        const disableLighting = html.querySelector('input[name="disableLighting"]').checked;
        const disableWeather = html.querySelector('input[name="disableWeather"]').checked;

        // Save Flags
        await scene.setFlag(MODULE_ID, "disableLighting", disableLighting);
        await scene.setFlag(MODULE_ID, "disableWeather", disableWeather);

        const status = [];
        disableLighting ? status.push("Lighting Disabled") : status.push("Lighting Enabled");
        disableWeather ? status.push("Weather Disabled") : status.push("Weather Enabled");

        ui.notifications.info(`PDNC | Dungeon Mode Updated: ${status.join(", ")}`);

        // Immediate Actions
        if (disableWeather) {
            await scene.update({ weather: "" });
        } else {
            // Refresh Global Weather
            if (window.PhilsDayNightCycle) {
                const globalWeather = game.settings.get(MODULE_ID, "currentWeather");
                if (globalWeather && globalWeather.fx) {
                    await scene.update({ weather: globalWeather.fx });
                }
            }
        }
        
        // Lighting: If re-enabling, we trust the next update cycle (250ms debounce) or manual tick.
        if (!disableLighting) {
             // Optional: Force lighting update
             // We can check if LightingSystem is available externally or just wait
             // Since this is esmodule, we can import LightingSystem?
             // No, circular dependency risk if we aren't careful, but usually fine.
             // But simpler to just let the main loop handle it.
        }

        this.close();
    }
}
