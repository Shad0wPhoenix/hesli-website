import shouldPublish from "../../lib/publish.config.js";

export default {
    permalink(data) {
        return shouldPublish(data.status) ? data.permalink : false;
    }
}
