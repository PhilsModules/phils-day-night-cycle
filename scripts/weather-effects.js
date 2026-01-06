import { HeatWaveFilter, OldFilmFilter, ChromaticAberrationFilter, UnderwaterFilter, RainbowFilter, HaloFilter, LightningFilter, GodRaysFilter, FogFilter, CloudCoverFilter, AuroraFilter, HolyLightFilter } from "./weather-filters.js";
import { ParticleEngine } from "./particle-engine.js";

console.log("PDNC | weather-effects.js loading...");

/**
 * Extensible Weather Effects Registry for Phil's Day/Night Cycle
 * Allows easy registration of new particle-based weather effects.
 */
export class WeatherEffectsRegistry {
    static init() {
        console.log("PDNC | Initializing Weather Effects Registry...");
        
        // Cleanup Default/Legacy Styles if they exist
        if (CONFIG.Weather && CONFIG.Weather.effects) {
            delete CONFIG.Weather.effects.fog;
            delete CONFIG.Weather.effects.soot;
        }

        this.registerCoreEffects();
        this.registerHooks();
    }

    static registerHooks() {
        // Apply filters when scene weather updates
        Hooks.on("updateScene", (scene, data, options, userId) => {
            if (data.weather !== undefined) {
                console.log(`PDNC | updateScene detected weather change to: ${data.weather}`);
                this.applyWeatherFilters(data.weather);
            }
        });

        // Re-apply on canvas ready (scene load)
        Hooks.on("canvasReady", (canvas) => {
            const weather = canvas.scene.weather;
            console.log(`PDNC | canvasReady, applying weather: ${weather}`);
            this.applyWeatherFilters(weather);
        });

        // FORCE CLEANUP on Ready (Nuclear Option for stubborn defaults)
        Hooks.once("ready", () => {
            if (CONFIG.Weather && CONFIG.Weather.effects) {
                console.log("PDNC | Performing final cleanup of unwanted effects...");
                
                const effectsToDelete = [];
                for (const [key, effect] of Object.entries(CONFIG.Weather.effects)) {
                    const lowerKey = key.toLowerCase();
                    const label = effect.label || "";
                    
                    // Check for exact matches on key or Label
                    if (lowerKey === "fog" || lowerKey === "soot" || label === "Fog" || label === "Soot") {
                        effectsToDelete.push(key);
                    }
                }

                effectsToDelete.forEach(key => {
                    console.log(`PDNC | Removing unwanted effect: ${key}`);
                    delete CONFIG.Weather.effects[key];
                });
            }
        });
    }

    static applyWeatherFilters(weatherKey) {
        console.log(`PDNC | applyWeatherFilters called for: ${weatherKey}`);
        
        if (!game.weatherFilters) {
            console.warn("PDNC | game.weatherFilters is MISSING! Shaders will not work.");
        } else {
             // 1. Clear Shaders
            game.weatherFilters.clearFilters();
        }

        // 2. Clear Custom Particles
        // 2. Clear Custom Particles
        if (game.customParticleEngines) {
            game.customParticleEngines.forEach(engine => engine.destroy({children: true}));
            game.customParticleEngines = [];
        }
        // Legacy Cleanup (in case a single instance persists from before)
        if (game.customParticleEngine) {
            game.customParticleEngine.destroy();
            game.customParticleEngine = null;
        }

        // If no weather key (e.g. "none" or null), just return after clearing
        if (!weatherKey || weatherKey === "none") {
            console.log("PDNC | Weather cleared.");
            if (canvas.weather) canvas.weather.visible = true; // Reset visibility just in case
            return;
        }

        // Check Display Mode (Client Setting)
        let displayMode = "global";
        try {
            // Safely attempt to get setting. If not registered, default to "global"
            if (game.settings.settings.has("phils-day-night-cycle.weatherDisplayMode")) {
                displayMode = game.settings.get("phils-day-night-cycle", "weatherDisplayMode");
            }
        } catch (e) {
            console.warn("PDNC | weatherDisplayMode setting access failed:", e);
        }

        if (displayMode === "window") {
            console.log("PDNC | Weather Display Mode is 'window'. Suppressing global effects.");
            if (canvas.weather) canvas.weather.visible = false;
            return; 
        } else {
            // Restore visibility if "global"
            if (canvas.weather) canvas.weather.visible = true;
        }

        const effectConfig = CONFIG.Weather.effects[weatherKey];
        if (!effectConfig) {
            console.warn(`PDNC | No config found for weather: ${weatherKey}`);
            return;
        }

        // Apply Shaders
        if (effectConfig.filters) {
            effectConfig.filters.forEach(f => {
                let filterInstance = null;
                
                // Factory for filter types
                if (f.type === "heat") {
                    filterInstance = new HeatWaveFilter(f.intensity ?? 1.0, f.speed ?? 1.0);
                } else if (f.type === "old_film") {
                    filterInstance = OldFilmFilter ? new OldFilmFilter(f.sepia ?? 0.3, f.noise ?? 0.3, f.scratch ?? 0.3) : null;
                    if (filterInstance) filterInstance.uniforms.speed = f.speed ?? 12.0;
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
                    filterInstance = new FogFilter(f.speed ?? 1.0, f.density ?? 0.5, f.color, f.gradient, f.gradientStart);
                } else if (f.type === "cloud_cover") {
                    filterInstance = new CloudCoverFilter(f.speed ?? 0.5, f.scale ?? 1.0, f.alpha ?? 0.5, f.color);
                } else if (f.type === "aurora") {
                    filterInstance = new AuroraFilter(f.speed ?? 0.5, f.intensity ?? 1.5);
                } else if (f.type === "holy_light") {
                    filterInstance = new HolyLightFilter(f.intensity ?? 1.0, f.speed ?? 1.0);
                }
                
                if (filterInstance) {
                    game.weatherFilters.addFilter(`weather-${weatherKey}-${f.type}`, filterInstance);
                }
            });
        }

        // Apply Custom Particles
        if (effectConfig.effects) {
            if (!game.customParticleEngines) game.customParticleEngines = [];
            
            effectConfig.effects.forEach(eff => {
                // The 'eff' object here is the FLATTENED config produced by registerEffect.
                // It has properties like { type: "cloud", density: 0.3, ... }
                
                // List of types our Custom Engine supports
                const customEngineTypes = ["ember", "leaf", "insect", "rune", "petal", "star", "glow", "cloud", "rain", "snow", "custom_rain", "custom_snow", "firefly", "droplets", "bird"];
                
                if (customEngineTypes.includes(eff.type) || (eff.type === "cloud" && eff.direction === 270)) {
                    console.log(`PDNC | Spawning Custom Particle Engine for: ${eff.type}`);
                    
                    // The 'eff' object IS the config now
                    if (eff.config && eff.config.type === "custom_snow") {
                        console.log("PDNC | Weather Effect Config:", eff);
                    }
                    const engine = new ParticleEngine(eff);
                    game.customParticleEngines.push(engine);
                    
                    console.log("PDNC | DEBUG: Adding Engine to canvas.stage (Root)");
                    canvas.stage.addChild(engine);
                    engine.zIndex = 1000;
                }
            });
        }
    }

    /**
     * Registers a new weather effect with Foundry's configuration.
     * @param {string} key - The unique key for the effect (e.g., "drizzle")
     * @param {Object} config - The effect configuration object
     */
    static registerEffect(key, config) {
        if (!CONFIG.Weather) CONFIG.Weather = {};
        if (!CONFIG.Weather.effects) CONFIG.Weather.effects = {};

        // Adapter: Unwrap 'particles' wrapper and map custom types to Core types
        if (config.effects) {
            config.effects = config.effects.map(eff => {
                if (eff.type === "particles" && eff.config) {
                    const cfg = { 
                        density: eff.config.density,
                        speed: eff.config.speed,
                        scale: eff.config.scale,
                        direction: eff.config.direction,
                        alpha: eff.config.alpha,
                        time: eff.config.time, 
                        type: eff.config.type, // Start with original type
                        tint: eff.config.tint, // Pass tint directly
                        lifespan: eff.config.lifespan,
                        noRotation: eff.config.noRotation,
                        shimmer: eff.config.shimmer,
                        fadeStyle: eff.config.fadeStyle,
                        spawnRect: eff.config.spawnRect,
                        lifetime: eff.config.lifetime,
                        blendMode: eff.config.blendMode
                    };

                    // Map Invalid Types to Core Types (rain, snow)
                    // Core only supports 'rain' and 'snow` reliably.
                    // BUT: We now verify if our Custom Engine supports it.

                    // GLOBAL OVERRIDE: Force all 'rain' and 'snow' to use Custom Engine
                    // This ensures complex effects like 'heavy_rain' (type: rain) or 'blizzard' (type: snow) 
                    // are also caught and rendered via ParticleEngine, bypassing Foundry defaults.
                    if (cfg.type === "rain") cfg.type = "custom_rain";
                    if (cfg.type === "snow") cfg.type = "custom_snow";
                    if (cfg.type === "clouds") cfg.type = "cloud"; // Force singular

                    const customEngineTypes = ["ember", "leaf", "insect", "rune", "petal", "star", "glow", "cloud", "rain", "snow", "custom_rain", "custom_snow", "firefly", "droplets", "bird"];
                    
                    if (customEngineTypes.includes(cfg.type) || (cfg.type === "cloud" && cfg.direction === 270)) {
                        console.log(`PDNC | Preserving Custom Type: ${cfg.type}`);
                        // Pass through! Do not adapt type.
                    } else {
                        // Fallback logic for Core
                        switch (cfg.type) {
                            case "fog":
                            case "breath":
                            case "smoke":
                            case "dust_devils":
                            case "clouds":
                                // If it is "Rising Steam" (clouds + dir 270), we want to pass it through to our engine?
                                // Actually, Core clouds are okayish, but we have no texture for them yet? 
                                // Let's map these to 'clouds' (Core) or 'snow' (Core fallback).
                                // Core handles 'clouds' by drawing circles usually or using an image if provided.
                                cfg.type = "cloud"; 
                                break;
                            case "rain":
                            case "snow":
                                // Valid Core types
                                break;
                            default:
                                cfg.type = "snow"; // Fallback
                                break;
                        }
                    }
                    console.log(`PDNC | Adapted ${eff.config.type} -> ${cfg.type}`, cfg);
                    return cfg;
                }
                return eff;
            });
        }

        CONFIG.Weather.effects[key] = config;
        console.log(`PDNC | Registered weather effect: ${key}`);
    }

    /**
     * Registers the initial set of custom effects.
     */
    static registerCoreEffects() {
        
        // --- 1. RAIN & WATER (01-11) ---

        this.registerEffect("rain", {
            id: "rain",
            label: "01. Rain",
             effects: [
                { type: "particles", config: { type: "custom_rain", density: 0.5, speed: 1.5, scale: 1.0, tint: [1.0, 1.0, 1.0], blendMode: "add" } }
            ]
        });

        this.registerEffect("drizzle", {
            id: "drizzle",
            label: "02. Drizzle",
            effects: [
                { type: "particles", config: { type: "custom_rain", density: 0.15, speed: 2.5, scale: 0.7, tint: [0.9, 0.9, 1.0], direction: 80, blendMode: "add" } }
            ],
            filters: [
                { type: "fog", speed: 0.5, density: 0.15 }
            ]
        });

        this.registerEffect("heavy_rain", {
            id: "heavy_rain",
            label: "03. Heavy Rain",
            filters: [{ type: "color", value: [0.4, 0.45, 0.5], alpha: 0.5 }], // Darker
            effects: [
                {
                    type: "particles",
                    config: { type: "rain", style: "simple", density: 0.6, direction: 90, speed: 3.0, scale: 1.2, tint: [1.0, 1.0, 1.0], blendMode: "add" }
                }
            ]
        });
        
        this.registerEffect("storm", {
            id: "storm",
            label: "04. Storm",
            filters: [{ type: "color", value: [0.4, 0.4, 0.6], alpha: 0.6 }],
            effects: [
                { type: "particles", config: { type: "rain", density: 1.0, speed: 3.5, direction: 45, scale: 1.0, tint: [1.0, 1.0, 1.0], blendMode: "add" } }
            ]
        });

        this.registerEffect("torrent", {
            id: "torrent",
            label: "05. Torrent",
            effects: [
                { type: "particles", config: { type: "rain", density: 1.5, speed: 3.8, scale: 1.1, direction: 55, tint: [1.0, 1.0, 1.0], blendMode: "add" } }
            ]
        });

        this.registerEffect("droplets", {
            id: "droplets",
            label: "06. Droplets",
            effects: [
                { type: "particles", config: { type: "droplets", density: 0.5, speed: 0.0, scale: 0.5, tint: [1.0, 1.0, 1.0], lifespan: true, lifetime: 90, noRotation: true, blendMode: "add" } },
                { type: "particles", config: { type: "rain", density: 0.2, speed: 2.5, scale: 0.8, tint: [0.9, 0.9, 1.0], blendMode: "add" } }
            ]
        });

        this.registerEffect("ripples", {
            id: "ripples",
            label: "07. Ripples",
            effects: [
                 { type: "particles", config: { type: "droplets", density: 5.0, speed: 0.0, scale: 0.3, tint: [1.0, 1.0, 1.0], lifespan: true, lifetime: 90, noRotation: true, blendMode: "add" } }
            ]
        });

        this.registerEffect("sleet", {
            id: "sleet",
            label: "08. Sleet",
            effects: [
                { type: "particles", config: { type: "rain", density: 0.5, speed: 2.0, scale: 0.8, tint: [1.0, 1.0, 1.0] } },
                { type: "particles", config: { type: "snow", density: 0.4, speed: 1.0, scale: 0.8, tint: [0.9, 0.9, 1.0] } }
            ]
        });

        this.registerEffect("spray", {
            id: "spray",
            label: "09. Spray",
            filters: [{ type: "fog", density: 0.4, speed: 0.8, color: [0.85, 0.9, 1.0] }],
            effects: [
                { type: "particles", config: { type: "snow", density: 0.8, speed: 3.5, scale: 0.5, tint: [0.8, 0.9, 1.0], direction: 90 } }
            ]
        });

        this.registerEffect("virga", {
            id: "virga",
            label: "10. Virga",
            effects: [
                 { type: "particles", config: { type: "rain", density: 0.5, speed: 3.0, scale: 1.0, tint: [0.6, 0.7, 0.8], alpha: 0.2 } } // Very faint
            ]
        });

        this.registerEffect("lightning_flash", {
            id: "lightning_flash",
            label: "11. Lightning Flash",
            filters: [
                { type: "lightning", intensity: 0.3 } // Flashing filter
            ],
            effects: [
                { type: "particles", config: { type: "rain", density: 1.0, speed: 4.0, scale: 1.0, tint: [0.5, 0.5, 0.6] } } // Heavy rain accompanies lightning usually
            ]
        });

        // --- 2. SNOW & ICE (12-18) ---

        this.registerEffect("snow", {
            id: "snow",
            label: "12. Snow",
             effects: [
                { type: "particles", config: { type: "custom_snow", density: 0.5, speed: 0.5, scale: 0.5, tint: [1.0, 0.9, 1.0] } }
            ]
        });

        this.registerEffect("light_snow", {
            id: "light_snow",
            label: "13. Light Snow",
            filters: [{ type: "color", value: [0.9, 0.95, 1.0], alpha: 0.2 }],
            effects: [
                { type: "particles", config: { type: "custom_snow", style: "simple", density: 0.1, direction: 90, speed: 0.4, scale: 0.7, tint: [0.95, 0.95, 1.0] } }
            ]
        });

        this.registerEffect("blizzard", {
            id: "blizzard",
            label: "14. Blizzard",
            filters: [{ type: "fog", density: 0.5, speed: 2.5, color: [0.9, 0.95, 1.0] }], // Reduced density
            effects: [
                { type: "particles", config: { type: "custom_snow", style: "stormy", density: 1.2, direction: 45, speed: 3.0, scale: 1.0, tint: [0.9, 0.9, 1.0] } }
            ]
        });

        this.registerEffect("hail", {
            id: "hail",
            label: "15. Hail",
            filters: [{ type: "color", value: [0.7, 0.7, 0.75], alpha: 0.4 }],
            effects: [
                { type: "particles", config: { type: "custom_snow", style: "simple", density: 6.0, direction: 75, speed: 12.0, scale: 0.4, tint: [1.0, 1.0, 1.0] } }
            ]
        });
        
        this.registerEffect("diamond_dust", {
            id: "diamond_dust",
            label: "16. Diamond Dust",
            effects: [
                { type: "particles", config: { type: "custom_snow", density: 2.0, speed: 0.0, scale: 0.3, tint: [0.9, 1.0, 1.0], lifespan: true, shimmer: true, blendMode: "add" } }
            ]
        });

        this.registerEffect("drifting_snow", {
            id: "drifting_snow",
            label: "17. Drifting Snow",
            filters: [{ type: "fog", density: 0.6, speed: 0.5, color: [0.9, 0.95, 1.0], gradient: true, gradientStart: 0.85 }],
            effects: [
                { type: "particles", config: { type: "custom_snow", density: 0.8, speed: 6.0, direction: 180, scale: 0.4, tint: [0.95, 0.95, 1.0], lifespan: true, lifetime: 300, spawnRect: {x:0, y:0.9, w:1, h:0.1} } }
            ]
        });

        this.registerEffect("whiteout", {
            id: "whiteout",
            label: "18. Whiteout",
            filters: [{ type: "fog", density: 0.9, speed: 0.1, color: [1.0, 1.0, 1.0] }], // Reduced to 0.9
            effects: [
                { type: "particles", config: { type: "custom_snow", density: 5.0, speed: 4.0, direction: 45, scale: 0.25, tint: [1.0, 1.0, 1.0] } } // Dense snow
            ]
        });

        // --- 3. ATMOSPHERE & FOG (19-26) ---

        this.registerEffect("clouds", {
            id: "clouds",
            label: "19. Clouds",
            filters: [{ type: "cloud_cover", speed: 0.2, scale: 1.0, alpha: 0.45, color: [1.0, 1.0, 1.0] }], // Alpha 0.45
            effects: []
        });

        this.registerEffect("morning_mist", {
            id: "morning_mist",
            label: "20. Morning Mist",
            filters: [{ type: "fog", density: 0.3, speed: 0.2, color: [0.9, 0.9, 1.0] }],
            effects: []
        });

        this.registerEffect("thick_fog", {
            id: "thick_fog",
            label: "21. Thick Fog",
            filters: [{ type: "fog", density: 0.6, speed: 0.3, color: [0.8, 0.8, 0.85] }], // Reduced to 0.6
            effects: []
        });
        
        this.registerEffect("smoke", {
            id: "smoke",
            label: "22. Smoke",
            filters: [{ type: "fog", density: 0.6, speed: 0.2, color: [0.2, 0.2, 0.2] }], // Dark Smoke
            effects: []
        });

        this.registerEffect("rising_steam", {
            id: "rising_steam",
            label: "23. Rising Steam",
            filters: [{ type: "fog", density: 0.5, speed: 3.0, color: [0.9, 0.95, 1.0], gradient: true }], // Fast moving steam with Fade
            effects: []
        });

        this.registerEffect("ghost_mist", {
            id: "ghost_mist",
            label: "24. Ghost Mist",
            filters: [
                { type: "heat", intensity: 0.5, speed: 0.5 }, // Wobbly
                { type: "fog", density: 0.4, speed: 0.2, color: [0.8, 1.0, 0.9] } // Pale Green/Cyan Fog
            ], 
            effects: []
        });

        // --- 4. NATURE & DUST (27-38) ---

        this.registerEffect("autumn_leaves", {
            id: "autumn_leaves",
            label: "25. Autumn Leaves",
            effects: [
                { type: "particles", config: { type: "leaf", density: 0.1, speed: 1.5, scale: 0.8, tint: [0.8, 0.4, 0.1] } } // Orange leaves
            ]
        });

        this.registerEffect("cherry_blossom", {
            id: "cherry_blossom",
            label: "26. Cherry Blossom",
            effects: [
                { type: "particles", config: { type: "petal", density: 0.15, speed: 1.0, scale: 0.6, tint: [1.0, 0.7, 0.8] } } // Pink petals
            ]
        });

        this.registerEffect("insects", {
            id: "insects",
            label: "27. Insects",
            effects: [
                 { type: "particles", config: { type: "insect", density: 0.3, speed: 3.0, scale: 0.2, tint: [1.0, 1.0, 1.0] } }
            ]
        });

        this.registerEffect("pollen", {
            id: "pollen",
            label: "28. Pollen",
            effects: [
                { type: "particles", config: { type: "glow", density: 0.2, speed: 0.1, scale: 0.3, tint: [1.0, 1.0, 0.6] } } // Yellow floaters
            ]
        });

        this.registerEffect("sandstorm", {
            id: "sandstorm",
            label: "29. Sandstorm",
            filters: [{ type: "fog", density: 0.8, speed: 8.0, color: [0.8, 0.6, 0.3] }], // Fast heavy yellow fog
            effects: [
                { type: "particles", config: { type: "snow", density: 4.0, speed: 25.0, direction: 0, scale: 0.4, tint: [0.8, 0.6, 0.3] } } // Very Fast L->R yellow sand
            ]
        });

        this.registerEffect("red_sandstorm", {
            id: "red_sandstorm",
            label: "30. Red Sandstorm",
            filters: [{ type: "fog", density: 0.8, speed: 8.0, color: [0.8, 0.3, 0.1] }], // Fast heavy red fog
            effects: [
                { type: "particles", config: { type: "snow", density: 4.0, speed: 25.0, direction: 0, scale: 0.4, tint: [0.8, 0.3, 0.1] } } // Very Fast L->R red sand
            ]
        });

        this.registerEffect("bird_shadows", {
            id: "bird_shadows",
            label: "31. Bird Shadows",
            effects: [
                { type: "particles", config: { type: "bird", density: 0.07, speed: 3.0, scale: 0.2, tint: [1.0, 1.0, 1.0] } } 
            ]
        });

        this.registerEffect("cloud_shadows", {
            id: "cloud_shadows",
            label: "32. Cloud Shadows",
            filters: [{ type: "cloud_cover", speed: 0.2, scale: 1.0, alpha: 0.4, color: [0.0, 0.0, 0.0] }], // Alpha 0.4
            effects: []
        });

        this.registerEffect("fireflies", {
            id: "fireflies",
            label: "33. Fireflies",
            effects: [
                { type: "particles", config: { type: "firefly", density: 0.5, speed: 0.0, scale: 0.25, tint: [1.0, 1.0, 1.0], lifespan: true, lifetime: 1000, shimmer: true, shimmerSpeed: 0.002, blendMode: "add" } } // Floating, pulsing, glowing
            ]
        });

        // --- 5. ARCANE & MAGIC (39-51) ---

        this.registerEffect("arcane_rain", {
            id: "arcane_rain",
            label: "34. Arcane Rain",
            effects: [
                { type: "particles", config: { type: "rain", density: 0.8, speed: 3.0, scale: 1.0, tint: [0.8, 0.4, 1.0] } }, // Purple
                { type: "particles", config: { type: "glow", density: 0.1, speed: 0.5, scale: 0.5, tint: [0.6, 0.2, 1.0] } } // Sparkles
            ]
        });

        this.registerEffect("blood_rain", {
            id: "blood_rain",
            label: "35. Blood Rain",
            filters: [{ type: "color", value: [0.5, 0.0, 0.0], alpha: 0.4 }],
            effects: [
                { type: "particles", config: { type: "rain", density: 0.8, speed: 3.5, scale: 1.2, tint: [0.8, 0.0, 0.0] } } // Red rain
            ]
        });

        this.registerEffect("acid_rain", {
            id: "acid_rain",
            label: "36. Acid Rain",
            filters: [{ type: "color", value: [0.2, 0.8, 0.2], alpha: 0.3 }],
            effects: [
                { type: "particles", config: { type: "rain", density: 0.6, speed: 3.0, scale: 1.0, tint: [0.4, 1.0, 0.2] } } // Green rain
            ]
        });

        this.registerEffect("ash_world", {
            id: "ash_world",
            label: "37. Ash World",
            filters: [{ type: "color", value: [0.3, 0.1, 0.1], alpha: 0.3 }],
            effects: [
                { type: "particles", config: { type: "snow", density: 0.5, speed: 0.5, scale: 0.5, tint: [0.5, 0.5, 0.5] } } // Grey ash
            ]
        });

        this.registerEffect("aurora", {
            id: "aurora",
            label: "38. Aurora Borealis",
            filters: [
                { type: "aurora", speed: 0.5, intensity: 1.5 } 
            ],
            effects: []
        });

        this.registerEffect("mana_rising", {
            id: "mana_rising",
            label: "39. Mana Rising",
            effects: [
                { type: "particles", config: { type: "glow", density: 0.2, speed: 1.0, direction: 270, scale: 1.0, tint: [0.2, 0.8, 1.0] } } // Blue rising
            ]
        });

        this.registerEffect("fairy_dust", {
            id: "fairy_dust",
            label: "40. Fairy Dust",
            effects: [
                { type: "particles", config: { type: "glow", density: 0.3, speed: 0.3, scale: 0.4, tint: [1.0, 0.8, 0.9] } } // Pink/Gold
            ]
        });

        this.registerEffect("holy_light", {
            id: "holy_light",
            label: "41. Holy Light",
            filters: [{ type: "holy_light", intensity: 1.2, speed: 0.5 }], 
            effects: []
        });

        this.registerEffect("lurking_eyes", {
            id: "lurking_eyes",
            label: "42. Lurking Eyes",
            effects: [
                { type: "particles", config: { type: "glow", density: 0.05, speed: 0.1, scale: 0.4, tint: [1.0, 0.0, 0.0] } } // Red pairs difficult, just red eyes
            ]
        });

        this.registerEffect("venom_spores", {
            id: "venom_spores",
            label: "43. Venom Spores",
            effects: [
                { type: "particles", config: { type: "glow", density: 0.2, speed: 0.2, scale: 1.5, tint: [0.2, 0.8, 0.2] } } // Big green
            ]
        });

        // --- 6. SCI-FI & FILTERS (52-62) ---

        this.registerEffect("sparks", {
            id: "sparks",
            label: "44. Sparks",
            effects: [
                { type: "particles", config: { type: "glow", density: 0.2, speed: 5.0, scale: 0.4, tint: [0.4, 0.8, 1.0] } } // Blue sparks
            ]
        });

        this.registerEffect("digital_rain", {
            id: "digital_rain",
            label: "45. Digital Rain",
            filters: [{ type: "old_film", sepia: 0.0, noise: 0.4, scratch: 0.0 }], // Noise adds 'digital' feel
            effects: [
                { type: "particles", config: { type: "rain", density: 0.8, speed: 3.0, scale: 1.0, tint: [0.0, 1.0, 0.0] } } // Green rain
            ]
        });

        this.registerEffect("heat_wave", {
            id: "heat_wave",
            label: "46. Heat Wave",
            filters: [
                { type: "heat", intensity: 1.5, speed: 1.0 }
            ],
            effects: []
        });

        this.registerEffect("underwater", {
            id: "underwater",
            label: "47. Underwater",
            filters: [{ type: "underwater", speed: 1.0, intensity: 1.0 }],
            effects: []
        });

        this.registerEffect("old_film", {
            id: "old_film",
            label: "48. Old Film",
            filters: [{ type: "old_film", sepia: 0.6, noise: 0.5, scratch: 0.4, speed: 0.0 }],
            effects: []
        });

        this.registerEffect("chromatic_aberration", {
            id: "chromatic_aberration",
            label: "49. Chromatic Aberration",
            filters: [{ type: "chromatic", amount: 10.0 }],
            effects: []
        });

        this.registerEffect("sun_rays", {
            id: "sun_rays",
            label: "50. Sun Rays",
            filters: [
                { type: "godrays", alpha: 0.6, angle: -0.3 } // Angled differently than 61
            ],
            effects: []
        });

        this.registerEffect("sunbeams", {
            id: "sunbeams",
            label: "51. Sunbeams",
            filters: [
                { type: "godrays", alpha: 0.5, angle: 0.3 }
            ],
            effects: []
        });
    }



}

// Auto-register on setup (safer for CONFIG modifications)
Hooks.once("setup", () => {
    WeatherEffectsRegistry.init();
});
