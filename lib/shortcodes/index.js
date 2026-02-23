import quote from "./quote.js";
import aloud from "./aloud.js";
import spoiler from "./spoiler.js";

import { textEnrichment, mark } from "./textEnrichment.js";

const components = {
    quote,
    aloud,
    spoiler,
    mark,
}

export default function registerShortcodes(eleventy, env) {

    for (const [name, handler] of Object.entries(components)) {
        eleventy.addPairedShortcode(name, handler(env));
    }

    for (const [name, handler] of Object.entries(textEnrichment)) {
        eleventy.addShortcode(name, handler);
    }
}
