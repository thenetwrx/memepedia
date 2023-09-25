<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const user = useSupabaseUser();

const file = ref<Blob | null>(null);
const fileUploading = ref<boolean>(false);

const errorMsg = ref<string | null>(null);
const successMsg = ref<string | null>(null);

const handleUpload = async () => {
  errorMsg.value = null;
  successMsg.value = null;

  if (!file.value) {
    errorMsg.value = "No file ready";
    successMsg.value = null;
    return;
  }

  if (!user || !user.value || !user.value.email) {
    errorMsg.value = "Not authenticated";
    successMsg.value = null;
    return;
  }

  fileUploading.value = true;
  const headers = new Headers();
  const formData = new FormData();
  formData.set("file", file.value);
  formData.set("author_id", user.value?.id);

  const upload_res = await fetch("/api/memes/upload", {
    method: "POST",
    headers: headers,
    body: formData,
  });

  const text = await upload_res.text();
  try {
    const json = JSON.parse(text);

    fileUploading.value = false;
    if (json.path) {
      errorMsg.value = null;
      successMsg.value = "Meme uploaded";
      return;
    } else {
      errorMsg.value = json.message || "Unknown error";
      successMsg.value = null;
      return;
    }
  } catch (e) {
    errorMsg.value = "Invalid upload response";
    successMsg.value = null;
    return;
  }
};

const handleClear = async () => {
  fileUploading.value = false;
  const element = document.getElementById("file") as HTMLInputElement;
  if (element) element.value = "";
  file.value = null;
};

// Your existing handleFileInputChange function
const handleFileInputChange = async (event: any) => {
  const _file = event.target.files[0];
  if (!_file) {
    errorMsg.value = "No file ready for upload";
    successMsg.value = null;
    return;
  }

  const blob = new Blob([event.target.files[0]], {
    type: event.target.files[0].type,
  });
  file.value = blob;
};
</script>

<template>
  <div>
    <div class="container mx-auto px-2 pt-2">
      <div class="alert alert-error my-2" v-if="errorMsg">
        <span>{{ errorMsg }}</span>
      </div>
      <div class="alert alert-success my-2" v-if="successMsg">
        <span>{{ successMsg }}</span>
      </div>

      <h1 class="text-6xl text-center mb-4">Upload a meme</h1>
      <p class="text-center mb-4">Max size of 8mb because fuck you</p>
      <div
        class="flex justify-center flex-col items-center gap-1 w-max ml-auto mr-auto"
      >
        <input
          type="file"
          class="file-input file-input-bordered w-full max-w-xs"
          id="file"
          accept=".png"
          @change="handleFileInputChange"
        />
        <div class="flex flex-row justify-between w-full join">
          <button
            class="btn btn-primary join-item flex-grow"
            :class="fileUploading || file === null ? 'btn-disabled' : ''"
            @click="handleUpload"
          >
            <i
              class="fa-sharp fa-regular fa-upload"
              :class="fileUploading ? 'fa-fade' : ''"
            ></i>
            Upload
          </button>
          <button
            class="btn btn-primary join-item flex-grow"
            :class="file === null ? 'btn-disabled' : ''"
            @click="handleClear"
          >
            <i class="fa-sharp fa-regular fa-trash"></i> Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
