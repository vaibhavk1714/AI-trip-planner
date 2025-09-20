'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Navbar() {
	const { user, logout } = useAuth();

	return (
		<header className="border-b">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link href="/" className="font-semibold">
					Trip Planner
				</Link>
				<nav className="flex items-center gap-3">
					{user ? (
						<>
							<Link href="/search" className="text-sm">
								Search
							</Link>
							<Link href="/dashboard" className="text-sm">
								Dashboard
							</Link>
							<Avatar className="h-7 w-7">
								<AvatarFallback>
									{user.email?.[0]?.toUpperCase() ?? 'U'}
								</AvatarFallback>
							</Avatar>
							<Button variant="outline" onClick={logout}>
								Sign Out
							</Button>
						</>
					) : (
						<>
							<Link href="/login">
								<Button>Sign In</Button>
							</Link>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
