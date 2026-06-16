export default function buildRelationGraph(contentGraph, definitions = {}) {
    const edgeRegistry = new Map();

    for (const node of contentGraph.flat) {
        const rawRelations = node.page?.data?.relations;
        if (!rawRelations) continue;

        for (const [relationType, relationValues] of Object.entries(rawRelations)) {
            const relation = normaliseRelation(relationType, relationValues, definitions, node);

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

                const type = resolveTypeDefinition(target, relation, node, targetNode, definitions);

                const inverseKey            = type?.inverse             ??
                                              relation.inverse;
                const inverseLabel          = target.inverseLabel       ??
                                              type?.inverseLabel        ??
                                              relation.inverseLabel;
                const inverseLabelPlural    = target.inverseLabelPlural ??
                                              type?.inverseLabelPlural  ??
                                              relation.inverseLabelPlural;

                ensureBucket(
                    targetNode.backlinks,
                    inverseKey,
                    inverseLabel,
                    inverseLabelPlural,
                );
                targetNode.backlinks[inverseKey].nodes.push(inverseLink);
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
            type:                   null,
            label:                  null,
            inverseLabel:           null,
            sentiment:              null,
            description:            null,
            inverseDescription:     null,
        };
    }

    return {
        id:                 t.id,
        type:               t.type                  ?? null,
        label:              t.label                 ?? null,
        inverseLabel:       t.inverseLabel          ?? null,
        sentiment:          t.sentiment             ?? null,
        description:        t.description           ?? null,
        inverseDescription: t.inverseDescription    ?? null,
    };
}

function normaliseRelation(rawRelationType, value, definitions, sourceNode) {
    const relationType = toLabel(rawRelationType);
    const definition = normaliseDefinition(rawRelationType, definitions?.[rawRelationType]);

    const groupType = (value && typeof value === "object" && !Array.isArray(value)) ? value.type : null;
    const sourceType = normaliseTypeKey(groupType ?? sourceNode?.page?.data?.type ?? null);

    const edgeOverride = sourceType
        ? definitions?.[sourceType]?.byTargetType?.[relationType]
        : null;

    const fallbackLabel =               edgeOverride?.label               ?? relationType;
const fallbackLabelPlural =             edgeOverride?.labelPlural         ?? fallbackLabel;
    const fallbackInverse =             definition?.inverse             ?? relationType;
    const fallbackInverseLabel =        definition?.inverseLabel        ?? relationType;
    const fallbackInverseLabelPlural =  definition?.inverseLabelPlural  ?? fallbackInverseLabel;

    const defaults = {
        label:              fallbackLabel,
        labelPlural:        fallbackLabelPlural,
        inverse:            fallbackInverse,
        inverseLabel:       fallbackInverseLabel,
        inverseLabelPlural: fallbackInverseLabelPlural,
    };

    if (typeof value === "string") return { ...defaults, type: null, targets: [normaliseTarget(value)] };

    if (Array.isArray(value)) return { ...defaults, type: null, targets: value.map(normaliseTarget) };

    return {
        label:              value.label                 ?? fallbackLabel,
        labelPlural:        value.labelPlural           ?? fallbackLabelPlural,
        inverse:            value.inverse               ?? fallbackInverse,
        inverseLabel:       value.inverseLabel          ?? fallbackInverseLabel,
        inverseLabelPlural: value.inverseLabelPlural    ?? fallbackInverseLabelPlural,
        type:               value.type                  ?? null,
        targets:            (
            typeof value.targets === "string"
            ? [normaliseTarget(value.targets)]
            : (value.targets ?? []).map(normaliseTarget)
        ),
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

function resolveOrCreateStub(contentGraph, target) {
    let existing = contentGraph.nodesById.get(target);

    if (existing) return existing;
    else {
        existing = contentGraph.nodesByTitle.get(target);
        if (existing) return existing;
    }

    if (existing) return existing;

    const stub = {
        id: target,
        name: toLabel(target),
        url: null,
        page: null,
        relations: {},
        backlinks: {},
    };

    contentGraph.nodesById.set(target, stub);
    contentGraph.stubs.push(stub);

    console.info(`[RelationGraph] Stub created for "${toLabel(target)}"`);

    return stub;
}

function resolveTypeDefinition(target, relation, sourceNode, targetNode, definitions) {
    const sourceType = normaliseTypeKey(target.type
        ?? relation.type
        ?? sourceNode.page?.data?.type
        ?? null
    );
    if (!sourceType) return null;

    const definition = definitions?.[sourceType];
    if (!definition) return null;

    const targetType = normaliseTypeKey(targetNode.page?.data?.type 
        ?? relation.type
        ?? null);

    const edgeOverride = targetType ? definition.byTargetType?.[targetType] : null;

    return normaliseDefinition(sourceType, { ...definition, ...edgeOverride });
}

function normaliseTypeKey(key) {
    if (!key) return null;
    return key
        .toLowerCase()
        .replace(/[-_\s]+(\w)/g, (_, c) => c.toUpperCase());
}
