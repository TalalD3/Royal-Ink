import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";

// UploadThing's endpoint: the browser asks here for permission to upload
// (the admin check in core.ts), and UploadThing reports finished uploads
export const { GET, POST } = createRouteHandler({ router: uploadRouter });
