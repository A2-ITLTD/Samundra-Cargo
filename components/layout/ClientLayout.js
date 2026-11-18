'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ToastProvider from '@/components/common/ToastProvider';
import Navbar from "@/components/common/navbar";
import Topbar from "@/components/common/topbar";
import Footer from "@/components/common/footer";
import PageTransition from "@/components/common/PageTransition";
import SiteSettingsProvider from "@/components/context/SiteSettingsProvider";

function LayoutContent({ children }) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Topbar />
        <Navbar />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default function ClientLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = () => {
      if (window.location.pathname !== '/auth/login') {
        router.replace('/auth/login');
      }
    };
    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('sessionExpired', handleSessionExpired);
  }, [router]);

  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <SiteSettingsProvider>
        <LayoutContent>{children}</LayoutContent>
        <ToastProvider />
      </SiteSettingsProvider>
    </Suspense>
  );
}
