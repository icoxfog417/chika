<template>
  <v-layout column justify-center align-center>
    <v-flex>
      <div xs12 sm8 md6 class="vertical">
        <div>
          <span class="display-1">{{ endMessage }}</span>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <v-btn v-if="gameEnd" color="primary" @click="reset">Retry</v-btn>
        </div>
        <div>
          <Remark v-if="true" :text="remarkingWord"></Remark>
        </div>
        <div v-for="h in history" :key="h.id">
          <Remark v-if="h.isUser" :text="h.content.text"></Remark>
          <Reply
            v-if="!h.isUser"
            :title="h.content.title"
            :author="h.content.author"
            :url="h.content.url"
            :text="h.content.word"
            :reading="h.content.reading"
            :context="h.content.context"
          ></Reply>
        </div>
      </div>
    </v-flex>
    <v-footer app color="primary">
      <div class="col-3">
        <v-btn href="http://www.goo.ne.jp/">
          <img
            src="//u.xgoo.jp/img/sgoo.png"
            alt="supported by goo"
            title="supported by goo"
            width="100px"
          />
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-text-field
        :value="remarkingWord"
        :full-width="true"
        :error-messages="errorMessage"
        @input="remarking($event)"
        @keyup.enter="remark()"
        label="Shi-ri-to-ri!"
        background-color="white"
        required
        class="col-9"
      ></v-text-field>
    </v-footer>
  </v-layout>
</template>
<script>
import Remark from '@/components/Remark.vue'
import Reply from '@/components/Reply.vue'

export default {
  components: {
    Remark,
    Reply
  },
  computed: {
    remarkingWord() {
      return this.$store.state.conversation.remarkingWord
    },
    gameEnd() {
      return this.$store.state.conversation.gameEnd
    },
    endMessage() {
      return this.$store.state.conversation.message
    },
    history() {
      return this.$store.state.conversation.history.slice().reverse()
    },
    errorMessage() {
      return this.$store.state.conversation.errorMessage
    }
  },
  async fetch({ store, params }) {
    await store.dispatch('conversation/initialize')
  },
  methods: {
    remarking(input) {
      this.$store.commit('conversation/remarking', input)
    },
    reset() {
      this.$store.dispatch('conversation/initialize')
    },
    remark() {
      this.$store.dispatch('conversation/remark')
    }
  }
}
</script>
<style>
footer.v-footer > div.v-input > div.v-input__control {
  border-radius: 10px !important;
}
footer.v-footer
  > div.v-input
  > div.v-input__control
  > div.v-text-field__details {
  color: #ffe4e1 !important;
}
.vertical {
  -webkit-writing-mode: vertical-rl;
  -ms-writing-mode: tb-rl;
  writing-mode: vertical-rl;
  overflow-x: auto;
  max-width: 700px;
}
</style>
