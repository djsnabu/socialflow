import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT) || 3001;

console.log(`SocialFlow API starting on port ${port}`);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`SocialFlow API running at http://localhost:${info.port}`);
});
