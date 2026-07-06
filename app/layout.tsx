import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://serviceops.ai";
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  title: "ServiceOps AI | Approval-First AI for Trucking Carriers",
  description:
    "Approval-first operational AI for trucking carriers: dispatch exceptions, SLA risk handling, POD document workflows, and auditable billing handoff.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "ServiceOps AI | Approval-First AI for Trucking Carriers",
    description:
      "Dispatch exceptions, approval controls, and POD-to-billing acceleration for carrier operations.",
    url: siteUrl,
    siteName: "ServiceOps AI",
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ServiceOps AI - AI-Powered Dispatch for Trucking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ServiceOps AI | Approval-First AI for Trucking Carriers",
    description:
      "Operational AI for dispatch exceptions, approvals, and billing readiness.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}

        {metaPixelId && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
            </Script>
          </>
        )}

        {children}
      </body>
    </html>
  );
}
