"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

export default function RestaurantPage() {
  const params = useParams();
  const id = String(params.id);

  const [data, setData] = useState<RestaurantData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/restaurants/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            typeof body.error === "string" ? body.error : "Not found",
          );
        }
        return res.json() as Promise<RestaurantData>;
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Not found");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-16">
        <p className="text-stone-700">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-16">
        <p className="text-stone-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[560px] px-6 py-16">
      <header>
        <h1 className="text-2xl font-semibold text-stone-900">{data.name}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {data.cuisine} · {data.area}
        </p>
      </header>

      <section className="mt-10">
        <p className="text-6xl font-semibold leading-none text-stone-900 tabular-nums">
          {/* The value printed here is the averageRating handed to us by the API; nothing is calculated in this file. */}
          {data.averageRating === null ? "—" : data.averageRating}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
        </p>
      </section>

      {data.totalReviews === 0 ? (
        <section className="mt-10 rounded-md border border-dashed border-stone-300 px-6 py-12 text-center">
          <p className="text-stone-700">No reviews yet.</p>
          <p className="mt-1 text-sm text-stone-500">
            Be the first to leave one.
          </p>
          <Link
            href={`/review/${id}`}
            className="mt-4 inline-block text-sm font-medium text-amber-700 underline"
          >
            Write a review
          </Link>
        </section>
      ) : (
        <>
          {data.latestReview ? (
            <section className="mt-10 rounded-xl bg-stone-100 p-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500">
                Latest review
              </p>
              <p className="text-sm font-medium text-stone-900">
                {data.latestReview.rating}/5
              </p>
              <p className="mt-2 text-stone-800">
                {data.latestReview.comment}
              </p>
              <p className="mt-2 text-xs text-stone-500">
                {data.latestReview.createdAt}
              </p>
            </section>
          ) : null}

          {data.reviews.length > 0 ? (
            <ul className="mt-6 divide-y divide-stone-200">
              {data.reviews.map((review) => (
                <li key={review.id} className="py-4">
                  <p className="text-sm font-medium text-stone-900">
                    {review.rating}/5
                  </p>
                  <p className="mt-1 text-stone-800">{review.comment}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {review.createdAt}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}

      <div className="mt-10">
        <Link
          href={`/review/${id}`}
          className="text-sm font-medium text-amber-700 underline"
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}