import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppSidebar } from '@/components/app-sidebar';

const ptSans = PT_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-sans' 
});

export const metadata: Metadata = {
  title: 'Churchlytics',
  description: 'An overview of key church activities and statistics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          ptSans.variable
        )}
        suppressHydrationWarning
      >
        <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
          <div className="flex">
            <AppSidebar />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
