import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "request body must be valid JSON" }, { status: 400 });
  }

  const { restaurantId, rating, comment } = (body ?? {}) as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // 1. rating must be an integer from 1 to 5
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return Response.json(
      { error: "rating must be an integer from 1 to 5" },
      { status: 400 },
    );
  }

  // 2. comment must be a non-empty string after trimming whitespace
  if (typeof comment !== "string" || comment.trim() === "") {
    return Response.json(
      { error: "comment must not be empty" },
      { status: 400 },
    );
  }

  // 3. restaurantId must refer to a restaurant that exists
  const restaurantRows = await sql.query(
    "SELECT id FROM restaurants WHERE id = $1",
    [restaurantId],
  );

  if (restaurantRows.length === 0) {
    return Response.json(
      { error: "restaurant does not exist" },
      { status: 400 },
    );
  }

  const inserted = await sql.query(
    "INSERT INTO reviews (restaurant_id, rating, comment) VALUES ($1, $2, $3) RETURNING id",
    [restaurantId, rating, comment],
  );

  return Response.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 },
  );
}