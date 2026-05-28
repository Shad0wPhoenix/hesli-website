// export default function buildRelationGraph(contentGraph) {
//     for (const node of contentGraph.nodes.values()) {
//         const relations = node.page?.data?.relations;

//         if (!relations) continue;

//         for (const [relationType, relationTargets] of Object.entries(relations)) {

//             node.relations[relationType] = [];

//             for (const targetId of relationTargets) {
//                 const targetNode = contentGraph.nodesById.get(targetId);

//                 if (!targetNode) {
//                     console.warn(
//                         `[Relations] "${targetId}" not found (source: "${node.id}")`
//                     );
//                     continue;
//                 }

//                 // Forward relation
//                 node.relations[relationType].push(targetNode);

//                 // Backlink
//                 if (!targetNode.backlinks[relationType]) {
//                     targetNode.backlinks[relationType] = [];
//                 }

//                 targetNode.backlinks[relationType].push(node);
//             }
//         }
//     }

//     return contentGraph;
// }

export default function buildRelationGraph(contentGraph, definitions = {}) {
    const edgeRegistry = new Map();

    for (const node of contentGraph.flat) {
        const rawRelations = node.page?.data?.relations;
        if (!rawRelations) continue;

        for (const [relationType, relationValues] of Object.entries(rawRelations)) {
            const relation = normaliseRelation(relationType, relationValues, definitions);

            ensureBucket(node.relations, relationType, relation.label, relation.labelPlural);

            for (const target of relation.targets) {
                const targetNode = resolveOrCreateStub(contentGraph, target.id);
                const edgeKey = canonicalEdgeKey(node.id, targetNode.id, relationType);

                if (edgeRegistry.has(edgeKey)) {
                    const edge      = edgeRegistry.get(edgeKey);
                    const isSource  = edge.source.id === node.id;

                    const ownLink   = isSource ? edge.forwardLink : edge.inverseLink;
                    const otherLink = isSource ? edge.inverseLink : edge.forwardLink;

                    ownLink.label           ??= target.label;
                    ownLink.sentiment       ??= target.sentiment;
                    ownLink.description     ??= target.description;

                    otherLink.label         ??= target.inverseLabel;
                    otherLink.description   ??= target.inverseDescription;

                    continue;
                }

                const forwardLink = {
                    node:           targetNode,
                    label:          target.label                ?? null,
                    sentiment:      target.sentiment            ?? null,
                    description:    target.description          ?? null,
                };

                const inverseLink = {
                    node:           node,
                    label:          target.inverseLabel         ?? null,
                    sentiment:      target.sentiment            ?? null,
                    description:    target.inverseDescription   ?? null,
                };

                edgeRegistry.set(edgeKey, {
                    source: node,
                    target: targetNode,
                    forwardLink,
                    inverseLink,
                });

                node.relations[relationType].nodes.push(forwardLink);

                const inverseLabel          = target.inverseLabel       ?? relation.inverseLabel;
                const inverseLabelPlural    = target.inverseLabelPlural ?? relation.inverseLabelPlural;

                ensureBucket(
                    targetNode.backlinks,
                    relation.inverse,
                    inverseLabel,
                    inverseLabelPlural,
                );
                targetNode.backlinks[relation.inverse].nodes.push(inverseLink);
            }
        }
    }

    return contentGraph;
}

function toLabel(key) {
    return String(key)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_]/g, " ")
        .replace(/^\w/, c=> c.toUpperCase());
}

function canonicalEdgeKey(idA, idB, relationType) {
    return [...[idA, idB].sort(), relationType].join("::");
}

function normaliseDefinition(relationType, definition) {
    if (!definition) return null;

    if (typeof definition === "string") {
        return {
            label:              definition,
            labelPlural:        definition,
            inverse:            relationType,
            inverseLabel:       definition,
            inverseLabelPlural: definition,
        };
    }

    const label =           definition.label        ?? toLabel(relationType);
    const inverse =         definition.inverse      ?? relationType;
    const inverseLabel =    definition.inverseLabel ?? toLabel(inverse);

    return {
        label,
        labelPlural:        definition.labelPlural  ?? label,
        inverse,
        inverseLabel:       inverseLabel,
        inverseLabelPlural: definition.inverseLabelPlural   ?? inverseLabel,
    }
}

function normaliseTarget(t) {
    if (typeof t === "string") {
        return {
            id:                     t,
            label:                  null,
            inverseLabel:           null,
            sentiment:              null,
            description:            null,
            inverseDescription:     null,
        };
    }

    return {
        id:                 t.id,
        label:              t.label                 ?? null,
        inverseLabel:       t.inverseLabel          ?? null,
        sentiment:          t.sentiment             ?? null,
        description:        t.description           ?? null,
        inverseDescription: t.inverseDescription    ?? null,
    };
}

// function normaliseRelation(relationType, value) {
//     const defaults = {
//         label:          toLabel(relationType),
//         inverse:        relationType,
//         inverseLabel:   toLabel(relationType),
//     };

//     if (Array.isArray(value)) {
//         return {
//             ...defaults,
//             targets: value.map(normaliseTarget),
//         };
//     }

//     return {
//         label:          value.label         ?? defaults.label,
//         inverse:        value.inverse       ?? defaults.inverse,
//         inverseLabel:   value.inverseLabel  ?? defaults.inverseLabel,
//         targets:        (value.targets ?? []).map(normaliseTarget),
//     }
// }

function normaliseRelation(relationType, value, definitions) {
    const definition = normaliseDefinition(relationType, definitions?.[relationType]);

    const fallbackLabel =               definition?.label               ?? toLabel(relationType);
const fallbackLabelPlural =             definition?.labelPlural         ?? fallbackLabel;
    const fallbackInverse =             definition?.inverse             ?? relationType;
    const fallbackInverseLabel =        definition?.inverseLabel        ?? toLabel(fallbackInverse);
    const fallbackInverseLabelPlural =  definition?.inverseLabelPlural  ?? fallbackInverseLabel;

    if (Array.isArray(value)) {
        return {
            label:              fallbackLabel,
            labelPlural:        fallbackLabelPlural,
            inverse:            fallbackInverse,
            inverseLabel:       fallbackInverseLabel,
            inverseLabelPlural: fallbackInverseLabelPlural,
            targets:            value.map(normaliseTarget),
        };
    }

    return {
        label:              value.label                 ?? fallbackLabel,
        labelPlural:        value.labelPlural           ?? fallbackLabelPlural,
        inverse:            value.inverse               ?? fallbackInverse,
        inverseLabel:       value.inverseLabel          ?? fallbackInverseLabel,
        inverseLabelPlural: value.inverseLabelPlural    ?? fallbackInverseLabelPlural,
        targets:            (value.targets ?? []).map(normaliseTarget),
    };
}

function ensureBucket(collection, key, label, labelPlural) {
    if (!collection[key]) {
        collection[key] = { 
            label, 
            labelPlural: labelPlural ?? label,
            nodes: [],
        };
    }
}

function resolveOrCreateStub(contentGraph, targetId) {
    const existing = contentGraph.nodesById.get(targetId);
    if (existing) return existing;

    const stub = {
        id: targetId,
        name: toLabel(targetId),
        url: null,
        page: null,
        relations: {},
        backlinks: {},
    };

    contentGraph.nodesById.set(targetId, stub);
    contentGraph.stubs.push(stub);

    console.info(`[RelationGraph] Stub created for "${toLabel(targetId)}"`);

    return stub;
}

