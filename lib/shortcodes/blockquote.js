
export const blockquote = (content, type = 'quote') => {
    return `<blockquote class="${type}">
        ${content}
    </blockquote>`
}