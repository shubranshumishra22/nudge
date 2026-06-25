import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { generateStoreFunction } from "../../../inngest/functions/generateStore";

// Create the API route to serve Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateStoreFunction,
  ],
});
