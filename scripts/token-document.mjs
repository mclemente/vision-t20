import { convertUnits, detectionModeList } from "./utils.mjs";

export default (TokenDocument) => class extends TokenDocument {
    /** @override */
    prepareBaseData() {
        super.prepareBaseData();

        this._prepareSight();
    }

    /** @override */
    _prepareDetectionModes() {
        // V13: array of modes, V14: object of modes keyed by id
        const legacy = Array.isArray(this._source.detectionModes);
        const modes = [];

        if (this.sight.enabled) {
            for (const { id, enabled, range } of detectionModeList(this._source.detectionModes)) {
                if (!(id in CONFIG.Canvas.detectionModes)) {
                    continue;
                }

                modes.push({ id, enabled: enabled ?? true, range: range ?? Infinity });
            }

            const sceneUnits = this.parent?.grid.units || "";

            if (this.actor) {
                for (const [id, range] of Object.entries(this.actor.detectionModes)) {
                    if (!modes.find((mode) => mode.id === id)) {
                        modes.push({
                            id,
                            enabled: true,
                            range: convertUnits(range, "m", sceneUnits),
                        });
                    }
                }
            } else {
                if (!modes.find((mode) => mode.id === "lightPerception")) {
                    modes.push({ id: "lightPerception", enabled: true, range: Infinity });
                }
            }

            if (this.hasStatusEffect(CONFIG.specialStatusEffects.ETHEREAL)) {
                for (const mode of modes) {
                    mode.range = Math.min(mode.range, 18);
                }
            }
        }

        this.detectionModes = legacy
            ? modes
            : Object.fromEntries(modes.map(({ id, enabled, range }) => [id, { enabled, range }]));
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

        const modes = detectionModeList(this.detectionModes);
        let detectionMode = VISION_TO_DETECTION_MODE_MAPPING[this._source.sight.visionMode];

        if (detectionMode && (detectionMode = modes.find((mode) => mode.id === detectionMode && mode.enabled && mode.range > 0))) {
            this.sight.range = detectionMode.range;
            this.sight.visionMode = this._source.sight.visionMode;
            this.sight.detectionMode = detectionMode.id;
        } else {
            this.sight.range = 0;
            this.sight.visionMode = "basic";
            this.sight.detectionMode = "basicSight";

            for (const [visionMode, detectionMode] of Object.entries(VISION_TO_DETECTION_MODE_MAPPING)) {
                const mode = modes.find((mode) => mode.id === detectionMode);

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
