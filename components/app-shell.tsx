/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Home, Search, LayoutDashboard, Map, Settings, LogOut, Menu } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { ThemeToggle } from '@/components/theme-toggle';

type NavItem = { href: string; label: string; icon: React.ComponentType<any> };

const NAV: NavItem[] = [
	{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/search', label: 'Planner', icon: Search },
	{ href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({
	children,
	title = 'AI Trip Planner',
}: {
	children: React.ReactNode;
	title?: string;
}) {
	const [open, setOpen] = React.useState(false);
	const [user, setUser] = React.useState<User | null>(null);
	const pathname = usePathname();
	const router = useRouter();

	React.useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => setUser(u));
		return () => unsub();
	}, []);

	const handleLogout = async () => {
		await signOut(auth);
		router.push('/login');
	};

	const email = user?.email ?? '';
	const displayName = user?.displayName || (email ? email.split('@')[0] : 'User');
	const avatarUrl = user?.photoURL || undefined;
	const initials = ((displayName.match(/\b\w/g) || []).slice(0, 2).join('') || 'U').toUpperCase();

	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<aside
				className={`${
					open ? 'translate-x-0' : '-translate-x-full'
				} fixed inset-y-0 z-40 w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform lg:static lg:translate-x-0`}
			>
				<div className="flex h-full flex-col">
					<div className="flex items-center gap-2 px-4 py-4">
						<div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Home className="size-4" />
						</div>
						<span className="text-base font-semibold">AI Trip Planner</span>
					</div>
					<Separator />
					<nav className="space-y-1 p-2">
						{NAV.map(({ href, label, icon: Icon }) => {
							const active = pathname.startsWith(href);
							return (
								<Link
									key={href}
									href={href}
									className="block"
									onClick={() => setOpen(false)}
								>
									<Button
										variant={active ? 'secondary' : 'ghost'}
										className="w-full justify-start gap-2"
									>
										<Icon className="size-4" />
										{label}
									</Button>
								</Link>
							);
						})}
					</nav>
					<div className="mt-auto p-2">
						<Separator className="mb-2" />
						<div className="flex items-center gap-3 px-2 py-2">
							<Avatar className="size-8">
								{avatarUrl ? (
									<AvatarImage src={avatarUrl} alt={displayName} />
								) : null}
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<div className="truncate text-sm font-medium">{displayName}</div>
								<div className="truncate text-xs text-muted-foreground">
									{email || 'Signed in'}
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="ml-auto"
								onClick={handleLogout}
								aria-label="Log out"
							>
								<LogOut className="size-4" />
							</Button>
						</div>
					</div>
				</div>
			</aside>

			{/* Content */}
			<div className="flex min-h-screen flex-1 flex-col">
				{/* Header */}
				<header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur">
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={() => setOpen((v) => !v)}
					>
						<Menu className="size-5" />
					</Button>
					<Separator orientation="vertical" className="h-5" />
					<h1 className="text-sm font-medium">{title}</h1>
					<div className="ml-auto flex items-center gap-2">
						<ThemeToggle />
					</div>
				</header>
				{/* Main */}
				<div className="flex-1">{children}</div>
			</div>
		</div>
	);
}
