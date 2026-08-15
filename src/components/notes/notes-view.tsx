import { MediaEmptyState } from "@/components/media/media-empty-state";
import { NoteCard } from "./note-card";

export interface NoteItem {
	href: string;
	title: string;
	subtitle: string;
	imageUrl: string | null;
	note: string;
}

export function NotesView({ items }: { items: NoteItem[] }) {
	if (items.length === 0) {
		return (
			<MediaEmptyState
				title="No notes yet"
				message="Write a private note on any bookmarked movie, series, or episode and it will show up here."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{items.map((item) => (
				<NoteCard key={item.href} item={item} />
			))}
		</div>
	);
}
