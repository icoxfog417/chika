<template>
  <div class="title">
    <v-card class="mx-auto" max-width="400">
      <v-card-text>
        <p class="display-1 text--primary">
          {{ text }} &nbsp; &nbsp; ({{ reading }})
        </p>
        <p>{{ context }}</p>
        <div class="text--primary">
          <a :href="url" target="_read">{{ title }} / {{ author }}</a>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    author: String,
    url: String,
    context: String,
    text: String,
    reading: String
  }
}
</script>
