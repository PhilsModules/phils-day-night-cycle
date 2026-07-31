import { RuntimeTexturePacker } from "./texture-packer.js";

/**
 * Custom Particle Engine for Phil's Day&Night Cycle
 * Renders custom sprites (Leaves, Insects, Runes) using PIXI.ParticleContainer for performance.
 */
export class ParticleEngine extends PIXI.Container {
    constructor(config, targetContainer = null, ticker = null) {
        super();
        this.config = config;
        this.particles = [];
        this.textures = []; // Array of valid textures
        this.validTextures = [];
        this.targetContainer = targetContainer; // Optional specific target
        this.customTicker = ticker;
        
        // We use canvas.app.ticker for better synchronization with Foundry, unless provided
        this._tickHandler = this.animate.bind(this);
        
        this.init();
        
        // Fix: Explicitly disable interaction so clicks pass through to canvas
        this.eventMode = 'none';
        this.interactive = false;
        this.interactiveChildren = false;
        
        // Performance: Use ParticleContainer
        this.particleContainer = null;
        this.usingAtlas = false;
        this._destroyed = false; // Track destruction state
    }

    async init() {
        // PDNC | Custom Particle Engine Init | Type:", this.config.type
        
        // If we are strictly on the main canvas weather layer (default behavior if no target or target is weather)
        // Ensure visibility.
        // CHANGE: Do NOT force visibility if we are about to hide it in the manager. 
        // In fact, if we are custom, we often want the default layer HIDDEN.
        // if (!this.targetContainer && canvas.weather) {
        //      canvas.weather.visible = true;
        //      canvas.weather.alpha = 1.0;
        // }

        let targetAssets = [];

        if (this.config.type === "leaf") {
            targetAssets = ["leaf"];
        } else if (this.config.type === "insect") {
            targetAssets = ["ins"]; // New Insect Assets (ins001-ins011)
        } else if (this.config.type === "bird") {
            targetAssets = ["vog"]; // New Bird Assets (vog001-vog005)
        } else {
            let assetName = this.config.type;
            // Fix naming discrepancies
            if (assetName === "custom_rain") assetName = "rain";
            else if (assetName === "custom_snow") assetName = "snow_soft"; 
            else if (assetName === "snow") assetName = "snow_soft";
            else if (assetName === "cloud") assetName = "cloud"; 
            
            else if (assetName === "insect") assetName = "ins"; 
            else if (assetName === "petal") assetName = "petal";
            else if (assetName === "rune") assetName = "rune";
            else if (assetName === "glow") assetName = "glow"; 
            else if (assetName === "firefly") assetName = "glow_firefly";
            else if (assetName === "droplets") assetName = "droplet";

            targetAssets = [assetName];
        }

        // Try to load variants
        const promises = [];
        for (const assetName of targetAssets) {
            
            // --- NEW ASSETS (Simple Numbering) ---
            if (assetName === "ins") {
                 for (let i = 1; i <= 11; i++) {
                    const num = i.toString().padStart(3, '0'); // 001..011
                    const path = `modules/phils-day-night-cycle/assets/particles/${assetName}${num}.webp`;
                    promises.push(this.loadTexture(path));
                }
            } else if (assetName === "vog") {
                for (let i = 1; i <= 5; i++) {
                    const num = i.toString().padStart(3, '0'); // 001..005
                    const path = `modules/phils-day-night-cycle/assets/particles/${assetName}${num}.webp`;
                    promises.push(this.loadTexture(path));
                }
            } else if (assetName === "leaf") {
                 // New Leaf Assets: leaf1.webp ... leaf10.webp
                 for (let i = 1; i <= 10; i++) {
                     const path = `modules/phils-day-night-cycle/assets/particles/leaf${i}.webp`;
                     promises.push(this.loadTexture(path));
                 }
            } else if (assetName === "petal") {
                 // New Petal Assets: petal1.webp ... petal11.webp
                 for (let i = 1; i <= 11; i++) {
                     const path = `modules/phils-day-night-cycle/assets/particles/petal${i}.webp`;
                     promises.push(this.loadTexture(path));
                 }
            }
            
            // --- LEGACY ASSETS ---
            else if (assetName.startsWith("insect_")) {
                const basePath = `modules/phils-day-night-cycle/assets/particles/${assetName}.webp`;
                promises.push(this.loadTexture(basePath));
            } else if (assetName === "glow" || assetName === "bird") {
                // Legacy bird fallback
                for (let i = 1; i <= 5; i++) {
                    const num = i.toString().padStart(2, '0');
                    const path = `modules/phils-day-night-cycle/assets/particles/${assetName}_${num}.webp`;
                    promises.push(this.loadTexture(path));
                }
            } else {
                // Standard 10 variants pattern (Legacy Fallback)
                for (let i = 1; i <= 10; i++) {
                    const num = i.toString().padStart(2, '0');
                    const path = `modules/phils-day-night-cycle/assets/particles/${assetName}_${num}.webp`;
                    promises.push(this.loadTexture(path));
                }
            }
        }

        await Promise.all(promises);

        // RACE CONDITION CHECK: If engine was destroyed while loading, stop.
        if (this._destroyed) {
            return;
        }

        if (this.validTextures.length > 0) {
            // Log:(`PDNC | Loaded ${this.validTextures.length} textures for ${this.config.type}. Attempting Atlas Packing...`);

            // --- PACKING START ---
            // NOTE: Atlas Packing (ParticleContainer) is disabled for stability.
            // It caused invisible particles on some clients. 
            // Standard PIXI.Container handles < 2000 sprites fine.
            /*
            try {
                const packed = await RuntimeTexturePacker.pack(this.validTextures);
                if (packed) {
                    this.atlasTexture = packed.texture;
                    this.atlasFrames = []; 
                    
                    for (const [oldTex, rect] of packed.frames) {
                        const t = new PIXI.Texture(this.atlasTexture, rect);
                        this.atlasFrames.push(t);
                    }

                    this.particleContainer = new PIXI.ParticleContainer(10000, {
                        scale: true, position: true, rotation: true, uvs: true, alpha: true, tint: true
                    });
                    
                    if (this.config.blendMode === "add") this.particleContainer.blendMode = PIXI.BLEND_MODES.ADD;
                    else if (this.config.blendMode === "screen") this.particleContainer.blendMode = PIXI.BLEND_MODES.SCREEN;

                    this.addChild(this.particleContainer);
                    this.usingAtlas = true;
                    // Log:("PDNC | Texture Atlas Created & ParticleContainer initialized.");
                }
            } catch (e) {
                console.error("PDNC | Texture Packing Failed:", e);
            }
            */
            // --- PACKING END ---

            this.spawnParticles();
            
            // Start Ticker
            this.lastTime = performance.now();
            const ticker = this.customTicker || canvas.app.ticker;
            ticker.add(this._tickHandler);
        } else {
            console.error(`PDNC | No valid textures found for ${this.config.type}`);
            
            // EMERGENCY RECOVERY: If initialization failed, verify if we hid the default layer.
            // If so, restore it so the user isn't blind.
            if (!this.targetContainer && canvas.weather && canvas.weather.alpha === 0) {
                 console.warn("PDNC | Restoring default Weather visibility due to load failure.");
                 canvas.weather.alpha = 1.0;
                 canvas.weather.visible = true;
            }
        }
    }

    loadTexture(path) {
        return new Promise((resolve) => {
            const texture = PIXI.Texture.from(path);
            
            if (texture.baseTexture.valid) {
                this.validTextures.push(texture);
                resolve();
            } else {
                // If it's already failed or we need to wait
                const onLoaded = () => {
                    this.validTextures.push(texture);
                    resolve();
                };
                const onError = (e) => {
                    console.error("PDNC | Texture Check: Error loading:", path, e);
                    resolve(); // Resolve anyway to not block Promise.all
                };

                texture.baseTexture.once('loaded', onLoaded);
                texture.baseTexture.once('error', onError);
            }
        });
    }

    getDesiredCount() {
        let densityMultiplier = 100;
        if (this.config.type === "rain" || this.config.type === "custom_rain") {
            densityMultiplier = 350; 
        } else if (this.config.type === "snow" || this.config.type === "custom_snow") {
             densityMultiplier = 125; 
        }

        const bounds = this.getBounds();
        const areaStandard = 1920 * 1080;
        const areaCurrent = bounds.w * bounds.h;
        const areaRatio = areaCurrent / areaStandard;
        
        const scaleFactor = areaRatio; 
        const baseCount = (this.config.density || 0.5) * densityMultiplier;
        
        // High Performance Mode: We can afford MORE particles if using Atlas!
        // But stick to original logic for consistency unless user asked for MORE.
        // User asked for "improvement without reducing density". This implies stability.
        
        let count = Math.floor(baseCount * scaleFactor);
        
        // Ensure at least 1 particle if density suggests we should have some, 
        // especially for Preview Window (small area)
        if (baseCount >= 1 && count < 1) {
            count = 1;
        }

        // PREVIEW WINDOW BOOST:
        // If we are rendering to a specific container (Preview), ensure we show enough particles 
        // to demonstrate variety (at least 4-5), unless the effect itself is extremely sparse.
        if (this.targetContainer && count < 8 && baseCount > 8) {
            count = 4;
        }
        
        return count;
    }

    spawnParticles() {
        const count = this.getDesiredCount();
        // PDNC | Spawning ${count} particles (Initial)

        for (let i = 0; i < count; i++) {
            this._createParticle(true);
        }
    }
    
    _createParticle(initial = false) {
        const tex = this.getRandomTexture();
        const p = new PIXI.Sprite(tex);
        
        // Set anchor to center for better rotation
        p.anchor.set(0.5);

        // Fix: Ensure individual particles are also non-interactive
        p.eventMode = 'none';
        p.interactive = false;
        
        this.resetParticle(p, initial);
        
        // Use ParticleContainer if available
        if (this.usingAtlas && this.particleContainer) {
            this.particleContainer.addChild(p);
        } else {
            this.addChild(p);
        }
        
        this.particles.push(p);
        return p;
    }

    resize() {
        if (this.validTextures.length === 0) return;
        
        // 0. Update Scale of EXISTING particles
        const scaleFactor = this.getScaleFactor();
        for (const p of this.particles) {
            if (p._baseScale !== undefined) {
                 p.scale.set(p._baseScale * scaleFactor);
                 // Re-apply rain stretch
                 if (this.config.type === "rain" || this.config.type === "custom_rain") {
                     p.scale.y *= 1.5;
                 }
            }
        }

        const desiredCount = this.getDesiredCount();
        const currentCount = this.particles.length;
        
        // Optimization: Don't churn if difference is small?
        if (desiredCount === currentCount) return;

        if (desiredCount > currentCount) {
             const diff = desiredCount - currentCount;
             // PDNC | Resizing: Adding ${diff} particles
             for (let i = 0; i < diff; i++) {
                 this._createParticle(true);
             }
        } else {
             const diff = currentCount - desiredCount;
             // PDNC | Resizing: Removing ${diff} particles
             for(let i=0; i<diff; i++){
                 const p = this.particles.pop();
                 // Remove from correct parent
                 if (p.parent) p.parent.removeChild(p);
                 p.destroy();
             }
        }
    }

    getRandomTexture() {
        // If usng Atlas, pick from atlasFrames
        if (this.usingAtlas && this.atlasFrames && this.atlasFrames.length > 0) {
            return this.atlasFrames[Math.floor(Math.random() * this.atlasFrames.length)];
        }
        // Fallback
        if (this.validTextures.length === 0) return PIXI.Texture.EMPTY;
        return this.validTextures[Math.floor(Math.random() * this.validTextures.length)];
    }

    getBounds() {
        // Explicit override from config
        if (this.config.dimensions) {
            return this.config.dimensions;
        }

        if (this.targetContainer) {
             // If attached to a specific PIXI App (like Preview), use its renderer/screen
             if (this.targetContainer.renderer) {
                 return { w: this.targetContainer.renderer.width, h: this.targetContainer.renderer.height };
             }
             // Or if we are a child of something with dimensions?
             return { w: 400, h: 400 }; // Fallback for Preview if renderer not accessible directly
        }
        // Fallback for Main Canvas
        if (canvas && canvas.dimensions) {
             return { w: canvas.dimensions.width, h: canvas.dimensions.height };
        }
        return { w: 1920, h: 1080 };
    }

    getScaleFactor() {
        const bounds = this.getBounds();
        const standardW = 1920; 
        const ratio = Math.min(1.0, bounds.w / standardW);
        // Flatter curve: Returns 0.54 at small sizes, 0.7 at full HD. 
        // This significantly reduces particle size on large screens compared to previous 1.0
        return 0.5 + 0.2 * ratio;
    }

    resetParticle(p, initial = false) {
        // Randomize texture
        p.texture = this.getRandomTexture();

        const bounds = this.getBounds();

        // Position
        if (this.config.spawnRect) {
            // Normalized Rect (0.0 - 1.0)
            p.x = bounds.w * (this.config.spawnRect.x + Math.random() * this.config.spawnRect.w);
            p.y = bounds.h * (this.config.spawnRect.y + Math.random() * this.config.spawnRect.h);
        } else {
            p.x = Math.random() * bounds.w;
            p.y = initial ? Math.random() * bounds.h : -100;
        }

        // Scale
        const scaleFactor = this.getScaleFactor();
        const baseConfigScale = this.config.scale || 1.0;
        const randomVariation = (0.8 + Math.random() * 0.4);
        const baseScale = baseConfigScale * randomVariation;

        p._baseScale = baseScale; // Store for resizing
        
        // Apply Resolution Scale
        p.scale.set(baseScale * scaleFactor);

        // Alpha
        if (this.config.lifespan) {
             p.alpha = 0; // Start invisible, fade in via animate()
        } else {
             p.alpha = (this.config.alpha ?? 1.0) * (0.6 + Math.random() * 0.4);
        }

        // Tint
        if (this.config.tint) {
            if (typeof this.config.tint === "string" && this.config.tint.startsWith("#")) {
                 p.tint = parseInt(this.config.tint.slice(1), 16);
            } else if (Array.isArray(this.config.tint)) {
                 const r = Math.floor(this.config.tint[0] * 255);
                 const g = Math.floor(this.config.tint[1] * 255);
                 const b = Math.floor(this.config.tint[2] * 255);
                 p.tint = (r << 16) + (g << 8) + b;
            } else {
                 p.tint = this.config.tint;
            }
        } else {
            p.tint = 0xFFFFFF;
        }

        // Blend Mode
        if (this.config.blendMode) {
            if (this.config.blendMode === "add") {
                p.blendMode = PIXI.BLEND_MODES.ADD;
            } else if (this.config.blendMode === "screen") {
                p.blendMode = PIXI.BLEND_MODES.SCREEN;
            } else {
                p.blendMode = PIXI.BLEND_MODES.NORMAL;
            }
        } else {
            p.blendMode = PIXI.BLEND_MODES.NORMAL;
        }

        // Physics
        const speedConfig = this.config.speed ?? 1.0;
        let speedMultiplier = 2; // Default for leaves/insects
        
        if (this.config.type === "rain" || this.config.type === "custom_rain") {
            speedMultiplier = 20; // Fast rain!
        } else if (this.config.type === "snow" || this.config.type === "custom_snow") {
            speedMultiplier = 3;
        }

        const speed = speedConfig * (0.8 + Math.random() * 0.4) * speedMultiplier; 
        
        let direction = (this.config.direction ?? 90) * (Math.PI / 180); 
        
        direction += (Math.random() - 0.5) * 0.5; 

        // Wild Movement Override (Insects)
        if (this.config.type === "insect" || this.config.type === "bird") {
            // Randomize X direction (Left <-> Right)
            if (Math.random() > 0.5) direction = Math.PI; // Left
            else direction = 0; // Right
            
            // Randomize speed
            speedMultiplier = (1.5 + Math.random() * 2.5); // Fast & Variable
            
            // Random velocity vector with noise
            p.vx = (Math.random() - 0.5) * speedMultiplier * 5; 
            p.vy = (Math.random() - 0.5) * speedMultiplier * 5;
            
            p.wildSpeed = speedMultiplier;
        } else {
             p.vx = Math.cos(direction) * speed;
             p.vy = Math.sin(direction) * speed;
        }

        // Rotation
        if (this.config.type === "rain" || this.config.type === "custom_rain") {
            // Rain must align with direction + 90 degrees (vertical texture assumed)
            p.rotation = direction - Math.PI / 2;
            p.rotSpeed = 0;
            p.scale.y *= 1.5; // Stretch length for speed illusion
        } else if (this.config.type === "insect") {
            // Align with velocity
            p.rotation = Math.atan2(p.vy, p.vx) + Math.PI / 2; // +90 deg for Head-Up assets
            p.rotSpeed = 0; // Handled in animate
        } else if (this.config.noRotation) {
            p.rotation = 0;
            p.rotSpeed = 0;
        } else {
            p.rotation = Math.random() * Math.PI * 2;
            p.rotSpeed = (Math.random() - 0.5) * 0.05 * speedConfig;
        }
        
        // Wobble
        if (this.config.type === "rain" || this.config.type === "custom_rain") {
            p.wobble = 0;
            p.wobbleSpeed = 0;
        } else {
            p.wobble = Math.random() * Math.PI * 2;
            p.wobbleSpeed = 0.05 + Math.random() * 0.05;
        }
        if (this.config.lifespan) {
            // Only randomize position if NOT using a restricted spawn rect
            if (!this.config.spawnRect) {
                p.x = Math.random() * bounds.w;
                p.y = Math.random() * bounds.h;
            }
            
            // Determine base lifespan (frames) from config or legacy fallbacks
            let baseLifetime = 100;
            if (this.config.lifetime) {
                baseLifetime = this.config.lifetime;
            } else {
                 // Fallback for older effects without explicit lifetime
                 baseLifetime = 60 + Math.random() * 40; 
            }
            
            p.maxAge = baseLifetime + Math.random() * (baseLifetime * 0.5); 
            // If initial, start at random age to desync. If respawn, start fresh.
            p.age = initial ? Math.random() * p.maxAge : 0; 
        }
    }

    animate(deltaInput) {
        // Fix: Allow animation if we have a specific target (Preview Window) 
        // OR if global weather is visible.
        
        // GLOBAL PAUSE CHECK
        // GLOBAL PAUSE CHECK
        // Safety: Check if setting exists to prevent "not a registered setting" crash on early ticks
        if (game.settings.settings.has("phils-day-night-cycle.weatherPaused")) {
            if (game.settings.get("phils-day-night-cycle", "weatherPaused")) {
                 return; 
            }
        }

        if (!this.visible) return;
        if (!this.targetContainer && (!canvas.weather || !canvas.weather.visible)) return;

        // Robust Time-Based Delta
        const now = performance.now();
        if (!this.lastTime) this.lastTime = now;
        const dtMS = now - this.lastTime;
        this.lastTime = now;

        // Convert MS to "Frame Units" (approx 1.0 at 60fps / 16.6ms)
        // dtMS * 0.06 => 16.6 * 0.06 ~= 1.0
        let delta = dtMS * 0.06;
        
        // Safety cap for lag spikes (max 3 frames)
        if (delta > 3.0) delta = 3.0;
        // Safety min to prevent zero-updates
        if (delta < 0.01) delta = 0.01;

        if (delta < 0.01) delta = 0.01;

        const bounds = this.getBounds();
        const buffer = 100;
        
        // Fetch suppression regions once per frame for performance
        const suppressionRegions = this._getSuppressionRegions();
        const hasSuppression = suppressionRegions.length > 0;



        for (const p of this.particles) {
            p.x += p.vx * delta;
            p.y += p.vy * delta;

            // Wobble effect (only if moving)
            if ((this.config.speed ?? 1.0) > 0.1) {
                p.wobble += p.wobbleSpeed * delta;
                p.x += Math.sin(p.wobble) * 0.5;
            }

            // INSECT BEHAVIOR: Erratic Movement
            if (this.config.type === "insect" || this.config.type === "bird") {
                // Randomly change direction slightly
                if (Math.random() < 0.05) {
                    p.vx += (Math.random() - 0.5) * 2;
                    p.vy += (Math.random() - 0.5) * 2;
                }
                
                // Cap speed
                const maxSpeed = p.wildSpeed * 3 || 5;
                if (Math.abs(p.vx) > maxSpeed) p.vx *= 0.95;
                if (Math.abs(p.vy) > maxSpeed) p.vy *= 0.95;

                // Update Rotation to face movement
                // Lerp rotation for smoothness? Direct is fine for insects.
                p.rotation = Math.atan2(p.vy, p.vx) + Math.PI / 2;
            } else {
                // Standard Rotation
                p.rotation += p.rotSpeed * delta;
            }
            
            let respawn = false;

            if (this.config.lifespan) {
                p.age += delta;
                
                // Fade Logic
                const progress = p.age / p.maxAge;
                let fade = 1.0;
                if (this.config.fadeStyle === "out") {
                    // Start max, fade out (Linear or Quadratic)
                    fade = 1.0 - progress; 
                } else {
                    // Default: Sine (Fade In -> Fade Out)
                    fade = Math.sin(progress * Math.PI);
                }
                
                // Twinkle: Only if explicitly enabled
                let twinkle = 1.0;
                if (this.config.shimmer) {
                     const speed = this.config.shimmerSpeed ?? 0.005;
                     // Shimmer Speed:", speed
                     twinkle = 0.5 + 0.5 * Math.sin(p.age * speed); 
                }

                p.alpha = (this.config.alpha ?? 1.0) * fade * twinkle;



                // -----------------------------------------

                if (p.age >= p.maxAge) {
                   respawn = true;
                }
            } else {
                // Bounds Check & Respawn
                const dir = (this.config.direction ?? 90);
                
                // Check based on primary direction to avoid "sticking" at edges
                if (dir >= 45 && dir <= 135) { // Down
                    if (p.y > bounds.h + buffer) respawn = true;
                } else if (dir >= 225 && dir <= 315) { // Up
                    if (p.y < -buffer) respawn = true;
                } else if (dir > 135 && dir < 225) { // Left
                    if (p.x < -buffer) respawn = true;
                } else { // Right
                    if (p.x > bounds.w + buffer) respawn = true;
                }
            }

            if (respawn) {
                 if (this.config.lifespan) {
                     this.resetParticle(p, false); // Start fresh cycle
                 } else {
                     // Update texture on respawn for variety
                     p.texture = this.getRandomTexture();

                     const dir = (this.config.direction ?? 90);
                     
                     // ----------------------------------------------------
                     // DYNAMIC SPAWN RATIO (Flux Calculation)
                     // ----------------------------------------------------
                     // Calculate the projected length of the screen edges relative to the flow direction.
                     // Top/Bottom (Width) intercepts vertical flow (sin).
                     // Left/Right (Height) intercepts horizontal flow (cos).
                     
                     const rad = dir * (Math.PI / 180);
                     const topFlux = bounds.w * Math.abs(Math.sin(rad));
                     const sideFlux = bounds.h * Math.abs(Math.cos(rad));
                     const totalFlux = topFlux + sideFlux;
                     
                     // Probability of spawning on the Top/Bottom edge
                     // Default to 1.0 (Top only) if totalFlux is weird, but usually it's fine.
                     const topRatio = totalFlux > 0 ? (topFlux / totalFlux) : 1.0;

                     // Down-Right (approx 0-90 deg) -> Spawn Top OR Left
                     if (dir > 5 && dir < 85) {
                         if (Math.random() < topRatio) {
                             p.y = -50; p.x = Math.random() * bounds.w; // Top
                         } else {
                             p.x = -50; p.y = Math.random() * bounds.h; // Left
                         }
                     }
                     // Down-Left (approx 90-180 deg) -> Spawn Top OR Right
                     else if (dir > 95 && dir < 175) {
                          if (Math.random() < topRatio) {
                             p.y = -50; p.x = Math.random() * bounds.w; // Top
                         } else {
                             p.x = bounds.w + 50; p.y = Math.random() * bounds.h; // Right
                         }
                     }
                     // Up-Right (approx 270-360 deg) -> Spawn Bottom OR Left
                     else if (dir > 275 && dir < 355) {
                          if (Math.random() < topRatio) {
                             p.y = bounds.h + 50; p.x = Math.random() * bounds.w; // Bottom
                         } else {
                             p.x = -50; p.y = Math.random() * bounds.h; // Left
                         }
                     }
                      // Up-Left (approx 180-270 deg) -> Spawn Bottom OR Right
                     else if (dir > 185 && dir < 265) {
                          if (Math.random() < topRatio) {
                             p.y = bounds.h + 50; p.x = Math.random() * bounds.w; // Bottom
                         } else {
                             p.x = bounds.w + 50; p.y = Math.random() * bounds.h; // Right
                         }
                     }
                     
                     // ----------------------------------------------------
                     // CARDINAL SPAWNING (Fallback)
                     // ----------------------------------------------------
                     else if (dir >= 45 && dir <= 135) { // Down -> Reset Top
                         p.y = -50;
                         p.x = Math.random() * bounds.w;
                     } else if (dir >= 225 && dir <= 315) { // Up -> Reset Bottom
                         p.y = bounds.h + 50;
                         p.x = Math.random() * bounds.w;
                     } else if (dir > 135 && dir < 225) { // Left -> Reset Right
                         p.x = bounds.w + 50;
                         p.y = Math.random() * bounds.h;
                     } else { // Right -> Reset Left
                         p.x = -50;
                         p.y = Math.random() * bounds.h;
                     }
                 }
            }

            // --- WEATHER SUPPRESSION (Applied to ALL particles) ---
            if (hasSuppression) {
                let isHidden = false;
                for (const regionDoc of suppressionRegions) {
                    try {
                        // elevation: null is vital for 2D check
                        if (regionDoc.testPoint({x: p.x, y: p.y, elevation: null})) {
                            isHidden = true;
                            break; 
                        }
                    } catch (err) {
                        // Ignore errors during check
                    }
                }

                if (isHidden) {
                    p.alpha = 0;
                } else {
                    // RESTORE ALPHA if it was hidden and we are not handling alpha elsewhere
                    // If lifespan is used, alpha is calculated at start of loop, so we don't need to do anything.
                    // If lifespan is NOT used (Rain/Snow), alpha is static, so we must restore it manually.
                    if (!this.config.lifespan && p.alpha === 0) {
                         p.alpha = (this.config.alpha ?? 1.0);
                    }
                }
            }
        }
    }

    /**
     * Retrieves all active Regions with "Suppress Weather" behavior.
     * @returns {RegionDocument[]}
     */
    /**
     * Retrieves all active Regions with "Suppress Weather" behavior.
     * @returns {RegionDocument[]}
     */
    _getSuppressionRegions() {
        if (!canvas || !canvas.regions || !canvas.regions.placeables) {
             // console.warn("PDNC DEBUG | No Canvas/Regions Layer found");
             return [];
        }

        const regions = [];
        for (const region of canvas.regions.placeables) {
            // Check if region has active Suppress Weather behavior
            // In V12/V13, behaviors is a Collection on the document.
            // We need to check the DOCUMENT for behaviors.
            const doc = region.document;
            
            // Debug the check occasionally if needed, or trust strict logic
            const hasSuppression = doc.behaviors?.some(b => 
                b.type === "suppressWeather" && !b.disabled
            );

            if (hasSuppression) {
                regions.push(doc); // Return the Document, not the Placeable
            }
        }
        return regions;
    }

    destroy(options) {
        this._destroyed = true; 
        if (this._tickHandler) {
            canvas.app.ticker.remove(this._tickHandler);
            this._tickHandler = null;
        }
        
        // Clean up Atlas if created
        if (this.atlasTexture) {
            this.atlasTexture.destroy(true); // Destroy base texture too
        }

        this.particles = [];
        this.validTextures = [];
        super.destroy(options);
    }
}
