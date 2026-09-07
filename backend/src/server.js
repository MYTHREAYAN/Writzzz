const env = require("./config/env");
const { connectDatabase } = require("./config/db");
const { createApp } = require("./app");

async function start() {
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Writzz API listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
