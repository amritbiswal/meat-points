"use client";

import { useState } from "react";

type Item = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
};

function formatINR(cents: number) {
  const rupees = cents / 100;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(rupees);
}

export default function ItemCard({ item }: { item: Item }) {
  const [qty, setQty] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submitBooking() {
    setStatus(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, qty, customerName, phone, fulfillment, note: note || undefined }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setStatus(data?.error?.message ?? "Booking failed");
      return;
    }

    const data = await res.json();
    setStatus(`Booked! Your booking id: ${data.booking.id}`);
    setCustomerName("");
    setPhone("");
    setQty(1);
    setNote("");
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{item.name}</div>
          {item.description ? <div className="mt-1 text-sm text-zinc-600">{item.description}</div> : null}
        </div>
        <div className="text-right font-semibold">{formatINR(item.priceCents)}</div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-zinc-700">Qty</label>
          <input
            type="number"
            min={1}
            max={50}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(50, Number(e.target.value))))}
            className="w-20 rounded-lg border px-3 py-2 text-sm"
          />

          <select
            value={fulfillment}
            onChange={(e) => setFulfillment(e.target.value as any)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="PICKUP">Pickup</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>

        <input
          placeholder="Your name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[80px] rounded-lg border px-3 py-2 text-sm"
        />

        <button
          onClick={submitBooking}
          disabled={!customerName || !phone}
          className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Book Item
        </button>

        {status ? <div className="text-sm text-zinc-700">{status}</div> : null}
      </div>
    </div>
  );
}
