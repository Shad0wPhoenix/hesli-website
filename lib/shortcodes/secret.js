export function secret(env) {
    return function(content) {
        return env.renderString(
            `{% from "components/secret.njk" import secret %}
             {{ secret(content) }}`,
            { content }
        )
    }
}

export function secretToggle(env) {
    return function(content) {
        return env.renderString(
            `{% from "components/secret.njk" import secretToggle %}
             {{ secretToggle(content) }}`,
              { content }
        )
    }
}