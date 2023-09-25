import auth from "../../../../auth";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  await auth(event);

  const memeId = getRouterParam(event, "memeId");
  const body = JSON.parse(await readBody(event));

  if (!body.state)
    throw createError({
      statusCode: 400,
      message: "Missing vote in body",
    });

  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
  const user = await serverSupabaseUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });

  //const data = { meme_id: slug } as { meme_id: string };
  let data: any | null = null;
  let error: any | null = null;

  const find = await supabase
    .schema("public")
    .from("discussions")
    .select("*")
    .eq("meme_id", memeId);

  data = find.data;
  error = find.error;

  if (!data || !data.length) {
    await supabase
      .schema("public")
      .from("discussions")
      .insert({ comments: [], meme_id: memeId, upvotes: [], downvotes: [] });

    const find_creation = await supabase
      .schema("public")
      .from("discussions")
      .select("*")
      .eq("meme_id", memeId);

    data = find_creation.data;
    error = find_creation.error;
  }

  if (!data || !data.length)
    throw createError({
      statusCode: 400,
      message: "No data available",
    });

  let existingUpvotes = data[0].upvotes;
  let existingDownvotes = data[0].downvotes;
  if (body.state === "up") {
    const existingDownvote = existingDownvotes.findIndex(
      (vote: any) => vote.id === user.id
    );
    if (existingDownvote !== -1) {
      existingDownvotes = existingDownvotes.splice(0, existingDownvote);
    }

    const existingUpvote = existingUpvotes.findIndex(
      (vote: any) => vote.id === user.id
    );
    if (existingUpvote !== -1) {
      existingUpvotes = existingUpvotes.splice(0, existingUpvote);
    } else
      existingUpvotes.push({
        id: user.id,
        username: user.user_metadata.username,
      });
  }
  if (body.state === "down") {
    const existingUpvote = existingUpvotes.findIndex(
      (vote: any) => vote.id === user.id
    );
    if (existingUpvote !== -1) {
      existingUpvotes = existingUpvotes.splice(0, existingUpvote);
    }

    const existingDownvote = existingDownvotes.findIndex(
      (vote: any) => vote.id === user.id
    );
    if (existingDownvote !== -1) {
      existingDownvotes = existingDownvotes.splice(0, existingDownvote);
    } else
      existingDownvotes.push({
        id: user.id,
        username: user.user_metadata.username,
      });
  }
  if (body.state === "neutral") {
    const existingUpvote = existingUpvotes.findIndex(
      (vote: any) => vote.id === user.id
    );
    if (existingUpvote !== -1) existingDownvotes.splice(0, existingUpvote);
    const existingDownvote = existingDownvotes.findIndex(
      (vote: any) => vote.id === user.id
    );
    if (existingDownvote !== -1) existingDownvotes.splice(0, existingDownvote);
  }

  const result = await supabase
    .schema("public")
    .from("discussions")
    .update({ upvotes: existingUpvotes, downvotes: existingDownvotes })
    .eq("meme_id", memeId);

  return result.error ? result.error : { success_message: "Updated vote" };
});
