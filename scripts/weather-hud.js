const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { WeatherSystem } from "./weather-system.js";
import { ParticleEngine } from "./particle-engine.js";
import { WeatherEffectsRegistry } from "./weather-effects.js";
import { WeatherFilterManager, HeatWaveFilter, OldFilmFilter, ChromaticAberrationFilter, UnderwaterFilter, RainbowFilter, HaloFilter, LightningFilter, GodRaysFilter, FogFilter, CloudCoverFilter, AuroraFilter, HolyLightFilter } from "./weather-filters.js";
import { ThemeSystem } from "./theme-system.js";

const MODULE_ID = "phils-day-night-cycle";

export class WeatherHUD extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);
        this.pixiApp = null;
        this.particleEngine = null;
        // Dedicated manager for preview with disabled suppression mask
        this.previewFilters = new class extends WeatherFilterManager {
            updateSuppressionMask() {
                // No-op: Disable suppression mask generation for preview to prevent context mismatch
            }
        }();
        this._weatherHook = null;
        this._saveTimeout = null;
        this._readyToSave = false;
    }

    static DEFAULT_OPTIONS = {
        id: "weather-hud",
        tag: "form",
        classes: ["pdnc-weather-window"],
        window: {
            resizable: true,
            title: "PDNC.WeatherPreview",
            icon: "fas fa-cloud-sun",
            width: 350,
            height: 350
        },
        position: {
            width: 350,
            height: 350
        }
    };

    static PARTS = {
        content: {
            template: `modules/${MODULE_ID}/templates/weather-hud.hbs`
        }
    };

    /**
     * Handle window resizing
     * ApplicationV2 doesn't have a rigid onResize but we can hook into the element's observer or specific overrides.
     * Actually, Foundry's ApplicationV2 automatically handles the window frame. We need to listen to size changes.
     * We'll use a ResizeObserver on the element.
     */
    async _onRender(context, options) {
        super._onRender(context, options);
        
        // Sync Icon State
        if (window.PhilsDayNightCycle && window.PhilsDayNightCycle.setPreviewIconState) {
            window.PhilsDayNightCycle.setPreviewIconState(true);
        }
        // PDNC HUD | _onRender called

        // Always ensure container fills the window frame to allow resizing
        const container = this.element.querySelector('#weather-preview-box');
        if (container) {
            container.style.width = "100%";
            container.style.height = "100%";
        }

        // Restore State (Position, Size, Paused)
        const state = game.settings.get(MODULE_ID, "weatherPreviewState");
        if (state) {
            // Restore Size
            if (state.width && state.height) {
                 // Also set window frame size if needed, but frameless handles mostly via content
                 this.setPosition({ width: state.width, height: state.height });
            }

            // Restore Position
            if (state.x !== null && state.y !== null) {
                 this.setPosition({ left: state.x, top: state.y });
            }
        }
        
        // Update Saved State: Open = true
        this._saveState({ open: true });

        // Initialize PIXI App for Preview if not exists
        if (!this.pixiApp) {
             this._initPreview();
        }

        // Bind Global Toggle Button
        const globalBtn = this.element.querySelector('.weather-global-btn');
        if (globalBtn) {
            // Set Initial State
            const currentMode = game.settings.get(MODULE_ID, "weatherDisplayMode");
            if (currentMode === "global") globalBtn.classList.add("active");

            globalBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                const isGlobal = globalBtn.classList.contains("active");
                const newMode = isGlobal ? "window" : "global"; // Toggle
                
                // Update UI immediately for responsiveness
                if (newMode === "global") globalBtn.classList.add("active");
                else globalBtn.classList.remove("active");

                // Log:("PDNC HUD | Mode switched to:", newMode);
                await game.settings.set(MODULE_ID, "weatherDisplayMode", newMode);
                
                // Trigger local refresh immediately
                const weather = game.settings.get(MODULE_ID, "currentWeather");
                if (weather && weather.fx) {
                    // Update global canvas visibility
                    WeatherEffectsRegistry.applyWeatherFilters(weather.fx);
                }
            });
            globalBtn.addEventListener('mousedown', (e) => e.stopPropagation());
        }

        // Bind Custom Close Button
        const closeBtn = this.element.querySelector('.weather-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
            closeBtn.addEventListener('mousedown', (e) => e.stopPropagation());
        }

        // Bind Pause Button
        const pauseBtn = this.element.querySelector('.weather-pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                // Toggle Global Pause Setting
                const isPaused = game.settings.get(MODULE_ID, "weatherPaused");
                await game.settings.set(MODULE_ID, "weatherPaused", !isPaused);

                const icon = pauseBtn.querySelector('i');
                if (!isPaused) {
                    // Was playing, now pausing
                    if (this.pixiApp && this.pixiApp.ticker && this.pixiApp.ticker.started) {
                         this.pixiApp.ticker.stop();
                    }
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                } else {
                    // Was paused, now playing
                    if (this.pixiApp && this.pixiApp.ticker && !this.pixiApp.ticker.started) {
                         this.pixiApp.ticker.start();
                    }
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                }
            });

            // Restore Pause State visually
            const isPaused = game.settings.get(MODULE_ID, "weatherPaused");
            if (isPaused) {
                 // Defer to ensure pixiApp is ready
                 setTimeout(() => {
                     // Check if still paused (race condition check)
                     if (game.settings.get(MODULE_ID, "weatherPaused")) {
                         if (this.pixiApp && this.pixiApp.ticker && this.pixiApp.ticker.started) {
                             this.pixiApp.ticker.stop();
                         }
                         const icon = pauseBtn.querySelector('i');
                         if(icon) {
                             icon.classList.remove('fa-pause');
                             icon.classList.add('fa-play');
                         }
                     }
                 }, 100);
            }
            pauseBtn.addEventListener('mousedown', (e) => e.stopPropagation());
        }

        // Enable Dragging on the Preview Box (since Header is hidden)
        const previewBox = this.element.querySelector('#weather-preview-box');
        if (previewBox) {
            // we need to hook into drag end to save position
            const dragHandle = new foundry.applications.ux.Draggable.implementation(this, this.element, previewBox, this.options.resizable);
            
        // MutationObserver to track Style Changes (Position & Size)
        this._lastW = this.element.offsetWidth;
        this._lastH = this.element.offsetHeight;

        this._mutationObserver = new MutationObserver((mutations) => {
            if (!this._readyToSave) return;

            const curW = this.element.offsetWidth;
            const curH = this.element.offsetHeight;

            // Aspect Ratio Enforcement (1:1)
            // Check if dimensions changed significantly and aren't square
            if (Math.abs(curW - curH) > 5) {
                let newSize = curW;
                
                // Determine which dimension changed (User Intent)
                if (Math.abs(curW - this._lastW) > 2) {
                    newSize = curW; // Width changed
                } else if (Math.abs(curH - this._lastH) > 2) {
                    newSize = curH; // Height changed
                } else {
                    newSize = Math.max(curW, curH); // Fallback
                }

                // Debounce Snap to prevent fighting resize handle
                if (this._snapTimeout) clearTimeout(this._snapTimeout);
                this._snapTimeout = setTimeout(() => {
                    // Update tracked dimensions to prevent loops
                    this._lastW = newSize;
                    this._lastH = newSize;
                    
                    this.setPosition({ 
                        width: newSize, 
                        height: newSize,
                        left: this.element.offsetLeft,
                        top: this.element.offsetTop
                    });
                }, 50); // Short delay for responsiveness
            } else {
                // Update tracked dimensions if square (or close enough)
                this._lastW = curW;
                this._lastH = curH;
            }

            // Save State (Debounced)
            if (this._saveTimeout) clearTimeout(this._saveTimeout);
            this._saveTimeout = setTimeout(() => {
                // Bugfix: Check if element still exists
                if (!this.element) return;
                
                this._saveState({
                    x: this.element.offsetLeft,
                    y: this.element.offsetTop,
                    width: this.element.offsetWidth,
                    height: this.element.offsetHeight
                });
            }, 500);
        });

        this._mutationObserver.observe(this.element, { attributes: true, attributeFilter: ["style"] });
        
        // Update Background
        this._updateBackground(); 
        }

        // Hook into Weather Updates to sync preview live
        if (this._weatherHook) Hooks.off("pdnc.weatherUpdated", this._weatherHook);
        this._weatherHook = Hooks.on("pdnc.weatherUpdated", (weatherData) => {
             // Log:("PDNC HUD | Live Weather Update Received", weatherData);
             this._renderEffects();
             this._updateBackground(); 
        });

        // Hook into Time Updates to sync background (Dawn/Day/Dusk/Night)
        if (this._timeHook) Hooks.off("updateWorldTime", this._timeHook);
        this._timeHook = Hooks.on("updateWorldTime", () => {
             this._updateBackground();
        });
    }

    async _initPreview() {
        const container = this.element.querySelector('#weather-preview-box');
        if (!container) return;

        // Cleanup old app if exists
        if (this.pixiApp) {
            this.pixiApp.destroy(true, { children: true, texture: false, baseTexture: false });
        }

        // Get initial dimensions (if rendered)
        const rect = container.getBoundingClientRect();
        const w = rect.width || 350;
        const h = rect.height || 350;

        // Create new PIXI App
        this.pixiApp = new PIXI.Application({
            width: w || 350,
            height: h || 350,
            backgroundAlpha: 0, 
            transparent: true, 
            sharedTicker: true
        });

        // Robustly apply CSS to Canvas
        const canvas = this.pixiApp.canvas || this.pixiApp.view;
        if (canvas) {
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.display = "block";
            container.appendChild(canvas);
        } else {
            container.appendChild(this.pixiApp.view);
        }

        this.pixiApp.stage.sortableChildren = true;

        // Preview Filter Ticker & Auto-Resize
        this.pixiApp.ticker.add((delta) => {
            if (this.previewFilters) this.previewFilters.animate(delta);
            
            // Auto-Resize Logic
            if (this.pixiApp && container) {
                const curW = container.clientWidth;
                const curH = container.clientHeight;
                
                if (curW > 0 && curH > 0) {
                     if (this.pixiApp.screen.width !== curW || this.pixiApp.screen.height !== curH) {
                          this.pixiApp.renderer.resize(curW, curH);
                          
                          // Update Particle Density
                          if (this.pixiApp.stage && this.pixiApp.stage.children) {
                              for (const child of this.pixiApp.stage.children) {
                                  if (child && typeof child.resize === 'function') {
                                      child.resize();
                                  }
                              }
                          }
                     }
                     // Sync Sprite
                     if (this._bgSprite) {
                         if (this._bgSprite.width !== curW || this._bgSprite.height !== curH) {
                             this._bgSprite.width = curW;
                             this._bgSprite.height = curH;
                         }
                     }
                }
                 // Sync Filter Area
                 if (this.pixiApp.stage.filters && this.pixiApp.stage.filters.length > 0) {
                      this.pixiApp.stage.filterArea = this.pixiApp.screen;
                 } else {
                      this.pixiApp.stage.filterArea = null;
                 }
            }
        });

        // Force initial resize check
        if (w > 0 && h > 0) {
             this.pixiApp.renderer.resize(w, h);
        }

        // Force Render after a short delay
        setTimeout(() => {
            // PDNC HUD | Forcing Initial Effect Render
            this._renderEffects();
            this._updateBackground();
        }, 100);

        // Enable Saving after init
        setTimeout(() => {
            this._readyToSave = true;
        }, 500);
    }

    async _updateBackground() {
        if (!this.pixiApp) return;
        
        let time = game.time.worldTime;
        // Apply Offsets (same logic as WeatherSystem)
        const offsetMinutes = game.settings.get(MODULE_ID, "timeOffset") || 0;
        const offsetDays = game.settings.get(MODULE_ID, "dayOffset") || 0;
        time += (offsetMinutes * 60);
        time += (offsetDays * 86400);

        // const dayLength = 86400; 
        // const secondsOfDay = time % dayLength;
        // const hours = secondsOfDay / 3600;

        // Use ThemeSystem for unified logic
        const bgUrl = ThemeSystem.getBackgroundImage();

        // OPTIMIZATION: Check if changed
        if (this._currentBgUrl === bgUrl) {
            return; 
        }
        this._currentBgUrl = bgUrl;

        // Log:("PDNC HUD | Set Background to:", bgUrl);
        
        // Remove old background sprite if exists
        if (this._bgSprite) {
             if (this._bgSprite.parent) {
                this.pixiApp.stage.removeChild(this._bgSprite);
             }
             if (!this._bgSprite.destroyed) {
                this._bgSprite.destroy();
             }
             this._bgSprite = null;
        }

        // Create new Sprite
        const loadTex = foundry.canvas?.loadTexture || loadTexture; // Fallback for v11
        const texture = await loadTex(bgUrl); 
        const sprite = new PIXI.Sprite(texture);
        
        // Match current renderer size
        sprite.width = this.pixiApp.screen.width;
        sprite.height = this.pixiApp.screen.height;
        sprite.zIndex = 0; // Reset to default, rely on insertion order (bottom)
        
        this.pixiApp.stage.addChildAt(sprite, 0); 
        this._bgSprite = sprite;

        // Force Render if Paused
        if (this.pixiApp.ticker && !this.pixiApp.ticker.started) {
            this.pixiApp.renderer.render(this.pixiApp.stage);
        }
    }

    async _renderEffects() {
        if (!this.pixiApp) return;

        // Clear stage
        this.pixiApp.stage.removeChildren();
        this.previewFilters.clearFilters();
        this.pixiApp.stage.filters = []; 
        
        // Reset BG URL to force re-add if we cleared children
        this._currentBgUrl = null; 
        this._updateBackground();

        // Get Current Weather Data
        const weather = game.settings.get(MODULE_ID, "currentWeather");
        // Log:("PDNC HUD | Retrieved Weather Settings:", weather);
        
        const fxId = weather?.fx;

        if (!fxId) {
             // Log:("PDNC HUD | No FX ID found.");
             return;
        }

        // Use CONFIG directly 
        const effectConfig = CONFIG.Weather?.effects?.[fxId];

        if (!effectConfig) {
             console.warn("PDNC HUD | No config found for FX:", fxId);
             return;
        }

        // Log:("PDNC HUD | Rendering Effect:", fxId);

        // 1. Particles
        if (effectConfig.effects) {
            for (const effect of effectConfig.effects) {
                // Determine if this is a particle effect
                let config = effect;
                let isParticle = false;

                // Case A: Wrapped (Legacy/Raw)
                if (effect.type === "particles" && effect.config) {
                    config = effect.config;
                    isParticle = true;
                } 
                // Case B: Flattened (Registry Output)
                else {
                    const particleTypes = ["ember", "leaf", "insect", "rune", "petal", "star", "glow", "cloud", "rain", "snow", "custom_rain", "custom_snow", "firefly", "bird"];
                    if (particleTypes.includes(effect.type) || (effect.type === "cloud" && effect.direction === 270)) {
                        isParticle = true;
                    }
                }

                if (isParticle) {
                    // Instantiate Particle Engine attached to this App's stage
                    // Log:("PDNC HUD | Spawning Particles:", config.type);
                    
                    // Do NOT inject fixed dimensions. 
                    // Let ParticleEngine.getBounds() find the renderer size dynamically.
                    const hudConfig = {
                        ...config
                    };

                    // Fix: Pass 'this.pixiApp' (Application) not 'stage' (Container) so Engine can find .renderer
                    const engine = new ParticleEngine(hudConfig, this.pixiApp, this.pixiApp.ticker);
                    engine.zIndex = 1000;
                    this.pixiApp.stage.addChild(engine);
                }
            }
        }

        // 2. Filters
        if (effectConfig.filters) {
            for (const f of effectConfig.filters) {
                let filterInstance = null;
                
                // Factory for filter types (Duplicated from Registry for now)
                if (f.type === "heat") {
                    filterInstance = new HeatWaveFilter(f.intensity ?? 1.0, f.speed ?? 1.0);
                } else if (f.type === "old_film") {
                    filterInstance = OldFilmFilter ? new OldFilmFilter(f.sepia ?? 0.3, f.noise ?? 0.3, f.scratch ?? 0.3) : null;
                    if (filterInstance) filterInstance.uniforms.speed = f.speed ?? 12.0;
                } else if (f.type === "holy_light") {
                    filterInstance = HolyLightFilter ? new HolyLightFilter(f.intensity ?? 1.0, f.speed ?? 1.0) : null;
                } else if (f.type === "chromatic") {
                    filterInstance = new ChromaticAberrationFilter(f.amount ?? 5.0);
                } else if (f.type === "underwater") {
                    filterInstance = new UnderwaterFilter(f.speed ?? 1.0, f.intensity ?? 1.0);
                } else if (f.type === "rainbow") {
                    filterInstance = new RainbowFilter(f.intensity ?? 0.5);
                } else if (f.type === "halo") {
                    filterInstance = new HaloFilter(f.intensity ?? 0.5);
                } else if (f.type === "lightning") {
                    filterInstance = new LightningFilter(f.intensity ?? 0.8);
                } else if (f.type === "godrays") {
                    filterInstance = new GodRaysFilter(f.alpha ?? 0.5, f.angle ?? 0.3);
                } else if (f.type === "fog") {
                    filterInstance = new FogFilter(f.speed ?? 1.0, f.density ?? 0.5, f.color, f.gradient);
                } else if (f.type === "cloud_cover") {
                    filterInstance = new CloudCoverFilter(f.speed ?? 0.5, f.scale ?? 1.0, f.alpha ?? 0.5, f.color);
                } else if (f.type === "aurora") {
                    filterInstance = new AuroraFilter(f.speed ?? 0.5, f.intensity ?? 1.5);
                }
                
                if (filterInstance) {
                    this.previewFilters.addFilter(f.type, filterInstance, this.pixiApp.stage);
                }
            }
        }
    }

    async close(options) {
        // Sync Icon State
        if (window.PhilsDayNightCycle && window.PhilsDayNightCycle.setPreviewIconState) {
            window.PhilsDayNightCycle.setPreviewIconState(false);
        }

        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        if (this._weatherHook) {
            Hooks.off("pdnc.weatherUpdated", this._weatherHook);
            this._weatherHook = null;
        }
        if (this._timeHook) {
             Hooks.off("updateWorldTime", this._timeHook);
             this._timeHook = null;
        }

        if (this.pixiApp) {
            this.pixiApp.destroy(true, { children: true, texture: false, baseTexture: false });
            this.pixiApp = null;
        }
        this._saveState({ open: false });
        return super.close(options);
    }
    
    async _saveState(changes = {}) {
        /*
          changes: { open, x, y, width, height, paused }
          Merges with existing state and saves to client setting.
        */
       
        // Block geometry saves during initialization
        if (!this._readyToSave) {
            // If dragging/resizing during init, ignore.
            // But allow 'open' or 'paused' updates if they happen explicitly.
            if (changes.x !== undefined || changes.y !== undefined || 
                changes.width !== undefined || changes.height !== undefined) {
                return;
            }
        }

        const currentState = game.settings.get(MODULE_ID, "weatherPreviewState") || {};
        const newState = { ...currentState, ...changes };
        
        await game.settings.set(MODULE_ID, "weatherPreviewState", newState);
    }
}
