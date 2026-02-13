"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type Item = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isActive?: boolean;
};

type Booking = {
  id: string;
  qty: number;
  customerName: string;
  phone: string;
  fulfillment: string;
  note: string | null;
  createdAt: string;
  item: { id: string; name: string };
};

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    const itemsRes = await fetch("/api/items", { cache: "no-store" });
    const itemsData = await itemsRes.json();
    setItems(itemsData.items ?? []);

    const bookingsRes = await fetch("/api/bookings", { cache: "no-store" });
    if (bookingsRes.ok) {
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.bookings ?? []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createItem() {
    setStatus(null);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined, priceCents }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setStatus(data?.error?.message ?? "Failed to create item");
      return;
    }

    setName("");
    setDescription("");
    setPriceCents(0);
    setStatus("Item created");
    await load();
  }

  async function updateItem(id: string, patch: Partial<Item>) {
    const res = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      setStatus("Failed to update item");
      return;
    }
    setStatus("Item updated");
    await load();
  }

  async function deleteItem(id: string) {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setStatus("Failed to delete item");
      return;
    }
    setStatus("Item deleted");
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-zinc-600">Manage items and see bookings.</p>
        </div>
        <div className="flex gap-2">
          <a className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold" href="/">
            Customer View
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Create Item</h2>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Price (cents)" type="number" value={priceCents} onChange={(e) => setPriceCents(Number(e.target.value))} />
          <input className="md:col-span-2 rounded-lg border px-3 py-2 text-sm" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button
            onClick={createItem}
            disabled={!name || priceCents <= 0}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Create
          </button>
          {status ? <div className="self-center text-sm text-zinc-700">{status}</div> : null}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Items</h2>
        <div className="mt-3 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[240px]">
                  <div className="font-semibold">{it.name}</div>
                  {it.description ? <div className="text-sm text-zinc-600">{it.description}</div> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="w-28 rounded-lg border px-3 py-2 text-sm"
                    type="number"
                    defaultValue={it.priceCents}
                    onBlur={(e) => updateItem(it.id, { priceCents: Number(e.target.value) })}
                  />
                  <button onClick={() => deleteItem(it.id)} className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Latest Bookings</h2>
        <div className="mt-3 space-y-3">
          {bookings.length === 0 ? (
            <div className="text-sm text-zinc-600">No bookings yet.</div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="rounded-xl border p-3">
                <div className="font-semibold">{b.item.name} × {b.qty}</div>
                <div className="text-sm text-zinc-600">
                  {b.customerName} • {b.phone} • {b.fulfillment}
                </div>
                {b.note ? <div className="mt-1 text-sm text-zinc-700">{b.note}</div> : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
