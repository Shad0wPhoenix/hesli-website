// Imports


/**
 * Eleventy Configuration
 * @param {object} eleventy - Eleventy configuration
 * @returns {object} Updated Eleventy configuration
 */
export default function (eleventy) {

    // (Paired) Shortcodes
    eleventy.addPairedShortcode(
        'quote', (content, type = 'quote') => {
            return `<blockquote class="${type}">
                ${content}
            </blockquote>`
        }
    )

    eleventy.addShortcode(
        'mark', (colour, text) => {
            if (!colour) return `<mark>${text}</mark>`
            else return `<mark class="${colour}">${text}</mark>`
        }
    )

    // Pass Through Copy
    eleventy.addPassthroughCopy("src/_styles/")
    eleventy.addPassthroughCopy("src/content/img")

    return {
        dir: {
            input: "src",
            output: "www",
            data: "_data",
            includes: "_includes",
            layouts: "_layouts"
        }
    }
}