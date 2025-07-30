import { convertUnits } from "./utils.mjs";

export default (TokenDocument) => class extends TokenDocument {
    /** @override */
    prepareBaseData() {
        super.prepareBaseData();

        this._prepareSight();

        // Sorting is necessary for patched CanvasVisibility#testVisibility
        this.detectionModes.sort((a, b) => {
            a = CONFIG.Canvas.detectionModes[a.id];
            b = CONFIG.Canvas.detectionModes[b.id];

            return (b.important ?? false) - (a.important ?? false)
                || (a.imprecise ?? false) - (b.imprecise ?? false)
                || (b.id === this.sight.detectionMode) - (a.id === this.sight.detectionMode)
                || (a.sort ?? 0) - (b.sort ?? 0);
        });
    }

    /** @override */
    _prepareDetectionModes() {
        this.detectionModes = [];

        if (!this.sight.enabled) {
            return;
        }

        for (const { id, enabled, range } of this._source.detectionModes) {
            if (!(id in CONFIG.Canvas.detectionModes)) {
                continue;
            }

            this.detectionModes.push({ id, enabled, range: range ?? Infinity });
        }

        const sceneUnits = this.parent?.grid.units || "";

        if (this.actor) {
            for (const [id, range] of Object.entries(this.actor.detectionModes)) {
                if (!this.detectionModes.find((mode) => mode.id === id)) {
                    this.detectionModes.push({
                        id,
                        enabled: true,
                        range: convertUnits(range, "m", sceneUnits),
                    });
                }
            }
        } else {
            if (!this.detectionModes.find((mode) => mode.id === "lightPerception")) {
                this.detectionModes.push({ id: "lightPerception", enabled: true, range: Infinity });
            }
        }

        if (this.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
            for (const mode of this.detectionModes) {
                mode.range = Math.min(mode.range, 18);
            }
        }
    }

    /** @protected */
    _prepareSight() {
        if (!this.sight.enabled) {
            this.sight.range = 0;
            this.sight.angle = 360;
            this.sight.visionMode = "darkvision";
            this.sight.detectionMode = "basicSight";
            this.sight.color = null;
            this.sight.attenuation = 0;
            this.sight.brightness = 0;
            this.sight.saturation = 0;
            this.sight.contrast = 0;

            return;
        }

        let detectionMode = VISION_TO_DETECTION_MODE_MAPPING[this._source.sight.visionMode];

        if (detectionMode && (detectionMode = this.detectionModes.find((mode) => mode.id === detectionMode && mode.enabled && mode.range > 0))) {
            this.sight.range = detectionMode.range;
            this.sight.visionMode = this._source.sight.visionMode;
            this.sight.detectionMode = detectionMode.id;
        } else {
            this.sight.range = 0;
            this.sight.visionMode = "basic";
            this.sight.detectionMode = "basicSight";

            for (const [visionMode, detectionMode] of Object.entries(VISION_TO_DETECTION_MODE_MAPPING)) {
                const mode = this.detectionModes.find((mode) => mode.id === detectionMode);

                if (!mode || !mode.enabled || this.sight.range >= mode.range) {
                    continue;
                }

                this.sight.range = mode.range;
                this.sight.visionMode = visionMode;
                this.sight.detectionMode = detectionMode;
            }
        }

        this.sight.angle = this._source.sight.angle;

        if (this.sight.visionMode === "basic") {
            this.sight.visionMode = "darkvision";
            this.sight.color = null;
            this.sight.attenuation = 0;
            this.sight.brightness = -1;
            if (game.settings.get("vision-t20", "blackWhiteDarkvision")) this.sight.saturation = -1;
            this.sight.contrast = 0;
        } else {
            const { color, attenuation, brightness, saturation, contrast } = CONFIG.Canvas.visionModes[this.sight.visionMode].vision.defaults;

            this.sight.color = color !== undefined ? color : this._source.sight.color !== null ? foundry.utils.Color.from(this._source.sight.color) : null;
            this.sight.attenuation = attenuation !== undefined ? attenuation : this._source.sight.attenuation;
            this.sight.brightness = brightness !== undefined ? brightness : 0;
            this.sight.saturation = saturation !== undefined ? saturation : 0;
            this.sight.contrast = contrast !== undefined ? contrast : 0;
        }
    }
};

const VISION_TO_DETECTION_MODE_MAPPING = {
    truesight: "seeAll",
    blindsight: "blindsight",
    devilsSight: "devilsSight",
    darkvision: "basicSight",
};
