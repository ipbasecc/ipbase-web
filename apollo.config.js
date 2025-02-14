"use strict";
/* eslint-env node */
// See https://www.apollographql.com/docs/devtools/apollo-config/
module.exports = {
  client: {
    service: {
      name: "strapi-http-service",
      url: import.meta.env.VITE_GRAPHQL_URI,
    },
    // Files processed by the extension
    includes: ["src/**/*.vue", "src/**/*.js", "src/**/*.ts"],
  },
};
