const fp = require("fastify-plugin");
const fastifyMetrics = require("fastify-metrics");

module.exports = fp(async function (fastify) {
  fastify.register(fastifyMetrics, {
    endpoint: "/metrics",
    routeMetrics: {
      enabled: true,
      overrides: {
        histogram: {
          name: "http_request_duration_seconds",
          help: "HTTP request duration in seconds",
        },
      },
    },
  });
});
