import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/ui/theme-provider';
import {Toaster} from 'sonner';

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: {
    default: 'Open Resume Builder',
    template: '%s | Open Resume Builder',
  },
  description: 'Build beautiful resumes with AI assistance - Next.js 14+ TypeScript',
  keywords: ['resume', 'builder', 'CV', 'typescript', 'nextjs', 'ai'],
  authors: [{name: 'Open Resume Team'}],
  creator: 'Open Resume Team',
  publisher: 'Open Resume Team',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://open-resume.com',
    siteName: 'Open Resume Builder',
    title: 'Open Resume Builder',
    description: 'Build beautiful resumes with AI assistance',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Open Resume Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Resume Builder',
    description: 'Build beautiful resumes with AI assistance',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
         <ThemeProvider
           attribute="class"
           defaultTheme="system"
           enableSystem
           disableTransitionOnChange
         >
           <div className="min-h-screen bg-background text-foreground antialiased">
             {children}
             <Toaster position="top-right" />
           </div>
         </ThemeProvider>
      </body>
    </html>
  );
}