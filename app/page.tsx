import { useRouter } from 'next/router';

export default function Home() {
	const router = useRouter();
	router.replace('/login');
	return (
		<section className="mx-auto flex max-w-3xl flex-col items-center gap-4 py-16 text-center">
			<h1 className="text-4xl font-bold">AI Trip Planner</h1>
			<p className="text-muted-foreground">
				Sign in to start creating personalized itineraries.
			</p>
		</section>
	);
}
