import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/catec/projetos',
        permanent: true
      }
    ]
  }
}

export default nextConfig
