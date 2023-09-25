<script setup lang="ts">
const client = useSupabaseClient();
const user = useSupabaseUser();

useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css",
    },
    {
      rel: "stylesheet",
      href: "https://site-assets.fontawesome.com/releases/v6.4.2/css/sharp-regular.css",
    },
    {
      rel: "stylesheet",
      href: "https://site-assets.fontawesome.com/releases/v6.4.2/css/sharp-solid.css",
    },
  ],
  title: "Memepedia",
  meta: [
    {
      name: "description",
      content: "Find the funniest memes and submit your own!",
    },
  ],
  bodyAttrs: {
    class: "test",
  },
  script: [{ innerHTML: "console.log('Hello world')" }],
});
</script>

<template>
  <div data-theme="dark" class="min-h-screen">
    <div class="navbar bg-base-300">
      <div class="navbar-start">
        <div class="dropdown">
          <label tabindex="0" class="btn btn-ghost swap swap-rotate">
            <!-- hamburger icon -->
            <svg
              class="swap-off fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 512 512"
            >
              <path
                d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z"
              />
            </svg>
          </label>
          <ul
            tabindex="0"
            class="menu menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52 gap-1"
          >
            <li>
              <NuxtLink href="/memes"
                ><i class="fa-sharp fa-regular fa-books"></i>
                Memepedia</NuxtLink
              >
            </li>
            <li>
              <NuxtLink href="/profile"
                ><i class="fa-sharp fa-regular fa-square-user"></i>
                Contribute</NuxtLink
              >
            </li>
            <li>
              <NuxtLink href="/app"
                ><i class="fa-sharp fa-regular fa-mobile"></i> Mobile
                App</NuxtLink
              >
            </li>
          </ul>
        </div>
        <NuxtLink class="btn btn-ghost normal-case" href="/"
          ><i class="fa-sharp fa-regular fa-house"></i> Home</NuxtLink
        >
      </div>
      <div class="navbar-center"></div>
      <div class="navbar-end">
        <button
          class="btn btn-ghost"
          v-if="user"
          @click="
            client.auth.signOut().then(() => {
              reloadNuxtApp();
            })
          "
        >
          <i class="fa-sharp fa-regular fa-arrow-right-from-bracket"></i> Logout
        </button>
        <button class="btn btn-ghost" v-else @click="navigateTo('/auth')">
          <i class="fa-sharp fa-regular fa-arrow-right-to-bracket"></i> Login
        </button>
      </div>
    </div>
    <slot />
  </div>
</template>
