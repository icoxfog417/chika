const characters = [
  'ア',
  'イ',
  'ウ',
  'エ',
  'オ',
  'カ',
  'キ',
  'ク',
  'ケ',
  'コ',
  'サ',
  'シ',
  'ス',
  'セ',
  'ソ',
  'タ',
  'チ',
  'ツ',
  'テ',
  'ト',
  'ナ',
  'ニ',
  'ヌ',
  'ネ',
  'ノ',
  'ハ',
  'ヒ',
  'フ',
  'ヘ',
  'ホ',
  'マ',
  'ミ',
  'ム',
  'メ',
  'モ',
  'ヤ',
  'ユ',
  'ヨ',
  'ラ',
  'リ',
  'ル',
  'レ',
  'ロ',
  'ワ',
  'ヲ',
  'ガ',
  'ギ',
  'グ',
  'ゲ',
  'ゴ',
  'ザ',
  'ジ',
  'ズ',
  'ゼ',
  'ゾ',
  'ダ',
  'ヂ',
  'ヅ',
  'デ',
  'ド',
  'バ',
  'ビ',
  'ブ',
  'ベ',
  'ボ'
]

class CharacterManager {
  constructor(characterCounts) {
    this.characters = characters
    this.characterCounts = characterCounts
  }

  getCharacterCode(character) {
    const code = character.charCodeAt(0)
    return code.toString()
  }

  sampleCharacter() {
    const i = Math.floor(Math.random() * this.characters.length)
    const c = this.characters[i]
    return c
  }

  sampleIndex(character) {
    const code = this.getCharacterCode(character)
    const count = this.characterCounts[code]
    const i = Math.floor(Math.random() * count)
    const index = [code, i.toString()].join('_')
    return index
  }

  sampleFromRemains(character, registered) {
    const code = this.getCharacterCode(character)
    let registeredCodes = []
    if (code in registered) {
      registeredCodes = registered[code]
    }
    registeredCodes = registeredCodes.map((ci) => {
      const codeAndIndex = ci.split('_')
      return parseInt(codeAndIndex[1])
    })

    const candidates = []
    for (let i = 0; i < this.characterCounts[code]; i++) {
      if (!registeredCodes.includes(i)) {
        candidates.push(i.toString())
      }
    }

    if (candidates.length > 0) {
      const i = Math.floor(Math.random() * candidates.length)
      const c = candidates[i]
      const candidatecode = [code, c].join('_')
      return candidatecode
    } else {
      return ''
    }
  }
}

export default CharacterManager
