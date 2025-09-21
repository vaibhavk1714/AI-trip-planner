'use client';

import * as React from 'react';
import { Toaster } from '@/components/ui/sonner'; // or '@/components/ui/toaster' if you used shadcn toaster
import { AuthProvider } from '@/components/auth-provider'; // your existing provider
import { ThemeProvider } from 'next-themes';

// If you use next-themes, uncomment:
// import { ThemeProvider } from 'next-themes';

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<AuthProvider>
				{children}
				<Toaster richColors position="top-center" />
			</AuthProvider>
		</ThemeProvider>
	);
}
