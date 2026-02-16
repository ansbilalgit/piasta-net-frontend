// app/playground/page.tsx
import { GameCard } from "@/app/components/Card";

interface ApiItem {
    id: number;
    name: string;
    length: number;
    description: string;
    thumbnail: string;
    type: number;
    copies: number;
    categories: string[];
}

interface ApiResponse {
    page: number;
    pageSize: number;
    totalCount: number;
    items: ApiItem[];
}

export default async function Playground() {
    const response = await fetch("https://piasta-net-app.azurewebsites.net/api/Items?page=1&pageSize=20", {
        cache: "no-store"
    });

    if (!response.ok) {
        return <div className="p-10 text-red-500">Failed to load items from the API.</div>;
    }

    const data: ApiResponse = await response.json();
    const items = data.items;

    return (
        <div className="p-10 flex flex-col gap-5 items-start">
            <h1 className="text-3xl font-bold text-white mb-4">Component Playground</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {items.map((item) => {
                    // Replaced spaces with actual new lines (\n) so paragraphs look nice in the pop-up
                    const cleanDescription = item.description.replace(/&#10;/g, '\n').trim();

                    return (
                        <GameCard
                            key={item.id}
                            title={item.name}
                            category={item.categories.length > 0 ? item.categories[0] : "General"}
                            description={cleanDescription} // <--- Passing the FULL text now
                            thumbnail={item.thumbnail}
                            players="Various"
                            duration={`${item.length} min`}
                        />
                    );
                })}
            </div>
        </div>
    );
}