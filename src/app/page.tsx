import { SignInButton } from "@/components/sign-in-button";

export default function Home() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
			<h1 className="text-4xl font-bold">Cast n Cue</h1>
			<p className="text-muted">Track the movies, series, and episodes you watch.</p>
			<SignInButton />
		</main>
	);
}
