const client = require("prom-client");

const uploadsCounter = new client.Counter({
  name: "mis_uploads_total",
  help: "Total MIS uploads",
  labelNames: ["type"], // students / teachers
});

const approvalsCounter = new client.Counter({
  name: "mis_approvals_total",
  help: "Total approvals processed",
  labelNames: ["status"], // approved / rejected
});

module.exports = {
  uploadsCounter,
  approvalsCounter,
};
