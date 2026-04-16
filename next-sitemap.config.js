/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://tickflo.netlify.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/tickets',
    '/tickets/*',
    '/settings',
    '/settings/*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/organizations',
    '/organizations/*',
    '/projects',
    '/projects/*',
    '/sprints',
    '/sprints/*',
    '/labels',
    '/users',
    '/api/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/tickets/',
          '/settings',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/organizations',
          '/projects',
          '/sprints',
          '/labels',
          '/users',
          '/api/',
        ],
      },
    ],
    additionalSitemaps: ['https://tickflo.netlify.app/sitemap.xml'],
  },
  // Priority per path
  transform: async (config, path) => {
    const priorities = {
      '/': 1.0,
      '/pricing': 0.9,
      '/about-us': 0.8,
      '/blog': 0.8,
    };
    return {
      loc: path,
      changefreq: path === '/' ? 'weekly' : 'monthly',
      priority: priorities[path] ?? 0.7,
      lastmod: new Date().toISOString(),
    };
  },
};
