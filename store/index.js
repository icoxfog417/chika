export const state = () => ({
  speakingWord: '',
  counter: 0
})

export const mutations = {
  speaking(state, text) {
    state.speakingWord = text
  },
  increment(state) {
    state.counter++
  }
}
