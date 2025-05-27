import ActorMixin from "./actor.mjs";
import TokenMixin from "./token.mjs";

import CombatTrackerMixin from "./combat-tracker.mjs";
import TokenConfigMixin from "./token-config.mjs";
import TokenDocumentMixin from "./token-document.mjs";
import TokenHUDMixin from "./token-hud.mjs";
import VisibilityGroupMixin from "./visibility.mjs";
import VisionSourceMixin from "./vision-source.mjs";

import DetectionModeBlindsight from "./detection-modes/blindsight.mjs";
import DetectionModeDarkvision from "./detection-modes/darkvision.mjs";
import DetectionModeDetectMagic from "./detection-modes/detect-magic.mjs";
import DetectionModeDevilsSight from "./detection-modes/devils-sight.mjs";
import DetectionModeEtherealSight from "./detection-modes/ethereral-sight.mjs";
import DetectionModeLightPerceptionT20 from "./detection-modes/light-perception.mjs";
import DetectionModeSeeInvisibility from "./detection-modes/see-invisibility.mjs";
import DetectionModeTruesight from "./detection-modes/truesight.mjs";
import VisionModeBlindsight from "./vision-modes/blindsight.mjs";
import VisionModeDarkvision from "./vision-modes/darkvision.mjs";
import VisionModeDevilsSight from "./vision-modes/devils-sight.mjs";
import VisionModeEtherealness from "./vision-modes/etherealness.mjs";
import VisionModeTruesight from "./vision-modes/truesight.mjs";

Hooks.once("init", () => {
    // Extend Actor, TokenDocument, Token, and TokenHUD
    CONFIG.Actor.documentClass = ActorMixin(CONFIG.Actor.documentClass);
    CONFIG.Token.documentClass = TokenDocumentMixin(CONFIG.Token.documentClass);
    CONFIG.Token.objectClass = TokenMixin(CONFIG.Token.objectClass);
    CONFIG.Token.hudClass = TokenHUDMixin(CONFIG.Token.hudClass);

    // Extend CanvasVisibility
    CONFIG.Canvas.groups.visibility.groupClass = VisibilityGroupMixin(CONFIG.Canvas.groups.visibility.groupClass);

    // Extend PointVisionSource
    CONFIG.Canvas.visionSourceClass = VisionSourceMixin(CONFIG.Canvas.visionSourceClass);

    // Extend CombatTracker
    CONFIG.ui.combat = CombatTrackerMixin(CONFIG.ui.combat);
});

Hooks.once("i18nInit", () => {
    // Register special status effects
    CONFIG.specialStatusEffects.BLEEDING = "bleeding";
    // CONFIG.specialStatusEffects.BLINDED = "blinded";
    CONFIG.specialStatusEffects.BURNING = "emchamas";
    CONFIG.specialStatusEffects.BURROWING = "burrowing";
    CONFIG.specialStatusEffects.DEAFENED = "surdo";
    CONFIG.specialStatusEffects.DEVILS_SIGHT = "devilsSight";
    CONFIG.specialStatusEffects.DISEASED = "diseased";
    CONFIG.specialStatusEffects.ECHOLOCATION = "echolocation";
    CONFIG.specialStatusEffects.ETHEREAL = "ethereal";
    CONFIG.specialStatusEffects.INCAPACITATED = "incapacitated";
    CONFIG.specialStatusEffects.FLYING = "flying";
    CONFIG.specialStatusEffects.HOVERING = "hovering";
    CONFIG.specialStatusEffects.MAGICAL = "magical";
    CONFIG.specialStatusEffects.MATERIAL = "material";
    CONFIG.specialStatusEffects.MIND_BLANK = "mindBlank";
    CONFIG.specialStatusEffects.NONDETECTION = "nondetection";
    CONFIG.specialStatusEffects.OBJECT = "object";
    CONFIG.specialStatusEffects.PETRIFIED = "petrificado";
    CONFIG.specialStatusEffects.POISONED = "envenenado";
    CONFIG.specialStatusEffects.POISONOUS = "poisonous";
    CONFIG.specialStatusEffects.REVENANCE = "revenance";
    CONFIG.specialStatusEffects.SLEEPING = "sleeping";
    CONFIG.specialStatusEffects.THINKING = "thinking";
    CONFIG.specialStatusEffects.UMBRAL_SIGHT = "umbralSight";
    CONFIG.specialStatusEffects.UNCONSCIOUS = "inconsciente";

    // Create aliases for core special status effects
    Object.defineProperties(CONFIG.specialStatusEffects, {
        BLIND: {
            get() {
                return this.BLINDED;
            },
            set(id) {
                this.BLINDED = id;
            },
            configurable: true,
            enumerable: false,
        },
        BURROW: {
            get() {
                return this.BURROWING;
            },
            set(id) {
                this.BURROWING = id;
            },
            configurable: true,
            enumerable: false,
        },
        FLY: {
            get() {
                return this.FLYING;
            },
            set(id) {
                this.FLYING = id;
            },
            configurable: true,
            enumerable: false,
        },
        HOVER: {
            get() {
                return this.HOVERING;
            },
            set(id) {
                this.HOVERING = id;
            },
            configurable: true,
            enumerable: false,
        },
    });

    // Register detection modes
    for (const detectionModeClass of [
        DetectionModeBlindsight,
        DetectionModeDarkvision,
        DetectionModeDetectMagic,
        DetectionModeDevilsSight,
        DetectionModeEtherealSight,
        DetectionModeLightPerceptionT20,
        DetectionModeSeeInvisibility,
        DetectionModeTruesight,
    ]) {
        const mode = new detectionModeClass();

        CONFIG.Canvas.detectionModes[mode.id] = mode;
    }

    // Remove core detection modes that do not exist in D&D 5e
    delete CONFIG.Canvas.detectionModes.senseAll;
    delete CONFIG.Canvas.detectionModes.senseInvisibility;

    // Register vision modes
    for (const visionModeClass of [
        VisionModeBlindsight,
        VisionModeDarkvision,
        VisionModeDevilsSight,
        VisionModeEtherealness,
        VisionModeTruesight,
    ]) {
        const mode = new visionModeClass();

        CONFIG.Canvas.visionModes[mode.id] = mode;
    }

    // Hide the basic vision mode
    CONFIG.Canvas.visionModes.basic?.updateSource({ tokenConfig: false });

    // Remove core vision modes that are not D&D 5e senses
    delete CONFIG.Canvas.visionModes.lightAmplification;
    delete CONFIG.Canvas.visionModes.monochromatic;

    // Tremorsense is not supported as vision mode, because it is an imprecise sense and
    // we currently cannot prevent FOV from exploring the fog
    delete CONFIG.Canvas.visionModes.tremorsense;
});

Hooks.once("ready", () => {
    // Extend TokenConfig
    for (const config of Object.values(CONFIG.Token.sheetClasses.base)) {
        config.cls = TokenConfigMixin(config.cls);
    }

    CONFIG.Token.prototypeSheetClass = TokenConfigMixin(CONFIG.Token.prototypeSheetClass);
});

Hooks.on("renderAmbientLightConfig", (application, element, context, options) => {
    if (!options.parts.includes("basic")) {
        return;
    }

    element.querySelector(`[name="config.negative"]`).closest(".form-group").insertAdjacentHTML(
        "beforeend",
        `<p class="hint">${game.i18n.localize("VISION5E.HINTS.DarknessSource")}</p>`,
    );
});
