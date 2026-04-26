/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/**": ["./data/demo-cases/**", "./data/cases/**"],
    "/case/**": ["./data/demo-cases/**", "./data/cases/**"],
    "/demo": ["./data/demo-cases/**"],
    "/admin": ["./data/demo-cases/**"],
  },
};

export default nextConfig;
