import auth from "../../auth";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  await auth(event);

  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      message: "No user authenticated",
    });

  const formdata = await readMultipartFormData(event);

  const file = formdata?.find((item) => item.name === "file");

  if (!user)
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });

  if (
    user.user_metadata.username === null ||
    user.user_metadata.username === ""
  )
    throw createError({
      statusCode: 500,
      message: "Malformed user metadata",
    });

  if (!file)
    throw createError({
      statusCode: 400,
      message: "Missing file for upload",
    });

  const blob = new Blob([file.data], { type: file.type });

  const { data, error } = await client.storage
    .from("memes")
    .upload(`${Date.now()}`, blob);
  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }

  return data;

  //   const client = await serverSupabaseClient(event);

  //   const { data, error } = await client.storage
  //     .from("memes")
  //     .list("");
  //   const temp: { source_url: string; mimetype: string; author: string }[] = [];

  //   if (data) {
  //     for (const meme of data) {
  //       const urlResponse = await client.storage
  //         .from("memes")
  //         .createSignedUrl(meme.name, 60);

  //       const signedUrl = urlResponse.data?.signedUrl;

  //       if (signedUrl) {
  //         try {
  //           temp.push({
  //             source_url: signedUrl,
  //             mimetype: meme.metadata.mimetype,
  //             author: "billy",
  //           });
  //         } catch (error) {
  //           return { error_message: "Error loading image: " + error };
  //         }
  //       }
  //     }
  //     return temp;
  //   }
  //   return { error_message: "Unable to fetch images" };
});
