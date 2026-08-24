export function SectionHeader({
	eyebrow,
	title,
	size = "lg",
}: {
	eyebrow: string;
	title: string;
	size?: "lg" | "sm";
}) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-3">
				<span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-accent" />
				<span className="text-sm font-medium uppercase tracking-widest text-accent">
					{eyebrow}
				</span>
			</div>
			<h2
				className={
					size === "sm"
						? "text-2xl font-bold sm:text-3xl"
						: "text-3xl font-bold sm:text-4xl"
				}
			>
				{title}
			</h2>
		</div>
	);
}
