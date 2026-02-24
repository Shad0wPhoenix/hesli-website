// Imports
import markdown from './lib/markdown.config.js';
import getNunjucksEnv from './lib/nunjucks.js';
import registerShortcodes from './lib/shortcodes/index.js';

/**
 * Eleventy Configuration
 * @param {object} eleventy - Eleventy configuration
 * @returns {object} Updated Eleventy configuration
 */
export default function (eleventy) {

    const input = "src";
    const output = "www";
    const components = "_includes";
    const data = "_data";
    const layouts = "_layouts";
    const scripts = "_scripts";
    const styles = "_styles";
    const images = "content/img";

    // Nunjuck Environment
    const nunjucksEnv = getNunjucksEnv(`${input}/${components}`);

    // Setting Libraries
    eleventy.setLibrary("md", markdown);
    eleventy.setLibrary("njk", nunjucksEnv);

    // Register (Paired) Shortcodes
    registerShortcodes(eleventy, nunjucksEnv);

    // Pass Through Copy
    eleventy.addPassthroughCopy(`${input}/${styles}/`);
    eleventy.addPassthroughCopy(`${input}/${scripts}/`);
    eleventy.addPassthroughCopy({ [`${input}/${images}/`] : "img" });

    return {
        dir: {
            input: input,
            output: output,
            data: data,
            includes: components,
            layouts: layouts
        },

        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
    };
}