const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/
  })
const _headers = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  }
]
  module.exports = withMDX({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    async headers() {
      return [
        {
          // Apply these headers to all routes in your application.
          source: '/(.*)',
          headers:_headers,
        },
      ]
    },
  })