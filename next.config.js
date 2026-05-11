/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  transpilePackages: ['react-globe.gl', 'three-globe', 'globe.gl'],
  webpack: (config) => {
    // Stub optional WebGPU modules — three-globe imports them but they aren't
    // available in all three versions and aren't needed for WebGL rendering.
    const stub = path.join(__dirname, 'lib/three-stub.js');
    config.resolve.alias['three/webgpu'] = stub;
    config.resolve.alias['three/tsl'] = stub;
    return config;
  },
};

module.exports = nextConfig;
