export default function buildContentGraph(pages) {

    const root = {
        name: "home",
        url: "/",
        children: [],
        parent: null,
        relations: {},
        backlinks: {},
    };

    const nodes = new Map();
    const nodesById = new Map();
    const flat = [];

    nodes.set("/", root);

    for (const item of pages) {
        const nav_exclude = item.data.nav_exclude || false;

        const parts = item.page.filePathStem
            .replace(/^\/+/, "")
            .split("/")
            .filter(Boolean);

        let parent = root;
        let currentPath = "/";

        for (const part of parts) {
            if (part === "index") continue;

            currentPath = currentPath === "/" ? `/${part}` : `${currentPath}/${part}`;
            const name = String(part).charAt(0).toUpperCase() + String(part).slice(1);

            if (!nodes.has(currentPath)) {
                const node = {
                    id: null,
                    name: name,
                    url: currentPath,
                    parent,
                    children: [],
                    relations: {},
                    backlinks: {},
                    page: null,
                }

                parent.children.push(node);
                nodes.set(currentPath, node);
            }

            parent = nodes.get(currentPath);
        }

        parent.id = item.data.id || item.fileSlug;
        parent.name = item.data.title || parent.name;
        parent.url = item.page.url;
        parent.page = item;

        nodes.set(item.page.filePathStem, parent);
        nodesById.set(parent.id, parent);
        flat.push(parent);
    }

    return {
        root,
        nodes,
        nodesById,
        flat,
        stubs: [],
        getNodeByStem: (stem) => nodes.get(stem),
    }
}