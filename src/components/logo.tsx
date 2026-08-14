import Image from "next/image";
import Link from "next/link";

export function Logo() {
	return (
		<Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Cast n Cue home">
			<Image
				src="/logo.png"
				alt="Cast n Cue logo"
				width={32}
				height={32}
				priority
				className="h-8 w-8 object-contain"
			/>
			<span className="font-semibold text-foreground">Cast n Cue</span>
		</Link>
	);
}
