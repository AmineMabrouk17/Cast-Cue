"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@heroui/react/tabs";

export interface SearchTabMeta {
	id: string;
	label: string;
	count: number;
}

export function SearchTabs({
	tabs,
	initialTab,
	panels,
}: {
	tabs: SearchTabMeta[];
	initialTab: string;
	panels: Record<string, ReactNode>;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const requested = searchParams.get("tab");
	const selected = tabs.some((tab) => tab.id === requested) ? requested! : initialTab;

	function selectTab(key: string) {
		const params = new URLSearchParams(searchParams);
		params.set("tab", key);
		router.replace(`/search?${params.toString()}`, { scroll: false });
	}

	return (
		<Tabs className="w-full" selectedKey={selected} onSelectionChange={(key) => {
			if (typeof key === "string") selectTab(key);
		}}>
			<Tabs.ListContainer>
				<p className="pb-2 text-xs text-muted">
					Showing the first 20 matches per type from TMDB.
				</p>
				<Tabs.List aria-label="Search results">
					{tabs.map((tab) => (
						<Tabs.Tab key={tab.id} id={tab.id}>
							{tab.label} ({tab.count})
							<Tabs.Indicator />
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs.ListContainer>
			{tabs.map((tab) => (
				<Tabs.Panel key={tab.id} className="pt-6" id={tab.id}>
					{panels[tab.id]}
				</Tabs.Panel>
			))}
		</Tabs>
	);
}
