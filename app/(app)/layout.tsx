import type { Metadata } from 'next';
import RequireAuth from '@/components/require-auth';
import AppShell from '@/components/app-shell';

export const metadata: Metadata = {
	title: 'AI Trip Planner',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<RequireAuth>
			<AppShell>{children}</AppShell>
		</RequireAuth>
	);
}
