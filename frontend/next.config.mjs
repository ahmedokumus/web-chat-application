/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // SWC minification'ı devre dışı bırak
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig; 