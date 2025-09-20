'use client';

import RequireAuth from '@/components/require-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function SearchPage() {
	const [destination, setDestination] = useState('');
	const [start, setStart] = useState('');
	const [end, setEnd] = useState('');
	const [budget, setBudget] = useState(25000);
	const [interests, setInterests] = useState<string[]>([]);

	const toggleInterest = (k: string) =>
		setInterests((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: call your /api/plan later
		console.log({ destination, start, end, budget, interests });
		alert('Generate itinerary (backend next)');
	};

	return (
		<RequireAuth>
			<div className="mx-auto max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle>Plan your trip</CardTitle>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleGenerate}>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<Label>Destination</Label>
									<Input
										placeholder="Jaipur, Rajasthan"
										value={destination}
										onChange={(e) => setDestination(e.target.value)}
									/>
								</div>
								<div>
									<Label>Budget (₹)</Label>
									<Input
										type="number"
										value={budget}
										onChange={(e) => setBudget(Number(e.target.value || 0))}
										min={1000}
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
									].map((k) => (
										<button
											key={k}
											type="button"
											onClick={() => toggleInterest(k)}
											className={`rounded-full border px-3 py-1 text-sm ${
												interests.includes(k)
													? 'bg-primary text-primary-foreground'
													: 'hover:bg-muted'
											}`}
										>
											{k}
										</button>
									))}
								</div>
							</div>

							<Button type="submit" className="w-full">
								Generate My Trip
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</RequireAuth>
	);
}
