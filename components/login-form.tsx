'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const router = useRouter();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email.trim(), password);
			router.replace('/dashboard');
		} catch (err: unknown) {
			console.error(err);
			alert(err);
		} finally {
			setLoading(false);
		}
	};

	const loginWithGoogle = async () => {
		setLoading(true);
		try {
			await signInWithPopup(auth, googleProvider);
			router.replace('/dashboard');
		} catch (err: unknown) {
			console.error(err);
			alert(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className={cn('flex flex-col gap-6', className)} onSubmit={onSubmit} {...props}>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">Login to your account</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Enter your email below to login to your account
				</p>
			</div>

			<div className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				<div className="grid gap-3">
					<Input
						id="password"
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? 'Signing in…' : 'Login'}
				</Button>

				<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
					<span className="bg-background text-muted-foreground relative z-10 px-2">
						Or continue with
					</span>
				</div>

				{/* Google */}
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={loginWithGoogle}
					disabled={loading}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						className="mr-2 h-5 w-5"
						aria-hidden="true"
					>
						<path
							fill="#EA4335"
							d="M12 10.2v3.6h5.09c-.22 1.2-.91 2.21-1.94 2.88l3.14 2.43c1.84-1.7 2.91-4.21 2.91-7.31 0-.63-.06-1.25-.18-1.84H12z"
						/>
						<path
							fill="#34A853"
							d="M7.08 14.32c-.27-.8-.42-1.65-.42-2.52s.15-1.72.42-2.52L3.9 6.85A10.01 10.01 0 0 0 2 11.8c0 1.61.39 3.13 1.08 4.45l4-1.93z"
						/>
						<path
							fill="#4A90E2"
							d="M12 22c2.7 0 4.96-.89 6.61-2.41l-3.14-2.43c-.87.58-1.99.92-3.47.92-2.68 0-4.95-1.81-5.77-4.26l-4 1.93C4.72 19.64 8.06 22 12 22z"
						/>
						<path
							fill="#FBBC05"
							d="M12 2c-3.94 0-7.28 2.36-8.69 5.8l4 1.93c.82-2.45 3.09-4.26 5.77-4.26 1.49 0 2.6.34 3.47.92l3.14-2.43C16.96 2.89 14.7 2 12 2z"
						/>
					</svg>
					Continue with Google
				</Button>
			</div>
		</form>
	);
}
