<script setup lang="ts">
enum AuthType {
  SignIn,
  SignUp,
}
const client = useSupabaseClient();
const authType = ref<AuthType>(AuthType.SignIn);

const email = ref<string | null>(null);
const username = ref<string | null>(null);
const password = ref<string | null>(null);
const successMsg = ref<string | null>(null);
const errorMsg = ref<string | null>(null);

const user = useSupabaseUser();
onMounted(() => {
  watchEffect(() => {
    if (user.value) {
      navigateTo("/");
    }
  });
});

async function signIn() {
  if (!email.value || !password.value) {
    successMsg.value = null;
    errorMsg.value = "Missing required forms";
    return;
  }
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
  } catch (error: any) {
    successMsg.value = null;
    errorMsg.value = error.message;
  }
}
async function signUp() {
  if (!email.value || !username.value || !password.value) {
    successMsg.value = null;
    errorMsg.value = "Missing required forms";
    return;
  }
  try {
    const { data, error } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          username: username.value,
        },
      },
    });

    if (error) throw error;
    errorMsg.value = null;
    successMsg.value = "You've been signed up, check your email to continue!";
  } catch (error: any) {
    successMsg.value = null;
    errorMsg.value = error.message;
  }
}
</script>

<template>
  <div class="pt-10 flex items-center justify-center">
    <form
      class="bg-base-200 p-6 mx-4 rounded-lg shadow-xl w-full md:w-[50%] lg:w-[50%]"
      @submit.prevent="authType === AuthType.SignIn ? signIn() : signUp()"
    >
      <div class="alert alert-error my-2" v-if="errorMsg">
        <span>{{ errorMsg }}</span>
      </div>
      <div class="alert alert-success my-2" v-if="successMsg">
        <span>{{ successMsg }}</span>
      </div>
      <h1 class="text-2xl font-semibold mb-4">
        {{ authType === AuthType.SignIn ? "Login" : "Register" }}
      </h1>
      <div class="mb-4">
        <label for="email" class="block text-gray-600">Email</label>
        <input
          type="email"
          class="input input-bordered w-full"
          required
          v-model="email"
        />
      </div>
      <div class="mb-4" v-if="authType === AuthType.SignUp">
        <label for="email" class="block text-gray-600">Username</label>
        <input
          type="username"
          class="input input-bordered w-full"
          required
          v-model="username"
        />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-gray-600">Password</label>

        <input
          type="password"
          class="input input-bordered w-full"
          required
          v-model="password"
        />
      </div>
      <button type="submit" class="btn btn-primary w-full mb-2">Submit</button>
      <button
        v-if="authType === AuthType.SignIn"
        @click="authType = AuthType.SignUp"
        class="text-center"
      >
        Don't have an account? Register instead
      </button>
      <button
        v-if="authType === AuthType.SignUp"
        @click="authType = AuthType.SignIn"
        class="text-center"
      >
        Already have an account? Login instead
      </button>
    </form>
  </div>
</template>
