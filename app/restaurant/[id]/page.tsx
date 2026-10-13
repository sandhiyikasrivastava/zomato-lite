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
      <main className="mx-auto max-w-[560px] px-5 py-16">
        <div className="rounded-lg border border-stone-300 bg-stone-100 px-5 py-6">
          <h1 className="text-lg font-semibold text-stone-900">
            Restaurant not found
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            {error}. Go back and try another id.
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-[560px] px-5 py-16">
        <div className="space-y-3">
          <div className="h-8 w-2/3 animate-pulse rounded bg-stone-200" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
          <div className="mt-6 h-20 w-1/2 animate-pulse rounded bg-stone-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[560px] px-5 py-10 sm:py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          {data.name}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-stone-600">
          <span>{data.cuisine}</span>
          <span className="text-stone-400">·</span>
          <span>{data.area}</span>
        </p>
      </header>

      <section className="mt-8 flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white px-6 py-6">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Average rating
        </span>
        <div className="flex items-end gap-3">
          <span className="text-6xl font-semibold leading-none text-stone-900 tabular-nums">
            {data.averageRating === null ? "—" : data.averageRating}
          </span>
          <span className="pb-1 text-sm text-stone-600">
            out of 5
          </span>
        </div>
        <span className="mt-1 text-sm text-stone-500">
          {data.totalReviews} review
          {data.totalReviews === 1 ? "" : "s"}
        </span>
      </section>

      {data.totalReviews === 0 ? (
        <section className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center">
          <p className="text-lg font-medium text-stone-900">
            No reviews yet
          </p>
          <p className="mt-2 text-sm text-stone-600">
            Be the first to tell people what to order here.
          </p>
          <Link
            href={`/review/${id}`}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Write the first review
          </Link>
        </section>
      ) : (
        <>
          {data.latestReview ? (
            <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                  Latest
                </span>
                <span className="text-xs text-stone-600">
                  {data.latestReview.createdAt}
                </span>
              </div>
              <p className="text-sm font-medium text-stone-900">
                {data.latestReview.rating} out of 5
              </p>
              <p className="mt-2 leading-relaxed text-stone-800">
                {data.latestReview.comment}
              </p>
            </section>
          ) : null}

          {data.reviews.length > 0 ? (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-500">
                Older reviews
              </h2>
              <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                {data.reviews.map((review) => (
                  <li key={review.id} className="px-5 py-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-stone-900">
                        {review.rating} out of 5
                      </span>
                      <span className="text-xs text-stone-500">
                        {review.createdAt}
                      </span>
                    </div>
                    <p className="mt-1 leading-relaxed text-stone-800">
                      {review.comment}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <div className="mt-8">
        <Link
          href={`/review/${id}`}
          className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          + Write a review
        </Link>
      </div>
    </main>
  );
}