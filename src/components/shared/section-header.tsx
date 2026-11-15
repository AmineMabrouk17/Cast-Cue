export function SectionHeader({
	title,
	size = "lg",
}: {
	title: string;
	size?: "lg" | "sm";
}) {
	return (
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
		</div>
	);
}
