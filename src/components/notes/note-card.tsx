import Image from "next/image";
import Link from "next/link";
import { Card } from "@heroui/react/card";
import type { NoteItem } from "./notes-view";

export function NoteCard({ item }: { item: NoteItem }) {
	return (
		<Card variant="default" className="h-full overflow-hidden">
			<Link href={item.href} className="group flex h-full gap-3 p-3">
				<div className="relative aspect-[2/3] w-20 shrink-0 self-start overflow-hidden rounded-lg bg-default">
					{item.imageUrl ? (
						<Image
							src={item.imageUrl}
							alt={item.title}
							fill
							sizes="80px"
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center p-1 text-center text-[10px] text-muted">
							{item.title}
						</div>
					)}
				</div>
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<span className="line-clamp-1 text-sm font-medium text-foreground group-hover:underline">
						{item.title}
					</span>
					<span className="line-clamp-1 text-xs text-muted">{item.subtitle}</span>
					<p className="line-clamp-3 text-sm text-foreground/80">{item.note}</p>
				</div>
			</Link>
		</Card>
	);
}
