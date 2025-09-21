import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
	suggestDestination,
	getDestinationOverview,
	createDailyItinerary,
	getBudgetAndLogistics,
} from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const InputSchema = z.object({
	Destination: z.string().optional(),
	'Time of Year': z.string(),
	'Travel Duration': z.string(),
	Budget: z.string(),
	'Travel Themes': z.string(),
	Travellers: z.string(),
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const inputs = InputSchema.parse(body);

		let destination = inputs.Destination;
		if (!destination || destination.toLocaleLowerCase() === 'unsure') {
			destination = await suggestDestination(inputs);
		}

		// run the 3 tasks in parallel
		const [overview, daily, budget] = await Promise.all([
			getDestinationOverview(destination, inputs),
			createDailyItinerary(destination, inputs),
			getBudgetAndLogistics(destination, inputs),
		]);

		const final = `
# Your Adventure Trip Plan to ${destination}
Here is a comprehensive travel plan tailored to your preferences.

---
## 📌 Destination Overview
${overview}
---
## 📅 Day-by-Day Suggested Itinerary
${daily}
---
## 💰 Budget and Logistics Breakdown
${budget}
---
**Disclaimer:** All costs are estimates and subject to change. Please verify details before booking.
		`.trim();

		return NextResponse.json({ destination, overview, daily, budget, final }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: 'Failed to generate itenary' }, { status: 500 });
	}
}
