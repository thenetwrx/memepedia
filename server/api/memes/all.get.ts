import auth from "../../auth";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  await auth(event);

  const query = getQuery(event);
  let limit: number = 100;
  let offset: number = 0;
  if (typeof query.limit === "string") limit = +query.limit;
  if (typeof query.offset === "string") offset = +query.offset;

  const client = await serverSupabaseClient(event);
  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  const { data, error } = await client.storage
    .from("memes")
    .list("", { limit: limit, offset: offset });
  const temp: {
    source_url: string;
    id: string;
    mimetype: string;
    discussion: any;
    author: { id: string; username: string };
  }[] = [];

  if (!data || !data.length) return { data: [], reached_end: true };

  for (const meme of data) {
    const meme_metadata = await supabase
      .schema("storage")
      .from("objects")
      .select("*")
      .eq("id", meme.id);

    if (!meme_metadata || !meme_metadata.data?.length) continue;

    const meme_metadata_owner_username = (
      await supabase.auth.admin.getUserById(meme_metadata.data[0].owner)
    ).data.user?.user_metadata.username;

    if (!meme_metadata_owner_username) continue;

    const urlResponse = await client.storage
      .from("memes")
      .createSignedUrl(`${meme.name}`, 60);

    let data = null;
    let error = null;

    const find = await supabase
      .schema("public")
      .from("discussions")
      .select("*")
      .eq("meme_id", meme.id);

    data = find.data;
    error = find.error;

    if (!data || !data.length) {
      await supabase.schema("public").from("discussions").insert({
        comments: [],
        meme_id: meme.id,
        upvotes: [],
        downvotes: [],
      });

      const find_creation = await supabase
        .schema("public")
        .from("discussions")
        .select("*")
        .eq("meme_id", meme.id);

      data = find_creation.data;
      error = find_creation.error;
    }

    if (!data || !data.length) continue;

    const signedUrl = urlResponse.data?.signedUrl;

    if (signedUrl) {
      try {
        temp.push({
          source_url: signedUrl,
          id: meme.id,
          mimetype: meme.metadata.mimetype,
          discussion: data[0],
          author: {
            id: meme_metadata.data[0].owner,
            username: meme_metadata_owner_username,
          },
        });
      } catch (error) {
        return { error_message: "Error loading image: " + error };
      }
    }
  }
  return { data: temp, reached_end: limit !== temp.length };
});
