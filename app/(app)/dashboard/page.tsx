'use client';

import RequireAuth from '@/components/require-auth';
import TripsList from '@/components/trips-list';

export default function DashboardPage() {
	return (
		<RequireAuth>
			<div className="mx-auto w-full max-w-[1100px] px-4 py-6 lg:px-6">
				<TripsList />
			</div>
		</RequireAuth>
	);
}
