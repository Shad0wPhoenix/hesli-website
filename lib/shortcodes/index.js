import quote from "./quote.js";
import aloud from "./aloud.js";
import spoiler from "./spoiler.js";
import { image, credits } from "./image.js";
import { textEnrichment, mark } from "./textEnrichment.js";

const pairedShortcodes = {
    quote,
    aloud,
    spoiler,
    mark,
    image,
}

const shortcodes = {
    ...textEnrichment,
    credits,
}

export default function registerShortcodes(eleventy, env) {

    for (const [name, handler] of Object.entries(pairedShortcodes)) {
        eleventy.addPairedShortcode(name, handler(env));
    }

    for (const [name, handler] of Object.entries(shortcodes)) {
        eleventy.addShortcode(name, handler);
    }
}
