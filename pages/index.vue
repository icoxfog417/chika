<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-center">
        <span>{{ currentWord }}</span>
        <v-text-field
          :value="speakingWord"
          @input="speaking($event)"
          @keyup.enter="speak()"
          label="Remark"
          required
        ></v-text-field>
      </div>
      <div v-for="h in history" :key="h.id"></div>
      <v-card class="mx-auto" max-width="344" outlined> </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
export default {
  computed: {
    speakingWord() {
      return this.$store.state.speakingWord
    },
    currentWord() {
      return this.$store.state.conversation.currentWord
    },
    history() {
      return this.$store.state.conversation.history
    }
  },
  methods: {
    speaking(input) {
      this.$store.commit('speaking', input)
    },
    speak() {
      this.$store.dispatch('conversation/speak', this.$store.state.speakingWord)
    }
  }
}
</script>
