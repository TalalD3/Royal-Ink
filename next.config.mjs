/* Images uploaded from the admin live on UploadThing at
   https://<APP_ID>.ufs.sh/f/<key>. The app id is read from UPLOADTHING_TOKEN
   (it is public — part of every image address); only that app's files are
   allowed through next/image. */
function uploadthingAppId() {
  const token = (process.env.UPLOADTHING_TOKEN || "").trim().replace(/^['"]|['"]$/g, "");
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf8")).appId || null;
  } catch {
    return null;
  }
}
const appId = uploadthingAppId();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Where this build runs ("netlify" during a Netlify build, else empty) —
  // used to read the visitor's address from the right header
  env: { DEPLOY_TARGET: process.env.NETLIFY ? "netlify" : "" },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: appId ? `${appId}.ufs.sh` : '*.ufs.sh',
        pathname: '/f/*',
      },
    ],
  },
};
export default nextConfig;
