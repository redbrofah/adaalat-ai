/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": ["./data/demo-cases/**", "./data/cases/**"],
    },
  },
};

export default nextConfig;
