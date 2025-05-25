import DetectionModeT20 from "./base.mjs";

/**
 * The detection mode for Darkvision.
 */
export default class DetectionModeDarkvision extends DetectionModeT20 {
    constructor() {
        super({
            id: "basicSight",
            label: "T20.SenseDarkVision",
            type: DetectionModeT20.DETECTION_TYPES.SIGHT,
            sort: -7,
        });
    }

    /** @override */
    static getDetectionFilter(visionSource, object) {
        if (visionSource?.data.detectionMode === "basicSight"
            && !(visionSource.object.document.hasStatusEffect(CONFIG.specialStatusEffects.DEVILS_SIGHT)
                && canvas.effects.testInsideDarkness(object.document.getCenterPoint()))) {
            return;
        }

        return this._detectionFilter ??= foundry.canvas.rendering.filters.OutlineOverlayFilter.create({
            outlineColor: [1, 1, 1, 1],
            knockout: true,
        });
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (target instanceof foundry.canvas.placeables.Token) {
            if (target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !source.document.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)
                && !target.document.hasStatusEffect(CONFIG.specialStatusEffects.MATERIAL)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE)
                || target.document.hasStatusEffect(CONFIG.specialStatusEffects.UMBRAL_SIGHT)) {
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
    _testLOS(visionSource, mode, target, test) {
        if (super._testLOS(visionSource, mode, target, test)) {
            return true;
        }

        if (visionSource.object.document.hasStatusEffect(CONFIG.specialStatusEffects.DEVILS_SIGHT)) {
            const los = visionSource.getLOS(100);

            if (los !== visionSource.los) {
                return los.contains(test.point.x, test.point.y);
            }
        }

        return false;
    }
}
