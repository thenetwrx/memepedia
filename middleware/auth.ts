export default defineNuxtRouteMiddleware((context) => {
  const user = useSupabaseUser();

  if (user.value === null) {
    return navigateTo("/auth");
  }
});
