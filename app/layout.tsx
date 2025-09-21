import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: 'AI Trip Planner',
	description: 'Plan end-to-end itineraries with AI.',
	icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}
			>
				{/* Client-only providers (Auth, Theme, Toasts, etc.) */}
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
