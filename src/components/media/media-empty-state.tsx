export function MediaEmptyState({
	title = "No trending media",
	message = "Nothing to show right now.",
}: {
	title?: string;
	message?: string;
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-6 py-12 text-center">
			<p className="text-sm font-medium text-foreground">{title}</p>
			<p className="text-sm text-muted">{message}</p>
		</div>
	);
}
