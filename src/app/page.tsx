import { Button } from "@heroui/react/button";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
			<h1 className="text-4xl font-bold">Cast n Cue</h1>
			<p className="text-muted">Track the movies, series, and episodes you watch.</p>
			<Button variant="tertiary">Get started</Button>
		</main>
	);
}
