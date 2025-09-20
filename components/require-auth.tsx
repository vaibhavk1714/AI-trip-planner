'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user === null) router.replace('/login');
	}, [user, router]);

	if (user === undefined) {
		return (
			<div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
				Checking session…
			</div>
		);
	}

	if (user === null) return null;

	return <>{children}</>;
}
