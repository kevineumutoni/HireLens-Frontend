/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fix Windows/Next dev: webpack PackFileCacheStrategy gzip OOM
    config.cache = false;
    return config;
  },
};

export default nextConfig;