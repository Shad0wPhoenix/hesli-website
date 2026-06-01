import quote from "./quote.js";
import aloud from "./aloud.js";
import spoiler from "./spoiler.js";
import { image, credits } from "./image.js";
import { textEnrichment, mark, container, keyValue } from "./textEnrichment.js";
import tooltip from "./tooltip.js";
import { sidebar, sidebarRight, sidebarLeft, mainSidebar } from "./sidebar.js";
import button from "./button.js";
import { secret, secretToggle } from "./secret.js";

const pairedShortcodes = {
    quote,
    aloud,
    spoiler,
    mark,
    image,
    container,
    keyValue,
    sidebar,
    sidebarRight,
    sidebarLeft,
    button,
    secretToggle,
    secret,
}

const shortcodes = {
    ...textEnrichment,
    credits,
}

export default function registerShortcodes(eleventy, env, markdown) {

    for (const [name, handler] of Object.entries(pairedShortcodes)) {
        eleventy.addPairedShortcode(name, handler(env));
    }

    eleventy.addPairedShortcode("mainSidebar", mainSidebar(env, markdown));

    const tooltipFunc = tooltip(markdown);

    eleventy.addPairedShortcode(
        "tooltip",
        function(...args) {
            return tooltipFunc.call(this, ...args)
        }
    );

    for (const [name, handler] of Object.entries(shortcodes)) {
        eleventy.addShortcode(name, handler);
    }
}
