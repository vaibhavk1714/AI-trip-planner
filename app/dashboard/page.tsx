'use client';

import RequireAuth from '@/components/require-auth';

export default function DashboardPage() {
	return (
		<RequireAuth>
			<h1 className="mb-2 text-2xl font-semibold">Dashboard</h1>
			<p className="text-sm text-muted-foreground">You are logged in. Start planning!</p>
		</RequireAuth>
	);
}
