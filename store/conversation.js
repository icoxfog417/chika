import db from '~/plugins/firebase.js'

const words = db.collection('words')

export const state = () => ({
  currentWord: '',
  history: []
})

export const mutations = {
  addRemark(state, text) {
    state.currentWord = text
    state.history.push({
      content: {
        id: state.history.length,
        text
      },
      isUser: true
    })
  },
  addReply(state, reply) {
    state.currentWord = reply.word
    state.history.push({
      content: reply,
      isUser: false
    })
  }
}

export const actions = {
  async speak({ commit }, text) {
    commit('addRemark', text)
    const lastWord = text.slice(-1)
    try {
      console.log(words)
      console.log(lastWord)
      const reply = await words.where('prefix', '==', lastWord).get()
      if (!reply.empty) {
        reply.forEach((doc) => {
          console.log(doc.id, '=>', doc.data())
        })
      } else {
        console.log('Empty!')
      }
    } catch (e) {
      console.log(e)
    }
  }
}
