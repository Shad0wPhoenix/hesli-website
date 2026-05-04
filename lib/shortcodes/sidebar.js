export function sidebar(env) {
    return function(content) {
        return env.renderString(
            `{% from "components/sidebar.njk" import sidebar %}
            {{ sidebar(content) }}`,
             { content }
        );
    };
};

export function sidebarRight(env) {
    return function(content) {
        return env.renderString(
            `{% from "components/sidebar.njk" import sidebarRight %}
            {{ sidebarRight(content) }}`,
             { content }
        )
    }
}