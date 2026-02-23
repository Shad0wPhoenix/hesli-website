import quote from "./quote.js";

export default function registerShortcodes(eleventy, env) {

    const shortcodes = {
        quote: quote(env),
    }

    for (const [name, handler] of Object.entries(shortcodes)) {
        eleventy.addPairedShortcode(name, handler);
    }
}
