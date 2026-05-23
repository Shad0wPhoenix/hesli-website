export default function buildNavigationGraph(contentGraph) {
    const root = cloneNode(contentGraph.root);
    const flat = flatten(root);

    sortNodes(root);

    return {
        root,
        flat,
        getPrevNext,
        getSiblings: (node) => node.parent ? node.parent.children : [],
        getNodeByStem: contentGraph.getNodeByStem,
        getActivePath,
        getBreadcrumbs,
    };
}

function cloneNode(node, parent = null) {
    // Ignore excluded pages
    if (node.page?.data?.nav_exclude) return null;

    const clone = {
        name: node.name,
        url: node.url,
        page: node.page,
        parent,
        children: [],
    };

    clone.children = node.children
        .map(child => cloneNode(child, clone))
        // Remove all false values from list
        .filter(Boolean);

    return clone;
}

function flatten(node, result = []) {
    for (const child of node.children) {
        result.push(child);
        flatten(child, result);
    }

    return result;
}

function sortNodes(node) {
    node.children.sort((a, b) => {
        const orderA = a.page?.data?.nav_order ?? Infinity;
        const orderB = b.page?.data?.nav_order ?? Infinity;

        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
    });

    node.children.forEach(sortNodes);
}

function getPrevNext(graph, node) {
    const index = graph.flat.indexOf(node);

    return {
        prev: graph.flat[index - 1] ?? null,
        next: graph.flat[index + 1] ?? null
    };
}

function getActivePath(currentNode) {
    const path = new Set();
    let node = currentNode;

    while (node) {
        path.add(node.url);
        node = node.parent;
    }

    return path;
}

function getBreadcrumbs(currentNode) {
    const breadcrumbs = [];
    let node = currentNode;

    while (node) {
        const breadcrumb = {
            title: node.name,
            url: node.url,
            page: node.page,
        };
        if (node.url !== "/") breadcrumbs.push(breadcrumb);
        node = node.parent;
    };

    if (breadcrumbs.length > 1) return breadcrumbs.reverse();
}