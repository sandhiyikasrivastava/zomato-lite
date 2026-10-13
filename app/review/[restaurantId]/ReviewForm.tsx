"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RestaurantResponse = { name: string };

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Okay",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

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
    <main className="mx-auto max-w-[560px] px-5 py-10 sm:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Write a review
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-950">
          {restaurantName ?? "Loading..."}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Your feedback helps others choose where to eat.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-base font-semibold text-stone-900">Your rating</p>
            <p className="text-sm text-stone-500">
              {rating === null
                ? "Select 1–5 stars"
                : `${rating} of 5 · ${RATING_LABELS[rating]}`}
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const selected = rating !== null && value <= rating;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  className={`h-12 w-12 rounded-lg text-2xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                    selected
                      ? "bg-amber-500 text-white shadow-sm"
                      : "border-2 border-stone-200 bg-white text-stone-300 hover:border-amber-300 hover:text-amber-300"
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <label
            htmlFor="comment"
            className="mb-2 block text-base font-semibold text-stone-900"
          >
            Your comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            placeholder="What stood out? Be specific."
            className="w-full resize-y rounded-lg border-2 border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="mt-2 text-xs text-stone-500">
            Tip: empty or whitespace-only comments are rejected.
          </p>
        </section>

        {error ? (
          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:hover:bg-stone-300"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}