import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
};

function toIso(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return Response.json({ error: "restaurant not found" }, { status: 404 });
  }

  const restaurantRows = await sql.query(
    "SELECT name, cuisine, area FROM restaurants WHERE id = $1",
    [restaurantId],
  );

  if (restaurantRows.length === 0) {
    return Response.json({ error: "restaurant not found" }, { status: 404 });
  }

  const restaurant = restaurantRows[0] as {
    name: string;
    cuisine: string;
    area: string;
  };

  const statsRows = await sql.query(
    "SELECT AVG(rating) AS average_rating, COUNT(*)::int AS total_reviews FROM reviews WHERE restaurant_id = $1",
    [restaurantId],
  );
  const stats = statsRows[0] as {
    average_rating: string | number | null;
    total_reviews: number;
  };

  const averageRating =
    stats.average_rating === null
      ? null
      : Math.round(Number(stats.average_rating) * 10) / 10;

  const reviewRows = (await sql.query(
    "SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC, id DESC",
    [restaurantId],
  )) as ReviewRow[];

  const formattedReviews = reviewRows.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: toIso(row.created_at),
  }));

  const latestReview = formattedReviews[0] ?? null;
  const reviews = formattedReviews.slice(1);

  return Response.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews: stats.total_reviews,
    latestReview,
    reviews,
  });
}