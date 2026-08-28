import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 产出自包含运行时,Docker 镜像可以做得很小
  output: 'standalone',
  poweredByHeader: false,
}

export default nextConfig
