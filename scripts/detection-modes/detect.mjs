import DetectionModeT20 from "./base.mjs";

/**
 * Base class for Detect Evil and Good / Magic / Poison and Disease / Thoughts.
 * @abstract
 */
export default class DetectionModeDetect extends DetectionModeT20 {
    constructor(data = {}) {
        super(foundry.utils.mergeObject({
            type: DetectionModeT20.DETECTION_TYPES.OTHER,
            angle: false,
            important: true,
            imprecise: true,
        }, data));
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (!(target instanceof foundry.canvas.placeables.Token)
            || !target.actor
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
            && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.MIND_BLANK)
            || target.document.hasStatusEffect(CONFIG.specialStatusEffects.NONDETECTION)) {
            return false;
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEPING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        return true;
    }

    /** @override */
    _testLOS(visionSource, mode, target, test) {
        return !CONFIG.Canvas.polygonBackends.sight.testCollision(
            visionSource.origin,
            test.point,
            {
                type: "sight",
                mode: "any",
                source: visionSource,
                useThreshold: true,
                priority: Infinity,
            },
        );
    }
}
