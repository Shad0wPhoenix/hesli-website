import quote from "./quote.js";
import aloud from "./aloud.js";

export default function registerShortcodes(eleventy, env) {

    const shortcodes = {
        quote: quote(env),
        aloud: aloud(env),
    }

    for (const [name, handler] of Object.entries(shortcodes)) {
        eleventy.addPairedShortcode(name, handler);
    }
}
