/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Printer, Map as MapIcon, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TripMap from '@/components/map/trip-map'; // <- from earlier step

type TripDoc = {
	payload: any;
	result: {
		destination: string;
		overview: string;
		daily: string;
		budget: string;
		final: string;
	};
};

export default function TripDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [uid, setUid] = React.useState<string | null>(null);
	const [trip, setTrip] = React.useState<TripDoc | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

	React.useEffect(() => {
		const run = async () => {
			if (!uid || !id) return;
			setLoading(true);
			try {
				const ref = doc(db, 'users', uid, 'trips', id);
				const snap = await getDoc(ref);
				if (!snap.exists()) {
					toast.error('Trip not found');
					return;
				}
				setTrip(snap.data() as TripDoc);
			} catch (e) {
				console.error(e);
				toast.error('Failed to load trip');
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [uid, id]);

	const copyAll = async () => {
		if (!trip) return;
		await navigator.clipboard.writeText(trip.result.final || '');
		toast.success('Copied itinerary');
	};

	const openInMaps = () => {
		const q = encodeURIComponent(trip?.result?.destination || '');
		window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
	};

	if (loading) {
		return (
			<div className="mx-auto w-full max-w-[1100px] px-4 py-6">
				<div className="mb-4 flex items-center gap-2">
					<div className="h-7 w-24 animate-pulse rounded bg-muted" />
				</div>
				<div className="grid gap-4 lg:grid-cols-5">
					<div className="lg:col-span-3">
						<div className="h-[360px] w-full animate-pulse rounded-xl bg-muted" />
					</div>
					<div className="lg:col-span-2">
						<div className="h-[120px] w-full animate-pulse rounded-xl bg-muted" />
						<div className="mt-3 h-[240px] w-full animate-pulse rounded-xl bg-muted" />
					</div>
				</div>
			</div>
		);
	}

	if (!trip) {
		return (
			<div className="mx-auto w-full max-w-[1100px] px-4 py-6 text-sm text-muted-foreground">
				Not found.
			</div>
		);
	}

	const { destination, overview, daily, budget, final } = trip.result || {};
	const mapsKeyMissing = !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

	return (
		<div className="mx-auto w-full max-w-[1100px] px-4 py-6 lg:px-6">
			<div className="mb-3 flex items-center gap-2">
				<Button variant="ghost" size="sm" onClick={() => router.back()}>
					<ArrowLeft className="mr-1 size-4" />
					Back
				</Button>
				<span className="text-sm text-muted-foreground">Trip details</span>
			</div>

			{/* Map (full width) */}
			<div className="grid gap-6">
				<Card>
					<CardHeader className="flex-row items-center justify-between gap-2">
						<div>
							<CardTitle className="leading-tight">{destination || 'Trip'}</CardTitle>
							<CardDescription>Map & location</CardDescription>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button variant="outline" onClick={openInMaps}>
								<MapIcon className="mr-1 size-4" />
								Open in Maps
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									window.open(
										`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
											destination || ''
										)}`,
										'_blank'
									)
								}
							>
								<ExternalLink className="mr-1 size-4" />
								Explore
							</Button>
						</div>
					</CardHeader>
					<Separator />
					<CardContent className="pt-4">
						{mapsKeyMissing ? (
							<div className="rounded-lg border p-4 text-sm">
								<div className="font-medium">Map not configured</div>
								<div className="text-muted-foreground">
									Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your{' '}
									<code>.env.local</code> to enable the map.
								</div>
							</div>
						) : (
							<TripMap destinationHint={destination} />
						)}
					</CardContent>
				</Card>

				{/* Actions + Summary BELOW the map */}
				<div className="grid gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Actions</CardTitle>
							<CardDescription>Share, print, export</CardDescription>
						</CardHeader>
						<Separator />
						<CardContent className="flex flex-wrap gap-2 pt-4">
							<Button variant="outline" onClick={copyAll}>
								<Copy className="mr-1 size-4" />
								Copy
							</Button>
							<Button onClick={() => window.print()}>
								<Printer className="mr-1 size-4" />
								Print
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Summary</CardTitle>
							<CardDescription>Quick glance</CardDescription>
						</CardHeader>
						<Separator />
						<CardContent className="prose dark:prose-invert max-w-none pt-4">
							<h3 className="mt-0">Overview</h3>
							<ReactMarkdown>{overview}</ReactMarkdown>
							<h3>Budget</h3>
							<ReactMarkdown>{budget}</ReactMarkdown>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Full itinerary below */}
			<div className="mt-6">
				<Card>
					<CardHeader>
						<CardTitle>Day-by-Day Itinerary</CardTitle>
						<CardDescription>Detailed schedule</CardDescription>
					</CardHeader>
					<Separator />
					<CardContent className="prose dark:prose-invert max-w-none pt-4">
						<ReactMarkdown>{daily}</ReactMarkdown>
						<Separator className="my-4" />
						<details>
							<summary className="cursor-pointer text-sm text-muted-foreground">
								Full (raw)
							</summary>
							<pre className="whitespace-pre-wrap text-xs">{final}</pre>
						</details>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
