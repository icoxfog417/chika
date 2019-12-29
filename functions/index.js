const functions = require('firebase-functions')
const admin = require('firebase-admin')
const http = require('request')
require('dotenv').config()
admin.initializeApp()
const firestore = admin.firestore()

exports.validateSpeech = functions.https.onRequest((request, response) => {
  let appId = ''
  if (process.env.GOO_APP_ID) {
    appId = process.env.GOO_APP_ID
  } else {
    appId = functions.config().goo.id
  }
  const endpoint = 'https://labs.goo.ne.jp/api/morph'
  const text = request.body.text
  const prefix = request.body.prefix
  http.post(
    endpoint,
    {
      form: {
        app_id: appId,
        sentence: text
      }
    },
    (err, res, body) => {
      if (!err && res.statusCode === 200) {
        body = JSON.parse(body)
        const word_list = body.word_list
        if (word_list.length !== 1) {
          response.send({
            valid: false,
            end: false,
            message: '単語が入力されていません',
            lastWord: lastWord,
            content: []
          })
        }

        const words = word_list[0]
        const numNoun = words.filter((r) => r[1].startsWith('名詞')).length
        const firstWord = words[0][2].slice(0, 1)
        const lastWord = words[words.length - 1][2].slice(-1)
        if (firstWord !== prefix) {
          response.send({
            valid: false,
            end: false,
            message: '前回の終わりから始まっていません。',
            lastWord: lastWord,
            content: words
          })
        } else if (lastWord === 'ン') {
          response.send({
            valid: false,
            end: true,
            message: '「ん」がつきました!',
            lastWord: lastWord,
            content: words
          })
        } else if (numNoun !== words.length) {
          response.send({
            valid: false,
            end: false,
            message: 'モノの名前ではないようです。',
            lastWord: lastWord,
            content: words
          })
        } else {
          response.send({
            valid: true,
            end: true,
            message: '',
            lastWord: lastWord,
            content: words
          })
        }
      } else {
        console.log(err)
      }
    }
  )
})

exports.import_data = functions.https.onRequest((request, response) => {
  const body = request.body.body
  const item = JSON.parse(body)
  const index = item.index
  delete item['index']
  console.log(index)
  console.log(item)

  firestore
    .collection('words')
    .doc(index)
    .set(item)
})
