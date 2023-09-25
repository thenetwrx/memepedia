import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  let limit: number = 100;

  const client = await serverSupabaseClient(event);

  const { data, error } = await client.storage
    .from("memes")
    .list("", { limit: limit });
  const temp: {
    source_url: string;
    id: string;
    mimetype: string;
    author: { id: string; username: string };
  }[] = [];

  if (data) {
    for (const meme of data) {
      const urlResponse = await client.storage
        .from("memes")
        .createSignedUrl(meme.name, 60);

      const signedUrl = urlResponse.data?.signedUrl;

      if (signedUrl) {
        try {
          temp.push({
            source_url: signedUrl,
            id: meme.id,
            mimetype: meme.metadata.mimetype,
            author: {
              id: "ee",
              username: "ee",
            },
          });
        } catch (error) {
          return { error_message: "Error loading image: " + error };
        }
      }
    }
    return temp[Math.floor(Math.random() * temp.length)];
  }
  return { error_message: "Unable to fetch images" };
});
