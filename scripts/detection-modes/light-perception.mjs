import DetectionModeT20 from "./base.mjs";

/**
 * The detection mode for Light Perception.
 */
export default class DetectionModeLightPerceptionT20 extends DetectionModeT20 {
    constructor() {
        super({
            id: "lightPerception",
            label: "DETECTION.LightPerception",
            type: DetectionModeT20.DETECTION_TYPES.SIGHT,
            sort: -8,
        });
    }

    /** @override */
    static getDetectionFilter(visionSource, object) {
        if (visionSource?.visionMode.perceivesLight && canvas.effects.testInsideLight(object.document.getCenterPoint())) {
            return;
        }

        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.basicSight.constructor.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (target instanceof foundry.canvas.placeables.Token) {
            if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)) {
                return false;
            }
        }

        if (source.document.hasStatusEffect(CONFIG.specialStatusEffects.BLINDED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.DEFEATED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.PETRIFIED)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.SLEEPING)
            || source.document.hasStatusEffect(CONFIG.specialStatusEffects.UNCONSCIOUS)) {
            return false;
        }

        return true;
    }

    /** @override */
    _testPoint(visionSource, mode, target, test) {
        return super._testPoint(visionSource, mode, target, test)
            && (canvas.effects.testInsideLight(test.point)
                || target instanceof foundry.canvas.placeables.Token && target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURNING));
    }
}
