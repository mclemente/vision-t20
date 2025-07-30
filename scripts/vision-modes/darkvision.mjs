/**
 * The vision mode for Darkvision.
 */
export default class VisionModeDarkvision extends foundry.canvas.perception.VisionMode {
    constructor() {
        const defaults = { contrast: 0, brightness: 0.1 };

        if (game.settings.get("vision-t20", "blackWhiteDarkvision")) {
            defaults.saturation = -1;
        }

        super({
            id: "darkvision",
            label: "T20.SenseDarkVision",
            canvas: {
                shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: 0 },
            },
            lighting: {
                background: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.REQUIRED },
            },
            vision: {
                darkness: { adaptive: false },
                defaults,
            },
        });
    }
}
