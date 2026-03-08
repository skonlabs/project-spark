/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
