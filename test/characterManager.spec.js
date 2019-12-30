import { mount } from '@vue/test-utils'
import CharacterManager from '@/plugins/characterManager.js'

describe('CharacterManager', () => {
  test('test getCharacterCode', () => {
    const cm = new CharacterManager({})
    const code = cm.getCharacterCode('ア')
    expect(code).toBe(12450)
  }),
    test('test sampleCharacter', () => {
      const cm = new CharacterManager({})
      const c = cm.sampleCharacter()
      expect(c.getCharacterCode(cm.sampleCharacter(c))).toBeGreaterThan(0)
    }),
    test('test sampleIndex', () => {
      const cm = new CharacterManager({
        12450: 10
      })
      const codeAndIndex = cm.sampleIndex('ア')
      expect(codeAndIndex.split('_')[0]).toBe('12450')
      expect(parseInt(codeAndIndex.split('_')[1])).toBeLessThan(10)
    })
  test('test sampleFromRemains', () => {
    const cm = new CharacterManager({
      12450: 5
    })
    const registered = {
      12450: ['12450_0', '12450_2', '12450_3', '12450_4']
    }
    const codeAndIndex = cm.sampleFromRemains('ア', registered)
    expect(codeAndIndex.split('_')[0]).toBe('12450')
    expect(codeAndIndex.split('_')[1]).toBe('1')
  })
})
