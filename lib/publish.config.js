const publishedStatuses = [
    "published",
    "under-review",
];

export default function shouldPublish(status) {
    const isProduction = process.env.ELEVENTY_RUN_MODE === "build";

    return !isProduction || publishedStatuses.includes(toStatus(status));
}

export function toStatus(status) {
    return String(status)
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

export function getStatus(key) {
    return String(key)
        .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
        .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase());
}
