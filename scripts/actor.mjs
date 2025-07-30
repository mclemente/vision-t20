import { Matcher, convertUnits } from "./utils.mjs";

export default (Actor) => class extends Actor {
    /**  @type {Record<string, number>} */
    detectionModes = this.detectionModes;

    /** @override */
    prepareData() {
        const detectionModes = this.detectionModes;

        super.prepareData();

        if (!detectionModes) {
            return;
        }

        for (const token of this.getDependentTokens()) {
            if (!token.sight.enabled) {
                continue;
            }

            token.prepareData();

            if (token.rendered && token.object.vision) {
                token.object.initializeVisionSource();
            }
        }
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();

        const itemPile = game.itempiles?.API.getActorFlagData(this);

        if (itemPile && itemPile.enabled && (itemPile.type === game.itempiles.pile_types.PILE
            || itemPile.type === game.itempiles.pile_types.CONTAINER
            || itemPile.type === game.itempiles.pile_types.VAULT)) {
            this.statuses.add(CONFIG.specialStatusEffects.OBJECT);
            this.statuses.add(CONFIG.specialStatusEffects.INAUDIBLE);
        }

        if (hasMagicalAura(this)) {
            this.statuses.add(CONFIG.specialStatusEffects.MAGICAL);
        }

        if (isPoisonous(this)) {
            this.statuses.add(CONFIG.specialStatusEffects.POISONOUS);
        }

        if (this.type === "vehicle") {
            this.statuses.add(CONFIG.specialStatusEffects.OBJECT);
        }

        if (CONFIG.specialStatusEffects.SHAPECHANGER
            && /(?<=^|[\s,;])(?:Shapechanger|Gestaltwandler|Métamorphe|Cambiaformas|Metamorfo)(?=$|[\s,;])/i.test(this.system.details?.type?.subtype ?? "")) {
            this.statuses.add(CONFIG.specialStatusEffects.SHAPECHANGER);
        }

        this.detectionModes = { lightPerception: Infinity };

        const senses = this.system.attributes?.sentidos?.value;

        if (senses) {
            this.detectionModes.basicSight = senses.has("escuro") ? 9 : 0;
            // this.detectionModes.seeAll = senses.truesight;
            this.detectionModes.blindsight = senses.has("cegas") ? 9 : 0;
        }

        const featRegistry = FEAT_REGISTRY[this.type];

        if (featRegistry) {
            const featMatcher = FEAT_MATCHERS[this.type];

            for (const item of this.items) {
                if (item.type !== "poder") {
                    continue;
                }

                const id = featMatcher.match(item.name);

                if (id) {
                    featRegistry[id].call(this, item);
                }
            }
        }

        const effectRegistry = EFFECT_REGISTRY[this.type];

        if (effectRegistry) {
            const effectMatcher = EFFECT_MATCHERS[this.type];

            for (const effect of this.appliedEffects) {
                const id = effectMatcher.match(effect.name);

                if (id) {
                    effectRegistry[id].call(this, effect);
                }
            }
        }

        for (const id in this.detectionModes) {
            if (this.detectionModes[id] === 0) {
                delete this.detectionModes[id];
            }
        }
    }
};

/**
 * @param {Actor} actor
 * @param {string} id
 * @param {number | undefined} range
 * @param {string} [units]
 */
function upgradeDetectionMode(actor, id, range, units) {
    if (range === undefined || range <= 0) {
        return;
    }

    const currentRange = actor.detectionModes[id];

    if (units !== undefined) {
        range = convertUnits(range, units, "m");
    }

    if (currentRange !== undefined) {
        range = Math.max(range, currentRange);
    }

    actor.detectionModes[id] = range;
}

/** @type {Set<string>} */
const MAGIC_ITEM_TYPES = new Set([
    "consumable",
    "container",
    "dnd-tashas-cauldron.tattoo",
    "equipment",
    "loot",
    "weapon",
    "tool",
]);

/**
 * @param {Item} item
 * @returns {boolean}
 */
function isMagicItem(item) {
    return MAGIC_ITEM_TYPES.has(item.type) && item.system.validProperties.has("mgc") && item.system.properties.has("mgc");
}

/**
 * @param {Item} item
 * @returns {boolean}
 */
function isVisibleMagicItem(item) {
    return isMagicItem(item) && (item.system.equipped === true || !item.container);
}

/**
 * @param {ActiveEffect} effect
 * @returns {boolean}
 */
function isMagicEffect(effect) {
    return effect.flags.dnd5e?.spellLevel !== undefined && !effect.statuses.has(CONFIG.specialStatusEffects.CONCENTRATING);
}

/**
 * @param {Actor} actor
 * @returns {boolean}
 */
function hasMagicalAura(actor) {
    // Does the actor carry a visible magical item or is the actor affected by a spell effect?
    return actor.items.some(isVisibleMagicItem) || actor.appliedEffects.some(isMagicEffect);
}

/**
 * @param {DamageData} damage
 * @returns {boolean}
 */
function isPoisonDamage(damage) {
    return damage.types.has("poison") || damage.custom.enabled && /\[\s*poison\s*\]/i.test(damage.custom.formula);
}

/**
 * @param {Activity} activity
 * @returns {boolean}
 */
function isPoisonousAttack(activity) {
    return activity.type === "attack" && (activity.damage.parts.some(isPoisonDamage)
        || /\[\s*poison\s*\]/i.test(activity.damage.critical));
}

/**
 * @param {Item} item
 * @returns {boolean}
 */
function isPoisonousNaturalWeapon(item) {
    return item.type === "weapon" && item.system.type.value === "natural"
        && (isPoisonDamage(item.system.damage.base)
            || item.system.properties.has("ver") && isPoisonDamage(item.system.damage.versatile)
            || item.system.activities.some(isPoisonousAttack));
}

/**
 * A poisonous creature is a creature that has a poisonous natural weapon attack.
 * @param {Actor} actor
 * @returns {boolean}
 */
function isPoisonous(actor) {
    if (actor.statuses.has(CONFIG.specialStatusEffects.OBJECT)
        || actor.statuses.has(CONFIG.specialStatusEffects.PETRIFIED)) {
        return false;
    }

    return actor.items.some(isPoisonousNaturalWeapon);
}

/**
 * @template T
 * @typedef {{ character: Record<string, Function>, npc: Record<string, Function> }} Registry
 */

/** @type {Registry<Item>} */
const FEAT_REGISTRY = {
    character: {
        devilsSight(item) {
            upgradeDetectionMode(this, "devilsSight", Infinity, "m");
        },
    },
    npc: {
        devilsSight(item) {
            this.statuses.add(CONFIG.specialStatusEffects.DEVILS_SIGHT);
        },
    },
};

/** @type {Registry<ActiveEffect>} */
const EFFECT_REGISTRY = {
    character: {
        detectMagic(effect) {
            upgradeDetectionMode(this, "detectMagic", 30, "m");
        },
        formaEterea(effect) {
            upgradeDetectionMode(this, "etherealness", 18, "m");
        },
        visaoDaVerdade(effect) {
            upgradeDetectionMode(this, "seeAll", Infinity, "m");
        },
    },
    npc: {
        detectMagic(effect) {
            upgradeDetectionMode(this, "detectMagic", 30, "m");
        },
        formaEterea(effect) {
            upgradeDetectionMode(this, "etherealness", 18, "m");
        },
        visaoDaVerdade(effect) {
            upgradeDetectionMode(this, "seeAll", Infinity, "m");
        },
    },
};

/** @type {Record<"en" | "pt-BR", Record<string, (string | (string | string[])[])[]>>} */
const DATABASE = {
    "pt-BR": {
        devilsSight: ["Visão nas Trevas"],
        detectMagic: ["Visão Mística"],
        formaEterea: ["Forma Etérea"],
        visaoDaVerdade: ["Visão da Verdade"],
    },
};

/**
 * @param {Registry<*>} registry
 * @returns {{ character: Matcher, npc: Matcher }}
 */
function createMatchers(registry) {
    const database = Object.values(DATABASE).reduce((object, current) => {
        for (const key in current) {
            object[key] = (object[key] ?? []).concat(current[key]);
        }

        return object;
    });

    return Object.fromEntries(
        Object.entries(registry).map(([type, methods]) => [
            type,
            new Matcher(Object.keys(methods).reduce((object, name) => {
                object[name] = database[name];

                return object;
            }, {})),
        ]),
    );
}

/** @type {{ character: Matcher, npc: Matcher }} */
let FEAT_MATCHERS = createMatchers(FEAT_REGISTRY);

/** @type {{ character: Matcher, npc: Matcher }} */
let EFFECT_MATCHERS = createMatchers(EFFECT_REGISTRY);
