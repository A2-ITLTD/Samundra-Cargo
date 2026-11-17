import ToastProvider from "@/components/common/ToastProvider";
import ShipmentsPage from "@/components/myShipping/myShipping";
import React, { Suspense } from "react";
import { siteUrl } from "@/utils/confiq";

// 🔹 SEO metadata for My Shipments
export const metadata = {
  title: "My Shipments | Samudera Traffic Co., Ltd. Group",
  description:
    "Track and manage your shipments with Samudera Traffic Co., Ltd. Group. View real-time shipment status, track packages, monitor transit progress, and manage your logistics operations from one dashboard.",
  keywords: [
    "Samudera Traffic Co., Ltd.",
    "My Shipments",
    "Track Shipment",
    "Shipment Tracking",
    "Package Tracking",
    "Freight Tracking",
    "Cargo Tracking",
    "Logistics Dashboard",
    "Shipment Status",
    "Real-time Tracking",
  ],
  alternates: {
    canonical: siteUrl("/shipments"),
  },
  openGraph: {
    title: "My Shipments | Samudera Traffic Co., Ltd. Group",
    description:
      "Track and manage your shipments with Samudera Traffic Co., Ltd. Group. View real-time shipment status, track packages, monitor transit progress, and manage your logistics operations from one dashboard.",
    url: siteUrl("/shipments"),
    siteName: "Samudera Traffic Co., Ltd. Group",
    images: [
      {
        url: "/og-shipments.jpg",
        width: 1200,
        height: 630,
        alt: "Samudera Traffic Co., Ltd. Group - My Shipments",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Shipments | Samudera Traffic Co., Ltd. Group",
    description:
      "Track and manage your shipments with Samudera Traffic Co., Ltd. Group. View real-time shipment status and track packages.",
    images: ["/og-shipments.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <>
      <Suspense>
          <ToastProvider />
        </Suspense>
      <ShipmentsPage />

      {/* 🔹 Schema Markup for Shipments Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "My Shipments Dashboard",
            description:
              "Track and manage your shipments with Samudera Traffic Co., Ltd. Group. View real-time shipment status, track packages, monitor transit progress, and manage your logistics operations.",
            url: siteUrl("/shipments"),
            publisher: {
              "@type": "Organization",
              name: "Samudera Traffic Co., Ltd. Group",
              url: siteUrl("/"),
              logo: siteUrl("/logo.png"),
            },
            mainEntity: {
              "@type": "ItemList",
              name: "Customer Shipments",
              description: "List of all customer shipments with tracking information",
            },
          }),
        }}
      />

      {/* 🔹 Breadcrumb Schema for Shipments */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Customer Dashboard",
                item: siteUrl("/customer/dashboard"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "My Shipments",
                item: siteUrl("/shipments"),
              },
            ],
          }),
        }}
      />

      {/* 🔹 Organization Schema for Shipments */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Samudera Traffic Co., Ltd. Group",
            url: siteUrl("/"),
            logo: siteUrl("/logo.png"),
            description: "Leading logistics and supply chain solutions provider",
            areaServed: {
              "@type": "Country",
              name: "Worldwide",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+66977830395",
              contactType: "customer support",
              email: "info@samuderathai.com",
              availableLanguage: ["English"],
            },
          }),
        }}
      />
    </>
  );
}
