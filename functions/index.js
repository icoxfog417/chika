const functions = require('firebase-functions')
const admin = require('firebase-admin')
const http = require('request-promise')
require('dotenv').config()
admin.initializeApp()
const firestore = admin.firestore()

exports.validateRemark = functions.https.onCall((data, context) => {
  let appId = ''
  if (process.env.GOO_APP_ID) {
    appId = process.env.GOO_APP_ID
  } else {
    appId = functions.config().goo.id
  }
  const endpoint = 'https://labs.goo.ne.jp/api/morph'
  const text = data.text
  const prefix = data.prefix
  return http
    .post(endpoint, {
      form: {
        app_id: appId,
        sentence: text
      }
    })
    .then((body) => {
      const word_list = JSON.parse(body).word_list
      if (word_list.length !== 1) {
        return {
          valid: false,
          end: false,
          message: '単語が入力されていません',
          lastWord: '',
          content: []
        }
      }

      const words = word_list[0]
      const numNoun = words.filter((r) => r[1].startsWith('名詞')).length
      const firstWord = words[0][2].slice(0, 1)
      const lastWord = words[words.length - 1][2].slice(-1)
      if (firstWord !== prefix) {
        return {
          valid: false,
          end: false,
          message: '前回の終わりから始まっていません。',
          lastWord: lastWord,
          content: words
        }
      } else if (lastWord === 'ン') {
        return {
          valid: false,
          end: true,
          message: '「ん」がつきました!',
          lastWord: lastWord,
          content: words
        }
      } else if (numNoun !== words.length) {
        return {
          valid: false,
          end: false,
          message: 'モノの名前ではないようです。',
          lastWord: lastWord,
          content: words
        }
      } else {
        return {
          valid: true,
          end: true,
          message: '',
          lastWord: lastWord,
          content: words
        }
      }
    })
    .catch((err) => {
      return {
        valid: false,
        end: false,
        message: 'API Response Error',
        lastWord: '',
        content: [err]
      }
    })
})

exports.import_data = functions.https.onRequest((request, response) => {
  const body = request.body.body
  const item = JSON.parse(body)
  const index = item.index
  console.log(index)
  console.log(item)

  firestore
    .collection('words')
    .doc(index)
    .set(item)

  response.send({
    status: true
  })
})

exports.import_count = functions.https.onRequest((request, response) => {
  const body = request.body.body
  const item = JSON.parse(body)
  console.log(item)
  firestore
    .collection('wordCount')
    .doc('master')
    .set(item)

  response.send({
    status: true
  })
})
