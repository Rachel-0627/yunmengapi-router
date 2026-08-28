import type { Metadata } from 'next'
import { site } from '@/lib/site'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.subline,
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description: site.subline,
    url: site.url,
    siteName: site.name,
    locale: 'zh_CN',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
