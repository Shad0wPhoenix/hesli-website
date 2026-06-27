// Imports
import markdown from './lib/markdown.config.js';
import getNunjucksEnv from './lib/nunjucks.js';
import registerShortcodes from './lib/shortcodes/index.js';
import buildContentGraph from './lib/graphs/contentGraph.js';
import buildNavigationGraph from './lib/graphs/navigationGraph.js';
import buildRelationGraph from './lib/graphs/relationGraph.js';
import relationTypes from './src/_data/relationTypes.js';
import fs from 'fs';
import { rm } from 'fs/promises';

/**
 * Eleventy Configuration
 * @param {object} eleventy - Eleventy configuration
 * @returns {object} Updated Eleventy configuration
 */
export default function (eleventy) {

    const workspace = "src";
    const input = "content";
    const output = "www";
    const components = "_includes";
    const data = "_data";
    const layouts = "_layouts";
    const scripts = "_scripts";
    const styles = "_styles";
    const images = `${input}/_img`;

    let contentGraph;
    let relationGraph;
    let initialRun = true;

    // Nunjuck Environment
    const nunjucksEnv = getNunjucksEnv(`${workspace}/${components}`);

    // Setting Libraries
    eleventy.setLibrary("md", markdown);
    eleventy.setLibrary("njk", nunjucksEnv);

    // Creating a ContentGraph
    eleventy.addCollection("contentGraph", function(collections) {
        const pages = collections.all ?? collections.items;

        if (!pages) {
            console.warn("No pages found in collections!");
            return { root: { name: "root", children: [], parent: null }, nodes: new Map(), flat: [] };
        }

        contentGraph = buildContentGraph(pages, input);

        return contentGraph;
    });

    // Creating a Collection for Navigation based on ContentGraph
    eleventy.addCollection("navGraph", function() {
        return buildNavigationGraph(contentGraph);
    });

    // Enrich ContentGraph with Relations
    eleventy.addCollection("relationGraph", function(collections) {
        relationGraph = buildRelationGraph(contentGraph, relationTypes);
        return relationGraph;
    });

    // Filters
    eleventy.addFilter("getRelations", (graph, stem) => {
        const node = graph.getNodeByStem(stem);

        const hasRelations = Object.keys(node.relations).length !== 0;
        const hasBacklinks = Object.keys(node.backlinks).length !== 0;

        if (hasRelations || hasBacklinks) return node;
        else return null;
    });

    eleventy.addFilter("getAncestors", (graph, stem) => {
        return graph.getActivePath(graph.getNodeByStem(stem))
    });

    eleventy.addFilter("getBreadcrumbs", (graph, stem) => {
        return graph.getBreadcrumbs(graph.getNodeByStem(stem))
    })

    eleventy.addFilter("isArray", value => Array.isArray(value));

    eleventy.addFilter("isObject", value => value !== null
        && typeof value === "object"
        && !Array.isArray(value)
    );

    // Register (Paired) Shortcodes
    registerShortcodes(eleventy, nunjucksEnv, markdown);

    // Pass Through Copy
    eleventy.addPassthroughCopy({ [`${workspace}/${styles}/`] : `${styles}` });
    eleventy.addPassthroughCopy({ [`${workspace}/${scripts}/`] : `${scripts}` });
    eleventy.addPassthroughCopy({ [`${workspace}/${images}/`] : "_img" });
    eleventy.addPassthroughCopy(".htaccess");

    // Trigger Rebuild on JS and CSS changes
    eleventy.addWatchTarget(`./${workspace}/${scripts}`);
    eleventy.addWatchTarget(`./${workspace}/${styles}`);
    eleventy.addWatchTarget(`./${workspace}/lib`);

    eleventy.addGlobalData("layout", "base");

    eleventy.on("eleventy.before", async ({ dir, runMode }) => {
        if (runMode === "build" || initialRun) await rm(dir.output, { recursive: true, force: true });
        initialRun = false;
    });

    eleventy.on("eleventy.after", ({ results }) => {
        if (relationGraph.stubs.length) {
            let unwrittenArticles = "[RelationGraph] Unwritten articles:\r\n";
            relationGraph.stubs.forEach(s => unwrittenArticles = unwrittenArticles + `  - ${s.name}\r\n`);

            console.log(unwrittenArticles);
            fs.writeFileSync('./unwrittenArticles.txt', unwrittenArticles);
        }
    });

    return {
        dir: {
            input: `${workspace}/${input}`,
            output: output,
            data: `../${data}`,
            includes: `../${components}`,
            layouts: `../${layouts}`
        },

        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
    };
}