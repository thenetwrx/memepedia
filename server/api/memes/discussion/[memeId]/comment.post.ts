import auth from "../../../../auth";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  await auth(event);

  const memeId = getRouterParam(event, "memeId");
  const body = JSON.parse(await readBody(event));

  if (!body.comment)
    throw createError({
      statusCode: 400,
      message: "Missing comment in body",
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

  const { data, error } = await supabase
    .schema("public")
    .from("discussions")
    .select("*")
    .eq("meme_id", memeId);

  if (error) {
    return {
      error: error.message,
    };
  }

  const existingComments = data[0].comments;
  existingComments.push({
    comment: body.comment,
    author: { id: user.id, username: user.user_metadata.username },
  });

  const result = await supabase
    .schema("public")
    .from("discussions")
    .update({ comments: existingComments })
    .eq("meme_id", memeId);

  return result.error ? result.error : { success_message: "Posted comment" };
});
