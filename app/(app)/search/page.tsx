'use client';

import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { saveTrip, type TripPayload, type TripResult } from '@/lib/trips';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

type ItineraryResponse = {
	destination: string;
	overview: string;
	daily: string;
	budget: string;
	final: string;
};

export default function SearchPage() {
	const [destination, setDestination] = React.useState('');
	const [start, setStart] = React.useState('');
	const [end, setEnd] = React.useState('');
	const [budget, setBudget] = React.useState(25000);
	const [adults, setAdults] = React.useState(2);
	const [children, setChildren] = React.useState(0);
	const [interests, setInterests] = React.useState<string[]>(['adventure']);

	const [loading, setLoading] = React.useState(false);
	const [result, setResult] = React.useState<ItineraryResponse | null>(null);

	const lastPayloadRef = React.useRef<TripPayload | null>(null);

	const dayDiff = (a?: string, b?: string) => {
		if (!a || !b) return 3;
		const ms = +new Date(b) - +new Date(a);
		return Math.max(1, Math.ceil(ms / 86400000));
	};

	const monthName = (iso?: string) =>
		(iso ? new Date(iso) : new Date()).toLocaleString('en-IN', { month: 'long' });

	const toggleInterest = (k: string) =>
		setInterests((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

	const fillDemo = () => {
		setDestination('Unsure');
		setStart('2025-12-10');
		setEnd('2025-12-15');
		setBudget(50000);
		setInterests(['adventure', 'food']);
		setAdults(3);
		setChildren(0);
	};

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();
		setResult(null);
		if (start && end && new Date(start) > new Date(end)) {
			alert('End date must be after start date');
			return;
		}
		setLoading(true);
		try {
			const payload: TripPayload = {
				Destination: destination?.trim() || 'Unsure',
				'Time of Year': monthName(start),
				'Travel Duration': `${dayDiff(start, end)} Days`,
				Budget: `${budget} rupees per head`,
				'Travel Themes': interests.join(', ') || 'Adventure',
				Travellers: `Adults: ${adults}${children ? `, Children: ${children}` : ''}`,
			};

			const res = await fetch('/api/itinerary', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!res.ok) throw new Error(await res.text());

			const data: ItineraryResponse = await res.json();
			lastPayloadRef.current = payload;
			setResult(data);
			toast.success('Itinerary created');
		} catch (err) {
			console.error(err);
			alert(err ?? 'Failed to generate itinerary');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mx-auto grid w-full max-w-[1200px] gap-2 px-4 py-3 lg:grid-cols-[420px,1fr] lg:px-6">
			{/* Sticky form */}
			<section className="lg:top-16 lg:self-start">
				<Card className="shadow-xs">
					<CardHeader>
						<CardTitle>Plan your trip</CardTitle>
						<CardDescription>Let AI craft your itinerary.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleGenerate}>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<Label>Destination</Label>
									<Input
										placeholder='e.g. "Jaipur" or leave blank for AI suggestion'
										value={destination}
										onChange={(e) => setDestination(e.target.value)}
									/>
								</div>

								<div>
									<Label>Start date</Label>
									<Input
										type="date"
										value={start}
										onChange={(e) => setStart(e.target.value)}
									/>
								</div>
								<div>
									<Label>End date</Label>
									<Input
										type="date"
										value={end}
										onChange={(e) => setEnd(e.target.value)}
									/>
								</div>

								<div>
									<Label>Budget (₹ per person)</Label>
									<Input
										type="number"
										min={1000}
										step={500}
										value={budget}
										onChange={(e) => setBudget(Number(e.target.value || 0))}
									/>
								</div>

								<div>
									<Label>Duration (days)</Label>
									<Input readOnly value={dayDiff(start, end)} />
								</div>
							</div>

							<div className="space-y-2">
								<Label>Interests</Label>
								<div className="flex flex-wrap gap-2">
									{[
										'heritage',
										'adventure',
										'nightlife',
										'food',
										'family',
										'luxury',
									].map((k) => {
										const active = interests.includes(k);
										return (
											<button
												key={k}
												type="button"
												onClick={() => toggleInterest(k)}
												className={`rounded-full border px-3 py-1 text-sm transition ${
													active
														? 'bg-primary text-primary-foreground'
														: 'hover:bg-muted'
												}`}
											>
												{k}
											</button>
										);
									})}
								</div>
								{!!interests.length && (
									<div className="mt-1 flex flex-wrap gap-1">
										{interests.map((i) => (
											<Badge
												key={i}
												variant="outline"
												className="text-muted-foreground"
											>
												{i}
											</Badge>
										))}
									</div>
								)}
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<Label>Adults</Label>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setAdults((n) => Math.max(1, n - 1))}
										>
											−
										</Button>
										<span className="w-10 text-center">{adults}</span>
										<Button
											type="button"
											variant="outline"
											onClick={() => setAdults((n) => n + 1)}
										>
											+
										</Button>
									</div>
								</div>
								<div className="space-y-2">
									<Label>Children</Label>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setChildren((n) => Math.max(0, n - 1))}
										>
											−
										</Button>
										<span className="w-10 text-center">{children}</span>
										<Button
											type="button"
											variant="outline"
											onClick={() => setChildren((n) => n + 1)}
										>
											+
										</Button>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-2 sm:flex-row">
								<Button type="submit" className="sm:flex-1" disabled={loading}>
									{loading ? 'Generating…' : 'Generate My Trip'}
								</Button>
								<Button
									type="button"
									variant="outline"
									className="sm:flex-1"
									onClick={fillDemo}
									disabled={loading}
								>
									Demo
								</Button>
							</div>

							<p className="text-muted-foreground mt-1 text-xs">
								We’ll suggest a destination if left blank.
							</p>
						</form>
					</CardContent>
				</Card>
			</section>

			{/* Results panel */}
			<section className="min-h-[480px]">
				<Card className="shadow-xs">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between gap-2">
							<div>
								<CardTitle>Results</CardTitle>
								<CardDescription>
									{result
										? `Destination: ${result.destination}`
										: 'Your itinerary will appear here'}
								</CardDescription>
							</div>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={async () => {
										if (!result) return;
										await navigator.clipboard.writeText(result.final);
										toast.success('Copied to cliboard');
									}}
									disabled={!result}
								>
									Copy
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setResult(null);
										toast.success('Cleared current trip');
									}}
									disabled={!result}
								>
									Clear
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={async () => {
										const user = auth.currentUser;
										if (!user || !result || !lastPayloadRef.current) {
											toast.error('Sign in first or generate a plan');
											return;
										}

										try {
											const id = await saveTrip(
												user.uid,
												lastPayloadRef.current,
												result as TripResult
											);
											toast.success('Saved to Trips');
										} catch (error) {
											console.error(error);
											toast.error('Failed to save');
										}
									}}
									disabled={!result}
								>
									Save
								</Button>
							</div>
						</div>
					</CardHeader>
					<Separator />
					<CardContent className="pt-4">
						{loading && (
							<div className="space-y-3">
								<div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
								<div className="h-24 w-full animate-pulse rounded bg-muted" />
								<div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
								<div className="h-24 w-full animate-pulse rounded bg-muted" />
							</div>
						)}

						{!loading && !result && (
							<div className="text-sm text-muted-foreground">
								Fill the form and click “Generate My Trip”.
							</div>
						)}

						{!loading && result && (
							<Tabs defaultValue="overview" className="w-full">
								<TabsList className="mb-3">
									<TabsTrigger value="overview">Overview</TabsTrigger>
									<TabsTrigger value="itinerary">Day-by-day</TabsTrigger>
									<TabsTrigger value="budget">Budget</TabsTrigger>
									<TabsTrigger value="full">Full</TabsTrigger>
								</TabsList>

								<TabsContent value="overview">
									<div className="prose dark:prose-invert max-w-none">
										<ReactMarkdown>{result.overview}</ReactMarkdown>
									</div>
								</TabsContent>
								<TabsContent value="itinerary">
									<div className="prose dark:prose-invert max-w-none">
										<ReactMarkdown>{result.daily}</ReactMarkdown>
									</div>
								</TabsContent>
								<TabsContent value="budget">
									<div className="prose dark:prose-invert max-w-none">
										<ReactMarkdown>{result.budget}</ReactMarkdown>
									</div>
								</TabsContent>
								<TabsContent value="full">
									<div className="prose dark:prose-invert max-w-none">
										<ReactMarkdown>{result.final}</ReactMarkdown>
									</div>
								</TabsContent>
							</Tabs>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
