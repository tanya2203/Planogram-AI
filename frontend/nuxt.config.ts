export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'PlanogramAI',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
      blobBaseUrl: 'https://faiimagedetection.blob.core.windows.net/planogrammaster',
      blobSasToken: '?sv=2023-01-03&st=2026-05-16T13%3A25%3A16Z&se=2027-06-17T13%3A25%3A00Z&sr=c&sp=racwdxlf&sig=Fca2jLmC6eRjORcDc%2FJ5Md5rDpugey1uxT2Becuo4lg%3D',
    }
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  }
})