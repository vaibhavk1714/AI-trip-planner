'use client';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import * as React from 'react';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const isDark = theme === 'dark';
	return (
		<Button
			variant="outline"
			size="icon"
			aria-label="Toggle theme"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
		>
			{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
		</Button>
	);
}
