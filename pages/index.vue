<script>
export default {
  data() {
    return {
      mediaSrc: null,
      isImage: false,
    };
  },
  mounted() {
    // Automatically fetch the media when the component is mounted
    this.fetchMedia();
  },
  methods: {
    async fetchMedia() {
      this.isImage = true;
      try {
        this.mediaSrc = "";
        const response = await fetch("/api/memes/random"); // Replace with your API endpoint
        if (response.status === 200) {
          const text = await response.text();
          const body = JSON.parse(text);

          this.mediaSrc = body.source_url;
          if (body.mimetype.startsWith("image")) {
            this.isImage = true;
          } else this.isImage = false;
        } else {
          console.error("Failed to fetch media:", response.status);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
      }
    },
  },
};
</script>

<template>
  <div>
    <div class="container mx-auto px-2 pt-2">
      <div class="hero">
        <div class="hero-content flex-col lg:flex-row-reverse">
          <div
            class="flex flex-col justify-center items-center lg:items-start lg:flex-row-reverse"
          >
            <div class="flex flex-col">
              <div>
                <img
                  :src="mediaSrc"
                  class="min-w-full rounded-lg shadow-2xl lg:mr-4"
                  :class="!isImage ? 'hidden' : ''"
                  width="192"
                />
                <video
                  autoplay="true"
                  muted="true"
                  loop="true"
                  :src="mediaSrc"
                  class="min-w-full rounded-lg shadow-2xl lg:mr-4"
                  :class="isImage ? 'hidden' : ''"
                  controls
                  width="192"
                ></video>
              </div>
              <div class="text-center mt-2">
                <button class="btn btn-secondary btn-sm" @click="fetchMedia">
                  Regenerate
                </button>
              </div>
            </div>
            <div>
              <h1 class="text-5xl font-bold">The Memepedia</h1>
              <p class="py-6 max-w-xl">
                Provident cupiditate voluptatem et in. Quaerat fugiat ut
                assumenda excepturi exercitationem quasi. In deleniti eaque aut
                repudiandae et a id nisi.
              </p>
              <NuxtLink class="btn btn-primary" href="/memes"
                >See the memes!</NuxtLink
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
