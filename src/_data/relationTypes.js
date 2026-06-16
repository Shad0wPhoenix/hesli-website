/**
 * relationTypes.js
 *
 * Central definitions for known relation types.
 * These act as defaults — any value can be overridden per-article in
 * front matter without touching this file.
 *
 * ─── Shorthand form ───────────────────────────────────────────────────────────
 *
 *   knows: "Knows"
 *
 *   A plain string sets the forward label only.
 *   The inverse key mirrors the relation type, the inverse label mirrors
 *   the forward label, and no pluralisation is applied.
 *   Use for symmetric relations where both sides share the same heading.
 *
 * ─── Full form ────────────────────────────────────────────────────────────────
 *
 *   region: {
 *     label:              "Located in",
 *     labelPlural:        "Located in",       // usually same for forward
 *     inverse:            "settlements",
 *     inverseLabel:       "Settlement",
 *     inverseLabelPlural: "Settlements",
 *   }
 *
 *   label              — heading when this article lists its own relations
 *   labelPlural        — heading when there are multiple (falls back to label)
 *   inverse            — the bucket key used on the target article's backlinks
 *   inverseLabel       — heading on the target's backlinks when count === 1
 *   inverseLabelPlural — heading on the target's backlinks when count  >  1
 *
 * ─── Front-matter override ────────────────────────────────────────────────────
 *
 *   Any field defined here can be overridden in front matter at either
 *   group level or per-target level. Only the fields you provide are
 *   overridden; everything else continues to come from this file.
 *
 *   relations:
 *     region:
 *       targets:
 *         - id: region-of-frisia
 *           inverseLabel: "Birthplace of"    # overrides inverseLabelPlural too
 *
 * ─── Adding new types ─────────────────────────────────────────────────────────
 *
 *   Any relation type used in front matter that is NOT listed here will
 *   still work — it falls back to a auto-generated label from the key name.
 *   Add an entry here whenever you want a polished label or asymmetric
 *   inverse without repeating yourself in every article.
 */

export default {

    // ── Geography ─────────────────────────────────────────────────────────────

    region: {
        label:              "Located in",
        inverse:            "subregion",
        inverseLabel:       "Subregion",
        inverseLabelPlural: "Subregions",
    },

    landmark: {
        label:              "Notable landmark",
        labelPlural:        "Notable landmarks",
        inverse:            "foundIn",
        inverseLabel:       "Found in",
    },

    borders: {
        label:              "Borders",
        inverse:            "borders",
        inverseLabel:       "Borders",
    },
 
    // Article type — used when type: settlement is set on an article
    settlement: {
        label:              "Located in",
        inverse:            "settlements",
        inverseLabel:       "Settlement",
        inverseLabelPlural: "Settlements",
    },
 
    // Article type — used when type: building is set on an article
    building: {
        label:              "Contains building",
        labelPlural:        "Contains buildings",
        inverse:            "buildings",
        inverseLabel:       "Building",
        inverseLabelPlural: "Buildings",
    },
 
    // Article type — used when type: subregion is set on an article
    // subregion: {
    //     label:              "Contains subregion",
    //     labelPlural:        "Contains subregions",
    //     inverse:            "subregions",
    //     inverseLabel:       "Subregion",
    //     inverseLabelPlural: "Subregions",
    // },

    // ── Society & culture ─────────────────────────────────────────────────────

    traditions: {
        label:              "Related tradition",
        labelPlural:        "Related traditions",
        inverse:            "practicedBy",
        inverseLabel:       "Practiced by",
        inverseLabelPlural: "Practiced by",
    },

    religion: {
        label:              "Follows religion",
        inverse:            "followers",
        inverseLabel:       "Follower",
        inverseLabelPlural: "Followers",
    },

    ruledBy: {
        label:              "Ruled by",
        inverse:            "rules",
        inverseLabel:       "Rules",
    },

    // ── Trade & economy ───────────────────────────────────────────────────────

    tradePartners: {
        label:              "Trade partner",
        labelPlural:        "Trade partners",
        inverse:            "tradePartners",
        inverseLabel:       "Trade partner",
        inverseLabelPlural: "Trade partners",
    },

    famousFor: {
        label:              "Famous for",
        inverse:            "famousIn",
        inverseLabel:       "Famous in",
    },

    // ── People ────────────────────────────────────────────────────────────────

    relationship: {
        label:              "Related person",
        labelPlural:        "Related people",
        inverse:            "relationship",
        inverseLabel:       "Related person",
        inverseLabelPlural: "Related people",
    },

    knows: {
        label:              "Knows",
        inverse:            "knows",
        inverseLabel:       "Knows",
    },

    memberOf: {
        label:              "Member of",
        inverse:            "members",
        inverseLabel:       "Member",
        inverseLabelPlural: "Members",
    },

    owner: {
        label:              "Owned by",
        inverse:            "owns",
        inverseLabel:       "Owns",
    },

    ethnicity: {
        label:              "Parent Ethnicity",
        labelPlural:        "Parent Ethnicities",
        inverse:            "subethnicity",
        inverseLabel:       "Subethnicity",
        inverseLabelPlural: "Subethnicities",

        // Edge-specific overrides — keyed by the TARGET's type
        byTargetType: {
            species: {
                inverse:            "ethnicity-specie",
                inverseLabel:       "Ethnicity",
                inverseLabelPlural: "Ethnicities",
            },

            region: {
                label:              "Found in",
                labelPlural:        "Found in",
                inverse:            "ethnicGroups",
                inverseLabel:       "Ethnic group present",
                inverseLabelPlural: "Ethnic groups present",
            },

            settlement: {
                label:              "Found in",
                labelPlural:        "Found in",
                inverse:            "ethnicGroups",
                inverseLabel:       "Ethnic group present",
                inverseLabelPlural: "Ethnic groups present",
            }
        },
    },

    // ── Conflict ──────────────────────────────────────────────────────────────

    enemies: {
        label:              "Enemy",
        labelPlural:        "Enemies",
        inverse:            "enemies",
        inverseLabel:       "Enemy",
        inverseLabelPlural: "Enemies",
    },

    allies: {
        label:              "Ally",
        labelPlural:        "Allies",
        inverse:            "allies",
        inverseLabel:       "Ally",
        inverseLabelPlural: "Allies",
    },

};