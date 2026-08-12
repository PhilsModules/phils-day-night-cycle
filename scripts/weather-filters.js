/**
 * Manages custom full-screen PIXI filters for weather effects.
 * Handles Heat Haze, Underwater, Old Film, etc.
 */
export class WeatherFilterManager {
    constructor() {
        this.activeFilters = new Map();
        this._ticker = 0;
    }

    static init() {
        game.weatherFilters = new WeatherFilterManager();
        
        // Hook into the render loop to update animated filters
        Hooks.on("canvasInit", () => {
             game.weatherFilters.clearFilters();
        });

        Hooks.on("tearDownCanvas", () => {
             game.weatherFilters.clearFilters();
        });

        // We need a ticker for animation
        PIXI.Ticker.shared.add((delta) => {
            if (game.weatherFilters) game.weatherFilters.animate(delta);
        });
    }

    /**
     * Apply a specific filter to the canvas
     * @param {string} id - Unique ID for the filter
     * @param {PIXI.Filter} filter - The PIXI filter instance
     * @param {string} targetLayer - The layer to apply to (default: 'stage')
     */
    addFilter(id, filter, targetLayer = 'stage') {
        if (this.activeFilters.has(id)) return;

        if (typeof targetLayer === 'object' && targetLayer.filters !== undefined) {
             this.activeFilters.set(id, { filter, targetObject: targetLayer });
             if (!targetLayer.filters) targetLayer.filters = [];
             targetLayer.filters = [...targetLayer.filters, filter];
             return;
        }

        this.activeFilters.set(id, { filter, targetLayer });

        if (targetLayer === 'stage') {
            const currentFilters = canvas.stage.filters || [];
            canvas.stage.filters = [...currentFilters, filter];
        } else if (canvas[targetLayer]) {
            const currentFilters = canvas[targetLayer].filters || [];
            canvas[targetLayer].filters = [...currentFilters, filter];
        }
    }

    /**
     * Remove a filter by ID
     * @param {string} id 
     */
    removeFilter(id) {
        if (!this.activeFilters.has(id)) return;
        
        const { filter, targetLayer, targetObject } = this.activeFilters.get(id);
        
        if (targetObject) {
             if (targetObject.filters) {
                 targetObject.filters = targetObject.filters.filter(f => f !== filter);
             }
        } 
        else if (targetLayer === 'stage' && canvas.stage?.filters) {
            canvas.stage.filters = canvas.stage.filters.filter(f => f !== filter);
        } else if (targetLayer && canvas[targetLayer]?.filters) {
            canvas[targetLayer].filters = canvas[targetLayer].filters.filter(f => f !== filter);
        }

        this.activeFilters.delete(id);
    }

    clearFilters() {
        for (const [id, _] of this.activeFilters) {
            this.removeFilter(id);
        }
    }

    updateSuppressionMask() {
        if (!this.suppressionGraphics) {
            this.suppressionGraphics = new PIXI.Graphics();
        }
        
        if (!canvas || !canvas.app || !canvas.app.renderer) return;
        
        const screen = canvas.app.renderer.screen;

        // We need a texture to pass to shaders
        if (!this.suppressionTexture) {
             this.suppressionTexture = PIXI.RenderTexture.create({
                 width: screen.width,
                 height: screen.height,
             });
        }
        
        // Resize check
        if (this.suppressionTexture.width !== screen.width || this.suppressionTexture.height !== screen.height) {
             this.suppressionTexture.resize(screen.width, screen.height);
        }

        const graphics = this.suppressionGraphics;
        graphics.clear();

        // 1. ALLOW WORLD (White)
        // Draw a massive rectangle to cover the entire canvas/world, not just the scene.
        // This ensures weather exists everywhere by default, and is only removed by regions.
        graphics.beginFill(0xFFFFFF, 1.0);
        graphics.drawRect(-50000, -50000, 100000, 100000); 
        graphics.endFill();

        // 2. SUPPRESS REGIONS (Black / Erase)
        // We draw black on top of the white scene.
        graphics.beginFill(0x000000, 1.0); // Black

        if (canvas && canvas.regions && canvas.regions.placeables) {
             for (const region of canvas.regions.placeables) {
                 const doc = region.document;
                 const hasSuppression = doc.behaviors?.some(b => b.type === "suppressWeather" && !b.disabled);
                 
                 if (hasSuppression) {
                     // Support V12 Regions (Array of Polygons) which handles complex shapes & holes
                     // FIX: Use doc.polygons (RegionDocument) instead of region.polygons (Deprecated)
                     if (doc.polygons && Array.isArray(doc.polygons)) {
                         doc.polygons.forEach(poly => graphics.drawPolygon(poly));
                     }
                     // Fallback check for older/simple regions
                     else if (region.polygon) {
                         graphics.drawPolygon(region.polygon);
                     }
                 }
             }
        }
        graphics.endFill();
        
        if (canvas.app && canvas.app.renderer) {
             // Render World-Space graphics to Screen-Space Texture
             // Important: clear: true ensures the previous frame is wiped to transparent
             canvas.app.renderer.render(graphics, {
                 renderTexture: this.suppressionTexture,
                 clear: true,
                 transform: canvas.stage.transform.worldTransform
             });
        }
    }

    animate(delta) {
        // Safety: Check if setting exists to prevent "not a registered setting" crash on early ticks
        if (game.settings.settings.has("phils-day-night-cycle.weatherPaused")) {
            if (game.settings.get("phils-day-night-cycle", "weatherPaused")) {
                 return; 
            }
        }

        try {
            this.updateSuppressionMask();
        } catch (e) {
            if (this._ticker % 100 === 0) console.error("PDNC | Mask Update Error:", e);
        }

        this._ticker += delta;
        for (const [id, data] of this.activeFilters) {
            const filter = data.filter;
            // Update Uniforms
            if (filter.uniforms) {
                if (filter.uniforms.time !== undefined) filter.uniforms.time += 0.01 * delta;
                if (filter.uniforms.uTime !== undefined) filter.uniforms.uTime += 0.01 * delta;
                
                // Inject Suppression Mask
                // Default to White (No suppression) if texture is missing/failed
                if (filter.uniforms.uSuppressionMask !== undefined) {
                     filter.uniforms.uSuppressionMask = this.suppressionTexture || PIXI.Texture.WHITE;
                }
            }
        }
    }
}

/**
 * Custom Heat Wave / Heat Shimmer Filter
 * Uses a displacement map to simulate rising hot air.
 */
export class HeatWaveFilter extends PIXI.Filter {
    constructor(intensity = 1.0, speed = 1.0) {
        // Simple displacement vertex/fragment shader approach
        // We'll use a noise texture for displacement
        
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;

        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float intensity;
            uniform sampler2D uSuppressionMask;
            
            void main(void) {
                vec2 uv = vTextureCoord;
                
                // Simple sine wave displacement for heat
                // In a real 'noise' based heat haze we'd fetch from a noise texture, 
                // but math-based is lighter and self-contained.
                
                float wave = sin(uv.y * 20.0 + time * 2.0) * 0.002 * intensity;
                float wave2 = sin(uv.x * 10.0 + time * 1.5) * 0.001 * intensity;
                
                vec4 texColor = texture2D(uSampler, uv + vec2(wave2, wave));
                
                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, uv).r;
                // For displacement/heat, we might want to just revert to original UV or fade effect
                // Mix between original color and displaced color based on allowed
                // If allowed=1 (show effect), we use texColor. If allowed=0 (hide), we use texture2D(uSampler, uv)
                
                vec4 origColor = texture2D(uSampler, uv);
                gl_FragColor = mix(origColor, texColor, allowed);
            }
        `;

        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.intensity = intensity;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE; // Init safe
    }
}

/**
 * Old Film Filter (Grain, Scratches, Vignette)
 */
export class OldFilmFilter extends PIXI.Filter {
    constructor(sepia = 0.3, noise = 0.3, scratch = 0.3) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        // Simple noise and vignette shader
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float noise;
            uniform float sepia;
            uniform float speed;
            uniform sampler2D uSuppressionMask; // Add Suppression
            
            float rand(vec2 co) {
                return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
            }

            void main(void) {
                vec2 uv = vTextureCoord;
                vec4 color = texture2D(uSampler, uv);
                
                // Noise with Frame Stepping (Stutter)
                float t = floor(time * speed); 
                float n = rand(uv + t) * noise;
                
                // Calculate Effect Color
                vec3 effectRGB = color.rgb + n - (noise * 0.5);
                
                // Simple Sepia
                vec3 sepiaColor = vec3(1.2, 1.0, 0.8);
                float gray = dot(effectRGB, vec3(0.299, 0.587, 0.114));
                effectRGB = mix(effectRGB, vec3(gray) * sepiaColor, sepia);
                
                // Vignette with Suppression
                float dist = distance(uv, vec2(0.5));
                effectRGB *= 1.0 - (dist * 0.5);

                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, uv).r;
                // Mix between Original Color (no effect) and Effect Color
                vec3 finalRGB = mix(color.rgb, effectRGB, allowed);

                gl_FragColor = vec4(finalRGB, color.a);
            }
        `;
        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.noise = noise;
        this.uniforms.sepia = sepia;
        this.uniforms.speed = 12.0; // Default 12fps look
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }
}

/**
 * Chromatic Aberration Filter (RGB Split)
 */
export class ChromaticAberrationFilter extends PIXI.Filter {
    constructor(amount = 5.0) { // check unit, normally pixels
         const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float amount; // Offset size
            uniform sampler2D uSuppressionMask;
            
            void main(void) {
                vec2 uv = vTextureCoord;
                // Simple horizontal split
                float split = amount * 0.001; 
                
                float r = texture2D(uSampler, uv + vec2(split, 0.0)).r;
                float g = texture2D(uSampler, uv).g;
                float b = texture2D(uSampler, uv - vec2(split, 0.0)).b;
                
                vec4 effectColor = vec4(r, g, b, texture2D(uSampler, uv).a);
                
                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, uv).r;
                vec4 origColor = texture2D(uSampler, uv);
                
                gl_FragColor = mix(origColor, effectColor, allowed);
            }
        `;
        super(vertex, fragment);
        this.uniforms.amount = amount;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }
}

/**
 * Underwater Filter (Wobble + Blue Tint)
 */
export class UnderwaterFilter extends PIXI.Filter {
    constructor(speed = 1.0, intensity = 1.0) {
         const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float speed;
            uniform float intensity;
            uniform sampler2D uSuppressionMask;
            
            void main(void) {
                vec2 uv = vTextureCoord;
                
                // Calculate Distortion based on allowed mask? 
                // We fetch mask at UV. If 0, no distortion.
                float allowed = texture2D(uSuppressionMask, uv).r;
                
                // Wave distortion scaled by allowed
                float distX = sin(uv.y * 10.0 + time * speed) * 0.005 * intensity * allowed;
                float distY = cos(uv.x * 10.0 + time * speed) * 0.005 * intensity * allowed;
                
                uv.x += distX;
                uv.y += distY;
                
                vec4 color = texture2D(uSampler, uv);
                
                // Blue tint scaled by allowed
                vec3 tinted = mix(color.rgb, vec3(0.0, 0.4, 0.7), 0.3);
                color.rgb = mix(color.rgb, tinted, allowed);
                
                gl_FragColor = color;
            }
        `;
        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.speed = speed;
        this.uniforms.intensity = intensity;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }
}


/**
 * Lightning Flash Filter
 */
export class LightningFilter extends PIXI.Filter {
    constructor(intensity = 0.8) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float intensity;
            uniform sampler2D uSuppressionMask;
            
            float rand(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                vec4 color = texture2D(uSampler, vTextureCoord);
                
                // Multi-pulse realistic lightning strike timeline
                float windowSize = 4.0;
                float seed = floor(time / windowSize);
                float strikeProgress = mod(time, windowSize);
                
                float flash = 0.0;
                if (rand(vec2(seed, 3.14)) > 0.88) { // Natural strike frequency
                    if (strikeProgress < 0.6) {
                        float t = strikeProgress * 12.0; // Speed of strike sequence
                        float mainFlash = exp(-t * 2.5);
                        float echo1 = exp(-pow(t - 1.2, 2.0) * 15.0) * 0.75;
                        float echo2 = exp(-pow(t - 2.1, 2.0) * 12.0) * 0.45;
                        flash = (mainFlash + echo1 + echo2) * intensity;
                    }
                }
                
                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, vTextureCoord).r;
                flash *= allowed;

                // Warm skyglow boost
                vec3 flashColor = vec3(0.85, 0.92, 1.0) * flash;
                gl_FragColor = vec4(color.rgb + flashColor, color.a);
            }
        `;
        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.intensity = intensity;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }

    apply(filterManager, input, output, clear) {
        this.uniforms.time = performance.now() / 1000;
        filterManager.applyFilter(this, input, output, clear);
    }
}

/**
 * God Rays / Sunbeams Filter (Approximation)
 */
export class GodRaysFilter extends PIXI.Filter {
    constructor(alpha = 0.5, angle = 0.3) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float alpha;
            uniform float angle; 
            uniform sampler2D uSuppressionMask;
            
            float rand(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                vec4 color = texture2D(uSampler, vTextureCoord);
                vec2 uv = vTextureCoord;

                // Move beams slowly with organic shimmer
                float t = time * 0.15;
                
                // Multi-frequency diagonal light shafts
                float beams = sin(uv.x * 18.0 + uv.y * 8.0 * angle - t) 
                            + sin(uv.x * 28.0 + uv.y * 4.0 * angle + t * 0.7) * 0.5
                            + sin(uv.x * 42.0 - t * 1.3) * 0.25;
                            
                beams = smoothstep(0.4, 1.6, beams);
                
                // Dust mote shimmer inside rays
                float motes = rand(uv * 15.0 + vec2(t * 0.05)) * step(0.6, beams);
                
                vec3 beamColor = vec3(1.0, 0.95, 0.78); // Soft Golden Sunbeams
                
                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, uv).r;
                
                vec3 lightBoost = beamColor * (beams + motes * 0.15) * alpha * 0.25 * allowed;
                gl_FragColor = vec4(color.rgb + lightBoost, color.a);
            }
        `;
        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.alpha = alpha;
        this.uniforms.angle = angle;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }

    apply(filterManager, input, output, clear) {
        this.uniforms.time = performance.now() / 1000;
        filterManager.applyFilter(this, input, output, clear);
    }
}


/**
 * Rainbow Filter
 * Draws a subtle rainbow arc.
 */
export class RainbowFilter extends PIXI.Filter {
    constructor(intensity = 0.5) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float intensity;
            uniform sampler2D uSuppressionMask;
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main() {
                vec4 color = texture2D(uSampler, vTextureCoord);
                vec2 uv = vTextureCoord;
                
                // Arc
                // Center at (0.5, 1.2) - below screen
                float dist = distance(uv, vec2(0.5, 1.2));
                
                // Band width 0.6 to 0.7 radius
                float band = smoothstep(0.6, 0.65, dist) * (1.0 - smoothstep(0.7, 0.75, dist));
                
                // Hue based on distance (rainbow spectrum)
                // Map distance 0.6->0.7 to 0.0->1.0 hue
                float hue = (dist - 0.6) * 10.0;
                vec3 rainbow = hsv2rgb(vec3(hue, 0.8, 1.0));
                
                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, uv).r;
                
                gl_FragColor = color + vec4(rainbow * band * intensity * allowed, 0.0);
            }
        `;
        super(vertex, fragment);
        this.uniforms.intensity = intensity;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }
}

/**
 * Halo / Sun Dog Filter
 * Adds a glowing ring or halo effect.
 */
export class HaloFilter extends PIXI.Filter {
    constructor(intensity = 0.5) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float intensity;
            uniform sampler2D uSuppressionMask;
            
            void main() {
                vec4 color = texture2D(uSampler, vTextureCoord);
                vec2 uv = vTextureCoord;
                
                // Halo Ring
                vec2 center = vec2(0.5, 0.3); // High center (sun)
                float dist = distance(uv, center);
                
                // Ring at radius 0.4
                float ring = smoothstep(0.38, 0.4, dist) * (1.0 - smoothstep(0.4, 0.42, dist));
                
                // Glow center
                float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                
                vec3 haloColor = vec3(1.0, 0.9, 0.8);
                
                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, uv).r;
                
                gl_FragColor = color + vec4(haloColor * (ring + glow * 0.2) * intensity * allowed, 0.0);
            }
        `;
        super(vertex, fragment);
        this.uniforms.intensity = intensity;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }
}



/**
 * Custom Heat Wave / Heat Shimmer Filter
 * ...
 */
 

// --- 10. Fog Filter (FBM Noise with Domain Warping) ---
export class FogFilter extends PIXI.Filter {
    constructor(speed = 1.0, density = 0.5, color, gradient = false, gradientStart = 0.65) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;

        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float speed;
            uniform float density;
            uniform float gradient; // 1.0 = Bottom Only, 0.0 = Full
            uniform float gradientStart;
            uniform vec3 color;
            
            // SUPPRESSION (White-Pass Logic)
            uniform sampler2D uSuppressionMask;

            // Hash function
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            // Noise texture
            float noise(vec2 p){
                vec2 ip = floor(p);
                vec2 u = fract(p);
                u = u*u*(3.0-2.0*u);
                float res = mix(
                    mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
                    mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
                return res*res;
            }

            // Fractal Brownian Motion
            float fbm(vec2 x) {
                float v = 0.0;
                float a = 0.5;
                vec2 shift = vec2(100.0);
                // Rotate to reduce axial bias
                mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
                for (int i = 0; i < 4; ++i) { // 4 Octaves
                    v += a * noise(x);
                    x = rot * x * 2.0 + shift;
                    a *= 0.5;
                }
                return v;
            }

            void main(void) {
                vec2 uv = vTextureCoord;
                
                // Texture color
                vec4 texColor = texture2D(uSampler, uv);
                
                // Move fog with domain warping for organic rolling mist
                vec2 fogUV = uv * 3.0 + vec2(time * 0.04 * speed, time * 0.015 * speed);
                vec2 warp = vec2(
                    fbm(fogUV + vec2(0.0, time * 0.02 * speed)),
                    fbm(fogUV + vec2(time * 0.02 * speed, 1.6))
                ) * 0.35;
                
                float f = fbm(fogUV + warp);
                
                // Alpha Logic: Base density + noise variation
                float fogAlpha = clamp((f * density * 2.0), 0.0, 1.0);
                
                // Vertical Gradient Mask (if enabled)
                if (gradient > 0.5) {
                    // Fade out at top (UV.y 0.0) -> Full at bottom (UV.y 1.0)
                    // Use gradientStart uniform
                    float mask = smoothstep(gradientStart, gradientStart + 0.3, uv.y);
                    fogAlpha *= mask;
                }
                
                // CHECK SUPPRESSION MASK (White = Show, Black/Empty = Hide)
                float allowed = texture2D(uSuppressionMask, uv).r; 
                fogAlpha *= allowed;
                
                // Blend: TextColor mixed with FogColor by FogAlpha
                vec3 finalRGB = mix(texColor.rgb, color, fogAlpha);
                
                gl_FragColor = vec4(finalRGB, texColor.a);
            }
        `;
        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.speed = speed;
        this.uniforms.density = density;
        this.uniforms.gradient = gradient ? 1.0 : 0.0;
        this.uniforms.gradientStart = gradientStart;
        this.uniforms.color = color || [0.8, 0.85, 0.9];
        
        // Initialize Mask uniform null (will be filled by Manager)
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE; 
    }
}



/**
 * Holy Light / Divine Rays Filter
 * Beams of light shining down from the heavens (top center).
 * Pulsating golden glow.
 */
export class HolyLightFilter extends PIXI.Filter {
    constructor(intensity = 1.0, speed = 1.0) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float intensity;
            uniform float speed;
            uniform sampler2D uSuppressionMask;
            
            // Hash function
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }
            
            // Value Noise
            float noise(vec2 p){
                vec2 ip = floor(p);
                vec2 u = fract(p);
                u = u*u*(3.0-2.0*u);
                float res = mix(
                    mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
                    mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
                return res*res;
            }

            void main() {
                vec4 color = texture2D(uSampler, vTextureCoord);
                vec2 uv = vTextureCoord;
                
                // 1. Ray Origin (Top Center, slightly off-screen)
                vec2 center = vec2(0.5, -0.2);
                vec2 distVec = uv - center;
                float dist = length(distVec);
                float angle = atan(distVec.y, distVec.x);
                
                // 2. Generate Rays (Polar Coordinates)
                // Use noise based on angle to create "beams"
                // Rotate rays slowly over time
                float t = time * 0.2 * speed;
                float beamNoise = noise(vec2(angle * 4.0 + t, t)); 
                
                // Sharpen beams
                float rays = smoothstep(0.3, 0.7, beamNoise);
                
                // Fade rays with distance (Falloff)
                rays *= smoothstep(1.0, 0.0, dist * 0.8);
                
                // 3. Golden Vignette/Glow
                // Soft glow at the top
                float glow = smoothstep(0.6, 0.0, uv.y);
                
                // Pulsating intensity
                float pulse = 1.0 + 0.2 * sin(time * speed);
                
                // 4. Colors
                vec3 colGold = vec3(1.0, 0.9, 0.5); // Golden Light
                vec3 colWhite = vec3(1.0, 1.0, 0.9); // Bright Core
                
                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, uv).r;
                
                vec3 finalLight = mix(colGold, colWhite, rays) * rays * glow * pulse * intensity * 0.6 * allowed;
                
                // Additive Blend
                gl_FragColor = color + vec4(finalLight, 0.0);
            }
        `;
        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.intensity = intensity;
        this.uniforms.speed = speed;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }
}

// --- 11. Cloud Cover Filter (Procedural Clouds) ---
export class CloudCoverFilter extends PIXI.Filter {
    constructor(speed = 0.5, scale = 1.0, alpha = 0.5, color) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;

        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float speed;
            uniform float scale;
            uniform float alpha;
            uniform vec3 color;
            uniform sampler2D uSuppressionMask;

            // Hash
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            // Smooth Noise
            float noise(vec2 p){
                vec2 ip = floor(p);
                vec2 u = fract(p);
                u = u*u*(3.0-2.0*u);
                float res = mix(
                    mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
                    mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
                return res*res;
            }

            // FBM for Clouds
            float fbm(vec2 x) {
                float v = 0.0;
                float a = 0.5;
                vec2 shift = vec2(100.0);
                mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
                for (int i = 0; i < 5; ++i) { // 5 Octaves for fluffiness
                    v += a * noise(x);
                    x = rot * x * 2.0 + shift;
                    a *= 0.5;
                }
                return v;
            }

            void main(void) {
                vec2 uv = vTextureCoord;
                vec4 texColor = texture2D(uSampler, uv);
                
                // Cloud Motion with subtle domain warping for fluffy volumetric edges
                vec2 cloudUV = uv * (2.8 * scale) + vec2(time * 0.018 * speed, time * 0.006 * speed);
                vec2 warp = vec2(fbm(cloudUV + vec2(time * 0.01)), fbm(cloudUV + vec2(1.2))) * 0.2;
                
                float n = fbm(cloudUV + warp);
                
                // Soft volumetric cloud density curves
                float cloudDensity = smoothstep(0.38, 0.72, n);
                float shadowRim = smoothstep(0.35, 0.45, n) * (1.0 - cloudDensity) * 0.3; // Volumetric rim shadow
                
                // SUPPRESSION
                float allowed = texture2D(uSuppressionMask, uv).r;
                
                // Final Alpha & Shaded Color
                float finalAlpha = cloudDensity * alpha * allowed;
                vec3 cloudShade = mix(color * 0.75, color, smoothstep(0.4, 0.8, n));
                cloudShade = mix(cloudShade, vec3(0.0), shadowRim);
                
                // Blend with scene
                vec3 finalColor = mix(texColor.rgb, cloudShade, finalAlpha);
                gl_FragColor = vec4(finalColor, texColor.a);
            }
        `;
        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.speed = speed;
        this.uniforms.scale = scale;
        this.uniforms.alpha = alpha;
        this.uniforms.color = color || [1.0, 1.0, 1.0];
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }
}

// Auto-init
Hooks.once("init", () => {
    WeatherFilterManager.init();
});
/**
 * Aurora Borealis Filter
 * Green/Blue curtain waves in the top 10-20% of the screen.
 */
/**
 * Aurora Borealis Filter
 * Green/Blue curtain waves in the top 10-20% of the screen.
 * Uses FBM Noise for organic "curtain" effect.
 */
export class AuroraFilter extends PIXI.Filter {
    constructor(speed = 0.5, intensity = 1.0) {
        const vertex = `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            varying vec2 vTextureCoord;
            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
        const fragment = `
            varying vec2 vTextureCoord;
            uniform sampler2D uSampler;
            uniform float time;
            uniform float speed;
            uniform float intensity;
            uniform sampler2D uSuppressionMask;
            
            // Hash function
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            // Noise texture
            float noise(vec2 p){
                vec2 ip = floor(p);
                vec2 u = fract(p);
                u = u*u*(3.0-2.0*u);
                float res = mix(
                    mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
                    mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
                return res*res;
            }

            // FBM for Clouds/Fog/Aurora
            float fbm(vec2 x) {
                float v = 0.0;
                float a = 0.5;
                // Rotate to reduce axial bias
                mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
                for (int i = 0; i < 3; ++i) { // 3 Octaves
                    v += a * noise(x);
                    x = rot * x * 2.0 + vec2(100.0);
                    a *= 0.5;
                }
                return v;
            }

            void main(void) {
                vec2 uv = vTextureCoord;
                vec4 color = texture2D(uSampler, uv);
                
                // --- 1. Top Screen Restriction ---
                // Fade out completely by 8% down (0.08) -> User requested 5%
                // Strongest at top (0.0)
                float heightMask = smoothstep(0.08, 0.0, uv.y); 
                
                if (heightMask > 0.001) {
                    
                    // --- 2. Aurora Waves (Curtains) ---
                    // We want vertical streaks that move horizontally.
                    
                    // Reduced speed significantly (0.5 -> 0.1)
                    float t = time * speed * 0.1;
                    
                    // Distort UVs to create "folding" curtain look
                    vec2 p = uv * vec2(3.0, 1.0); // Stretch X
                    
                    // Add wind/movement
                    p.x += t;
                    
                    // Secondary distortion based on Y to make pillars waver
                    p.x += sin(p.y * 5.0 - t * 2.0) * 0.2;

                    // Sample Noise
                    // We scale Y low so noise doesn't change much vertically -> Pillars
                    float n = fbm(p * vec2(1.0, 0.2));
                    
                    // Sharpen noise to get distinct rays
                    float ray = smoothstep(0.3, 0.8, n);
                    
                    // --- 3. Color Palette ---
                    // Primary: Electric Green
                    // Secondary: Teal/Blue/Purple
                    
                    // Mix color based on noise height or value
                    vec3 colGreen = vec3(0.1, 1.0, 0.4); // Bright Green
                    vec3 colTeal = vec3(0.0, 0.8, 0.9);
                    vec3 colPurple = vec3(0.6, 0.2, 1.0);
                    
                    // Gradient: Green at bottom (of the aurora band), Purple at top
                    // Mapping uv.y 0.0 -> 0.15 to a gradient 0->1
                    float gradPos = uv.y / 0.15; // 0 at top, 1 at bottom
                    
                    // Aurora logic: Usually green at bottom, red/purple at top.
                    // Let's mix based on 'ray' intensity too.
                    
                    vec3 auroraColor = mix(colPurple, colGreen, ray);
                    
                    // Add some variability
                    auroraColor = mix(auroraColor, colTeal, sin(uv.x * 5.0 + t) * 0.5 + 0.5);

                    // --- 4. Composite ---
                    // Bloom/Intensity
                    // SUPPRESSION
                    float allowed = texture2D(uSuppressionMask, uv).r;
                    
                    vec3 finalAurora = auroraColor * ray * heightMask * intensity * 1.5 * allowed;
                    
                    // Additive Blend
                    color.rgb += finalAurora;
                }
                
                gl_FragColor = color;
            }
        `;
        super(vertex, fragment);
        this.uniforms.time = 0;
        this.uniforms.speed = speed;
        this.uniforms.intensity = intensity;
        this.uniforms.uSuppressionMask = PIXI.Texture.WHITE;
    }
}
