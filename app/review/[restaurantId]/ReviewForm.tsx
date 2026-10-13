"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RestaurantResponse = { name: string };

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: RestaurantResponse | null) => {
        if (!cancelled && data) setRestaurantName(data.name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === null || comment.trim() === "") return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong",
        );
        return;
      }
      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    rating !== null && comment.trim() !== "" && !submitting;

  return (
    <main className="mx-auto max-w-[560px] px-6 py-16">
      <h1 className="text-2xl font-semibold text-stone-900">
        {restaurantName ?? "Loading..."}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Leave a review for this restaurant.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium text-stone-700">
            Your rating
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const selected = rating !== null && value <= rating;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  className={`rounded-md px-3 py-2 text-xl transition-colors ${
                    selected
                      ? "bg-amber-700 text-white"
                      : "bg-stone-200 text-stone-400 hover:bg-stone-300"
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-stone-500"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </main>
  );
}