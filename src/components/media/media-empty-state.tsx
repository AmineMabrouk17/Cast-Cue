import Link from "next/link";

export function MediaEmptyState({
	title = "No trending media",
	message = "Nothing to show right now.",
	action,
}: {
	title?: string;
	message?: string;
	action?: { label: string; href: string };
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-6 py-12 text-center">
			<p className="text-sm font-medium text-foreground">{title}</p>
			<p className="max-w-md text-sm text-muted">{message}</p>
			{action ? (
				<Link
					href={action.href}
					className="mt-3 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				>
					{action.label}
				</Link>
			) : null}
		</div>
	);
}
