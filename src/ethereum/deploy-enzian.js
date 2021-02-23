/*
    const prod = require("./deploy-enzian.prod.js");
    module.exports = prod;
*/
if (process.env.NODE_ENV === "enzian-development") {
    const dev = require("./deploy-enzian.dev.js");
    module.exports = dev;
} else {
    const prod = require("./deploy-enzian.prod.js");
    module.exports = prod;
}
