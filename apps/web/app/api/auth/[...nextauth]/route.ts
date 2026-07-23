import { auth } from "../../../../lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Explicitly extract the GET and POST execution functions from the Next.js adapter wrapper
const authHandler = toNextJsHandler(auth);

export const GET = (req: Request) => authHandler.GET(req);
export const POST = (req: Request) => authHandler.POST(req);