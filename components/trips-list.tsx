'use client';

import * as React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { listTrips, deleteTrip, type TripDoc } from '@/lib/trips';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Trash2, Copy, Eye } from 'lucide-react';
import Link from 'next/link';

type Props = {
	title?: string;
	description?: string;
	limit?: number; // if set, shows only the latest N
	compact?: boolean; // compact styles for dashboard
	showExport?: boolean; // hide export in compact if you want
};

export default function TripsList({
	title = 'Your Trips',
	description = 'Saved itineraries',
	limit,
	compact,
	showExport = true,
}: Props) {
	const [uid, setUid] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [trips, setTrips] = React.useState<TripDoc[]>([]);
	const [busy, setBusy] = React.useState<string | null>(null);

	React.useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

	React.useEffect(() => {
		const run = async () => {
			if (!uid) return;
			setLoading(true);
			try {
				const rows = await listTrips(uid);
				setTrips(limit ? rows.slice(0, limit) : rows);
			} catch (e) {
				console.error(e);
				toast.error('Failed to load trips');
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [uid, limit]);

	return (
		<Card className={compact ? '' : 'shadow-xs'}>
			<CardHeader className={compact ? 'py-3' : ''}>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className={compact ? 'text-base' : ''}>{title}</CardTitle>
						<CardDescription className={compact ? 'text-xs' : ''}>
							{description}
						</CardDescription>
					</div>
					{limit && (
						<Button asChild variant="outline" size="sm">
							<Link href="/trips">View all</Link>
						</Button>
					)}
				</div>
			</CardHeader>
			{!compact && <Separator />}
			<CardContent className={compact ? 'pt-2' : 'pt-4'}>
				{loading ? (
					<div className="space-y-3">
						<div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
						<div className="h-20 w-full animate-pulse rounded bg-muted" />
						<div className="h-20 w-full animate-pulse rounded bg-muted" />
					</div>
				) : trips.length === 0 ? (
					<div className="text-sm text-muted-foreground">
						No trips yet. Go to Planner and save one.
					</div>
				) : (
					<ul className="grid gap-3">
						{trips.map((t) => (
							<li
								key={t.id}
								className={`rounded-lg border p-3 ${compact ? '' : 'p-4'}`}
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div className="min-w-0">
										<div
											className={`truncate font-medium ${
												compact ? 'text-sm' : ''
											}`}
										>
											{t.result?.destination ||
												t.payload?.Destination ||
												'Trip'}
										</div>
										<div
											className={`truncate text-muted-foreground ${
												compact ? 'text-[11px]' : 'text-xs'
											}`}
										>
											{t.payload?.['Travel Duration']} •{' '}
											{t.payload?.['Travel Themes']}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Button asChild variant="outline" size="sm">
											<Link href={`/trips/${t.id}`}>
												<Eye className="mr-1 size-4" />
												View
											</Link>
										</Button>
										{!compact && (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														const full = t.result?.final || '';
														if (!full) return;
														navigator.clipboard.writeText(full);
														toast.success('Copied itinerary');
													}}
												>
													<Copy className="mr-1 size-4" />
													Copy
												</Button>
												{showExport && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															const content = [
																`Destination: ${t.result?.destination}`,
																'',
																t.result?.final ?? '',
															].join('\n');
															const blob = new Blob([content], {
																type: 'text/plain',
															});
															const url = URL.createObjectURL(blob);
															const a = document.createElement('a');
															a.href = url;
															a.download = `${(
																t.result?.destination || 'trip'
															).replace(/\s+/g, '-')}.txt`;
															a.click();
															URL.revokeObjectURL(url);
														}}
													>
														Export
													</Button>
												)}
												<Button
													variant="destructive"
													size="sm"
													onClick={async () => {
														if (!uid) return;
														setBusy(t.id);
														try {
															await deleteTrip(uid, t.id);
															setTrips((cur) =>
																cur.filter((x) => x.id !== t.id)
															);
															toast.success('Deleted');
														} catch (e) {
															console.error(e);
															toast.error('Failed to delete');
														} finally {
															setBusy(null);
														}
													}}
													disabled={busy === t.id}
												>
													{busy === t.id ? (
														<Loader2 className="mr-1 size-4 animate-spin" />
													) : (
														<Trash2 className="mr-1 size-4" />
													)}
													Delete
												</Button>
											</>
										)}
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
