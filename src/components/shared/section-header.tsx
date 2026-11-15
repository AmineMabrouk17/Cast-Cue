import Link from "next/link";

export function SectionHeader({
	title,
	description,
	action,
	size = "lg",
}: {
	title: string;
	description?: string;
	action?: { href: string; label: string };
	size?: "lg" | "sm";
}) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div className="flex flex-col gap-2">
				<h2
					className={
						size === "sm"
							? "text-2xl font-bold sm:text-3xl"
							: "text-3xl font-bold sm:text-4xl"
					}
				>
					{title}
				</h2>
				{description ? <p className="max-w-xl text-sm text-muted">{description}</p> : null}
			</div>
			{action ? (
				<Link
					href={action.href}
					className="inline-flex min-h-11 items-center text-sm font-medium text-accent-text transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
				>
					{action.label} →
				</Link>
			) : null}
		</div>
	);
}
