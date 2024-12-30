/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack yapılandırması
  experimental: {
    turbo: {
      rules: {
        // Turbopack kuralları
      }
    }
  },
  // Webpack yapılandırması sadece webpack kullanıldığında çalışacak
  webpack: (config) => {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig; 