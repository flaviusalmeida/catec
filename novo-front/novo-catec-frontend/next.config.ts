import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/pt/catec/projetos',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(pt|en|fr|ar)',
        destination: '/:lang/catec/projetos',
        permanent: true,
        locale: false
      },
      {
        source: '/:path((?!pt|en|fr|ar|front-pages|images|api|favicon.ico).*)*',
        destination: '/pt/:path*',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
