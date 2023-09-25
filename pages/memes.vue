<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <div data-theme="dark">
    <div class="container mx-auto px-2 pt-2">
      <div class="flex justify-center items-center">
        <p v-if="loading" class="text-4xl">
          <i class="fa-sharp fa-regular fa-spinner-third fa-spin"></i>
        </p>
        <div class="grid grid-cols-1 gap-4">
          <div v-for="meme in memes">
            <dialog :id="meme.id" class="modal">
              <div class="modal-box">
                <form method="dialog">
                  <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  >
                    ✕
                  </button>
                </form>
                <h3 class="font-bold text-lg mb-4">
                  Discuss {{ meme?.author?.username || "unknown" }}'s meme
                </h3>
                <div class="flex flex-col">
                  <div
                    class="grid grid-cols-1 gap-4"
                    v-for="discussion in meme.discussion.comments"
                  >
                    <p class="text-sm">
                      <span class="text-white">{{
                        discussion.author?.username
                      }}</span>
                      {{ discussion.comment || "unknown comment" }}
                    </p>
                  </div>
                  <!-- <p v-if="!current_meme_discussion">Unable to fetch discussion</p> -->
                  <p v-if="!meme.discussion.comments.length">
                    No comments yet, start the party!
                  </p>
                </div>
                <form
                  class="flex flex-row justify-between w-full join mt-4"
                  @submit.prevent="postComment(meme)"
                >
                  <input
                    type="text"
                    placeholder="Your comment"
                    class="input input-sm input-bordered join-item flex-grow"
                    v-model="comment"
                  />
                  <button
                    class="btn btn-primary btn-sm join-item flex-grow"
                    :class="sending_comment ? 'btn-disabled' : ''"
                  >
                    <i
                      class="fa-sharp fa-light fa-paper-plane"
                      :class="sending_comment ? 'fa-fade' : ''"
                    ></i>
                    Send
                  </button>
                </form>
              </div>
            </dialog>
            <div
              class="bg-base-300 lg:w-[580px] shadow-xl rounded-xl flex flex-col items-center justify-center"
            >
              <div class="flex-grow flex items-center">
                <div class="flex flex-col items-center">
                  <img
                    :src="meme.source_url"
                    class="rounded-t-lg shadow-2xl mb-3"
                    :class="!meme.mimetype.startsWith('image') ? 'hidden' : ''"
                  />
                  <video
                    autoplay="true"
                    muted="true"
                    loop="true"
                    :src="meme.source_url"
                    class="rounded-t-lg shadow-2xl mb-3"
                    :class="meme.mimetype.startsWith('image') ? 'hidden' : ''"
                    controls
                  ></video>
                </div>
              </div>

              <div class="flex items-center w-full px-4 pb-4 gap-2">
                <h2 class="mr-auto mb-0 card-title">
                  By {{ meme.author.username || "unknown" }}
                </h2>
                <div class="join">
                  <button
                    class="btn btn-primary join-item btn-sm"
                    @click="changeUpvote(meme)"
                  >
                    <i
                      class="fa-sharp fa-regular fa-up"
                      :class="meme.discussion.upvotes.find((vote:any) => vote.id === user?.id) ? 'fa-solid' : ''"
                    ></i>
                    {{ meme.discussion.upvotes.length }}
                  </button>
                  <button
                    class="btn btn-primary join-item btn-sm"
                    @click="changeDownvote(meme)"
                  >
                    <i
                      class="fa-sharp fa-regular fa-down"
                      :class="meme.discussion.downvotes.find((vote:any) => vote.id === user?.id) ? 'fa-solid' : ''"
                    ></i>
                    {{ meme.discussion.downvotes.length }}
                  </button>
                </div>
                <button
                  class="btn btn-primary btn-sm"
                  @click="showDiscussion(meme)"
                >
                  <i class="fa-sharp fa-regular fa-comments"></i>
                  Discuss ({{ meme.discussion.comments.length }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-10 pb-6">
        <p v-if="!loading && reached_end">Looks like you've reached the end!</p>
        <button
          v-if="!loading && !reached_end"
          @click="loadMore"
          class="btn btn-primary"
          :class="reached_end ? 'btn-disabled' : ''"
        >
          <i
            class="fa-sharp fa-regular fa-spinner-third fa-spin"
            v-if="loading_more"
          ></i>
          Load More
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const user = useSupabaseUser();

export default {
  async unmounted() {
    loading.value = true;
    loading_more.value = false;
    reached_end.value = false;
    sending_comment.value = false;
    memes.value = [];
  },
  async mounted() {
    try {
      const response = await fetch("/api/memes/all?limit=3"); // Replace with your API endpoint
      if (response.status === 200) {
        const text = await response.text();
        const body = JSON.parse(text);

        body.data.map((meme: any) => {
          memes.value.push(meme);
        });
        reached_end.value = body.reached_end;
      } else {
        console.error("Failed to fetch memes:", response.status);
      }
    } catch (error) {
      console.error("Error fetching memes:", error);
    }
    loading.value = false;
  },
};

const memes: Ref<
  {
    source_url: string;
    id: string;
    mimetype: string;
    discussion: any;
    author: any;
  }[]
> = ref([]);
const loading: Ref<boolean> = ref<boolean>(true);
const loading_more: Ref<boolean> = ref<boolean>(false);
const reached_end: Ref<boolean> = ref<boolean>(false);

const comment: Ref<string | null> = ref<string | null>(null);
const sending_comment: Ref<boolean> = ref<boolean>(false);

const postComment = async (meme: any) => {
  sending_comment.value = true;
  const response = await fetch(
    "/api/memes/discussion/" + meme.id + "/comment",
    {
      method: "POST",
      body: JSON.stringify({
        comment: comment.value,
      }),
    }
  ); // Replace with your API endpoint
  if (response.status === 200) {
  } else {
    console.error("Failed to post comment:", response.status);
  }
  comment.value = null;
  sending_comment.value = false;
  await refetchMeme(meme, false);
};

const changeUpvote = async (meme: any) => {
  const response = await fetch("/api/memes/discussion/" + meme.id + "/vote", {
    method: "POST",
    body: JSON.stringify({
      state: "up",
    }),
  }); // Replace with your API endpoint
  if (response.status === 200) {
  } else {
    console.error("Failed to post comment:", response.status);
  }
  await refetchMeme(meme, false);
};

const changeDownvote = async (meme: any) => {
  const response = await fetch("/api/memes/discussion/" + meme.id + "/vote", {
    method: "POST",
    body: JSON.stringify({
      state: "down",
    }),
  }); // Replace with your API endpoint
  if (response.status === 200) {
    //await refreshVotes();
  } else {
    console.error("Failed to downvote meme:", response.status);
  }
  await refetchMeme(meme, false);
};

const refetchMeme = async (meme: any, also_source: boolean) => {
  const index = memes.value.findIndex((_meme) => _meme.id === meme.id);
  try {
    const response = await fetch("/api/memes/all?limit=1&offset=" + index); // Replace with your API endpoint
    if (response.status === 200) {
      const text = await response.text();
      const body = JSON.parse(text);

      body.data.map((meme: any) => {
        if (also_source) memes.value[index] = meme;
        else {
          memes.value[index].author = meme.author;
          memes.value[index].discussion = meme.discussion;
          memes.value[index].id = meme.id;
        }
      });
    } else {
      console.error("Failed to fetch memes:", response.status);
    }
  } catch (error) {
    console.error("Error fetching memes:", error);
  }
};

const showDiscussion = async (meme: any) => {
  (document.getElementById(meme.id) as HTMLDialogElement).showModal();
};

const loadMore = async () => {
  loading_more.value = true;
  try {
    const response = await fetch(
      "/api/memes/all?limit=3&offset=" + (memes.value.length || 0)
    ); // Replace with your API endpoint
    if (response.status === 200) {
      const text = await response.text();
      const body = JSON.parse(text);

      body.data.map((meme: any) => {
        memes.value.push(meme);
      });
      reached_end.value = body.reached_end;
    } else {
      console.error("Failed to fetch memes:", response.status);
    }
  } catch (error) {
    console.error("Error fetching memes:", error);
  }
  loading_more.value = false;
};
</script>
