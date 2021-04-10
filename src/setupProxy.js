const proxy = require("http-proxy-middleware");

module.exports = (app) => {
    app.use(
        proxy("/.netlify/functions/enforceCode/", {
            target: "https://codexweb.netlify.app",
            changeOrigin: true,
        })
    );
};