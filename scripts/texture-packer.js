/**
 * Runtime Texture Packer for Phil's Day/Night Cycle
 * packs multiple PIXI.Textures into a single Render Texture (Atlas)
 * to enable efficient batch rendering via PIXI.ParticleContainer.
 */
export class RuntimeTexturePacker {
    /**
     * Packs an array of textures into a single texture.
     * @param {PIXI.Texture[]} textures - Array of textures to pack
     * @param {number} padding - Padding between textures
     * @returns {Promise<{texture: PIXI.Texture, uvs: Object<string, PIXI.Rectangle>}>}
     */
    static async pack(textures, padding = 2) {
        if (!textures || textures.length === 0) return null;

        // 1. Wait for all base textures to load
        await Promise.all(textures.map(t => {
            if (t.baseTexture.valid) return Promise.resolve();
            return new Promise(resolve => {
                t.baseTexture.once('loaded', resolve);
                t.baseTexture.once('error', resolve); // Continue even if error
            });
        }));

        // 2. Filter valid textures and calculate dimensions
        const validTextures = textures.filter(t => t.valid && t.width > 0 && t.height > 0);
        if (validTextures.length === 0) return null;

        // Simple Packing Algorithm (Row-based)
        // Sort by height desc for better fit
        validTextures.sort((a, b) => b.height - a.height);

        let maxWidth = 0;
        let totalArea = 0;
        
        validTextures.forEach(t => {
            maxWidth = Math.max(maxWidth, t.width);
            totalArea += (t.width + padding) * (t.height + padding);
        });

        // Esteimate Atlas Size (Power of 2 preferred but not strictly required for WebGL2 usually, lets stick to POT for safety)
        const sizeEst = Math.sqrt(totalArea) * 1.25; // Add 25% buffer to avoid tight packing overflow
        let atlasW = this.nextPow2(sizeEst);
        let atlasH = this.nextPow2(sizeEst);
        
        // Ensure at least max width/height of single texture
        validTextures.forEach(t => {
            if(t.width > atlasW) atlasW = this.nextPow2(t.width);
            if(t.height > atlasH) atlasH = this.nextPow2(t.height);
        });

        // Max limit (Allow 8192 for modern GPUs, fallback logic handles failure)
        const MAX_SIZE = 8192;
        atlasW = Math.min(atlasW, MAX_SIZE);
        atlasH = Math.min(atlasH, MAX_SIZE);

        // PDNC | Packing ${validTextures.length} textures. Est Size: ${atlasW}x${atlasH}
        // Debug: Log largest texture to see if we have huge files
        if (validTextures.length > 0) {
            // PDNC | Largest Texture: ${validTextures[0].width}x${validTextures[0].height}
        }

        // 3. Layout Pass
        const frames = new Map(); // Map Texture -> Frame (Rectangle)
        let currentX = 0;
        let currentY = 0;
        let rowH = 0;

        let overflow = false;

        for (const tex of validTextures) {
            if (currentX + tex.width > atlasW) {
                currentX = 0;
                currentY += rowH + padding;
                rowH = 0;
            }
            
            // Check overflow
            if (currentY + tex.height > atlasH) {
                console.warn(`PDNC | Texture Atlas Overflow! Texture ${tex.width}x${tex.height} does not fit in ${atlasW}x${atlasH}`);
                overflow = true;
                break;
            }

            const frame = new PIXI.Rectangle(currentX, currentY, tex.width, tex.height);
            frames.set(tex, frame); 

            currentX += tex.width + padding;
            rowH = Math.max(rowH, tex.height);
        }

        if (overflow) {
            console.warn("PDNC | Aborting Texture Packing due to size constraints. Falling back to standard rendering.");
            return null;
        }

        // 4. Render Pass
        // Create RenderTexture
        const renderTexture = PIXI.RenderTexture.create({ width: atlasW, height: atlasH });
        const sprite = new PIXI.Sprite();
        
        // We need to render each texture onto the renderTexture
        // We can use canvas.app.renderer.render
        const renderer = canvas.app.renderer;
        
        renderer.render(new PIXI.Container(), renderTexture, true); // Clear

        for (const [tex, frame] of frames) {
            sprite.texture = tex;
            sprite.x = frame.x;
            sprite.y = frame.y;
            renderer.render(sprite, renderTexture, false); // clear = false to accumulate
        }

        return {
            texture: renderTexture,
            frames: frames
        };
    }

    static nextPow2(v) {
        v--;
        v |= v >> 1;
        v |= v >> 2;
        v |= v >> 4;
        v |= v >> 8;
        v |= v >> 16;
        v++;
        return v;
    }
}
