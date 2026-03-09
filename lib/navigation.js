export default function buildNavigationGraph(pages, inputDirectory) {

    const CONTENT_ROOT = `/${inputDirectory}/`;
    const DELIMITER = "/";

    const root = {
        name: "root",
        children: [],
        parent: null,
    };

    const nodes = new Map();

    for (const item of pages) {
        if (!item.page.filePathStem.startsWith(CONTENT_ROOT)) continue;
        if (item.data.nav_exclude) continue;

        const parts = item.page.filePathStem
            .replace(CONTENT_ROOT, "")
            .split(DELIMITER);

        let parent = root;
        let currentPath = "";

        for (const part of parts) {
            currentPath += DELIMITER + part;

            if (!nodes.has(currentPath)) {
                const node = {
                    name: part,
                    url: null,
                    parent,
                    children: [],
                    page: null,
                }

                parent.children.push(node);
                nodes.set(currentPath, node);
            }

            parent = nodes.get(currentPath);
        }

        const displayName = item.data.nav_title || parent.name;
        parent.name = displayName;
        parent.url = item.page.url;
        parent.page = item;
    }

    sortNodes(root);

    const flat = [];
    flattenTree(root, flat);

    return { root, nodes, flat }
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

function flattenTree(node, array) {
    if (node.url) array.push(node);
    node.children.forEach(child => flattenTree(child, array));
}