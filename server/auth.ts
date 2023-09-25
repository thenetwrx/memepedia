import { serverSupabaseUser } from "#supabase/server";

// If the user does not exist on the request, throw a 401 error
export default eventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event);
  } catch (e) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
});
