/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Type/lint are run explicitly by npm scripts. Skipping them inside `next build`
  // keeps local zip builds from hanging in constrained sandboxes.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  outputFileTracing: false,
};
export default nextConfig;
