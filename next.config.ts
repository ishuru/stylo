import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    const stub = path.resolve(__dirname, 'src/empty-module.ts');
    config.resolve.alias['@opentelemetry/exporter-jaeger'] = stub;
    config.resolve.alias['@genkit-ai/firebase'] = stub;
    return config;
  },
};

export default nextConfig;
