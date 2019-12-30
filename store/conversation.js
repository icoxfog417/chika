import firebase from '~/plugins/firebase.js'
import CharacterManager from '~/plugins/CharacterManager.js'

export const words = firebase.db.collection('words')
export const wordCount = firebase.db.collection('wordCount')

export const state = () => ({
  remarkingWord: '',
  countMap: {},
  history: [],
  currentHead: '',
  registered: {
    '-1': []
  },
  errorMessage: '',
  gameEnd: false,
  message: ''
})

export const mutations = {
  initialize(state, characterCount) {
    state.countMap = characterCount
    state.history = []
    state.registered = {
      '-1': []
    }
    state.currentHead = ''
    state.errorMessage = ''
    state.gameEnd = false
    state.message = ''
    state.remarkingWord = ''
  },
  remarking(state, text) {
    state.remarkingWord = text
  },
  clearRemark(state) {
    state.remarkingWord = ''
  },
  gameEnd(state, message) {
    state.message = message
    state.gameEnd = true
  },
  addRemark(state, data) {
    const text = data.text
    const validation = data.validation
    state.currentHead = validation.lastWord
    state.history.push({
      content: {
        id: state.history.length,
        text
      },
      isUser: true
    })
    state.registered['-1'].push(text)
  },
  addReply(state, reply) {
    state.currentHead = reply.reading.slice(-1)
    state.history.push({
      content: reply,
      isUser: false
    })
    const codeAndIndex = reply.index.split('_')
    const code = parseInt(codeAndIndex[0])
    if (!(code in state.registered)) {
      state.registered[code] = []
    }
    state.registered[code].push(codeAndIndex)
    state.registered['-1'].push(reply.word)
  },
  setValidationError(state, validation) {
    state.errorMessage = validation.message
  }
}

export const getters = {
  characterManager: (state) => {
    return new CharacterManager(state.countMap)
  },
  remarkingWord: (state) => {
    return state.remarkingWord
  },
  gameEnd: (state) => {
    return state.gameEnd
  },
  currentHead: (state) => {
    return state.currentHead
  },
  registered: (state) => {
    return state.registered
  },
  registeredWords: (state) => {
    return state.registered['-1']
  }
}

export const actions = {
  async initialize({ commit, getters }) {
    const counts = await wordCount.doc('master').get()
    const countMap = counts.data().counts
    commit('initialize', countMap)
    const cm = getters.characterManager
    const firstCharacter = cm.sampleCharacter()
    const index = cm.sampleIndex(firstCharacter)
    const resp = await words.doc(index).get()
    const reply = resp.data()

    if (reply !== undefined) {
      commit('addReply', reply)
    } else {
      commit('gameEnd', '勝ち!')
    }
  },
  async remark({ commit, getters }) {
    const cm = getters.characterManager
    const text = getters.remarkingWord
    if (getters.registeredWords.includes(text)) {
      commit('setValidationError', {
        message: '同じ単語は使えません'
      })
      return 0
    }

    const validate = firebase.functions.httpsCallable('validateRemark')
    const validation = await validate({
      text,
      prefix: getters.currentHead
    })
    if (validation.data.valid) {
      commit('addRemark', { text, validation: validation.data })
      commit('clearRemark')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = cm.sampleFromRemains(
        getters.currentHead,
        getters.registered
      )
      if (index !== '') {
        const resp = await words.doc(index).get()
        const reply = resp.data()
        if (reply !== undefined) {
          commit('addReply', reply)
        }
      } else {
        commit('gameEnd', '勝ち!')
      }
    } else if (validation.data.end) {
      commit('gameEnd', '負け!')
    } else {
      commit('setValidationError', validation.data)
    }
  }
}
