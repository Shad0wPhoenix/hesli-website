import fs from "fs";
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";

const markdown = markdownIt({
        html: true,
        breaks: false,
        linkify: true,
    })
    .use(markdownItAttrs);

markdown.renderer.rules.hr = function() {
    return fs.readFileSync(
        "./src/_includes/lib/divider.svg",
        "utf-8"
    );
}

export default markdown;
