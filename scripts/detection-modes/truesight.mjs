import DetectionModeT20 from "./base.mjs";

/**
 * The detection mode for Truesight.
 */
export default class DetectionModeTruesight extends DetectionModeT20 {
    constructor() {
        super({
            id: "seeAll",
            label: "T20.SenseTruesight",
            type: DetectionModeT20.DETECTION_TYPES.SIGHT,
            sort: -5,
        });
    }

    /** @override */
    static getDetectionFilter(visionSource, object) {
        if (visionSource?.data.detectionMode === "seeAll"
            && !canvas.effects.testInsideDarkness(object.document.getCenterPoint())) {
            return;
        }

        return this._detectionFilter ??= CONFIG.Canvas.detectionModes.basicSight.constructor.getDetectionFilter();
    }

    /** @override */
    _canDetect(visionSource, target) {
        const source = visionSource.object;

        if (target instanceof foundry.canvas.placeables.Token && target.document.hasStatusEffect(CONFIG.specialStatusEffects.BURROWING)) {
            return false;
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

        const los = visionSource.getLOS(Infinity);

        if (los !== visionSource.los) {
            return los.contains(test.point.x, test.point.y);
        }

        return false;
    }
}
