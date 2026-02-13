import ItemCard from "@/components/Item-card";

type Item = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
};

async function getItems(): Promise<Item[]> {
  const res = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/items`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.items;
}

export default async function HomePage() {
  const items = await getItems();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meat Point</h1>
          <p className="mt-1 text-sm text-zinc-600">Browse items and book without login.</p>
        </div>
        <a
          href="/admin"
          className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold"
        >
          Admin
        </a>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
