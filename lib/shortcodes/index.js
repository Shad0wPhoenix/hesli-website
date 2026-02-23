import quote from "./quote.js";
import aloud from "./aloud.js";
import spoiler from "./spoiler.js";

export default function registerShortcodes(eleventy, env) {

    const shortcodes = {
        quote: quote(env),
        aloud: aloud(env),
        spoiler: spoiler(env),
    }

    for (const [name, handler] of Object.entries(shortcodes)) {
        eleventy.addPairedShortcode(name, handler);
    }
}
