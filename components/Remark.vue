<template>
  <div class="title">
    <v-card class="mx-auto" max-width="400">
      <v-card-text>
        <p class="display-1 text--primary">
          {{ text }}
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    text: String
  }
}
</script>
