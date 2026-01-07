const client = require("prom-client");

const loginCounter = new client.Counter({
  name: "auth_login_total",
  help: "Total login attempts",
  labelNames: ["status"], // success | failure
});

module.exports = {
  loginCounter,
};
