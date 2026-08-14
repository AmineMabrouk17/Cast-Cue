import { NoteCard } from "./note-card";

export interface NoteItem {
	href: string;
	title: string;
	subtitle: string;
	imageUrl: string | null;
	note: string;
}

export function NotesView({ items }: { items: NoteItem[] }) {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{items.map((item) => (
				<NoteCard key={item.href} item={item} />
			))}
		</div>
	);
}
