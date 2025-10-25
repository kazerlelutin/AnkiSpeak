import csv from 'csv-parser'
import { createReadStream, mkdirSync, rmSync, writeFileSync } from 'fs'
import gTTS from 'gtts'
import path from 'path'
import crypto from 'crypto'
// === config === //
const lang = 'ko'
const langSrcCode = 'fr'
const langDestCode = 'kr'

const results = []

async function main() {
  const args = process.argv.slice(2)
  const isCloze = args.includes('--cloze')
  const clozeReg = /{{c\d+::.*?}}/g

  const rs = await new Promise((resolve) => {
    createReadStream(path.join('in.csv'))
      .pipe(csv({ separator: ',' }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results)
      })
  })

  rmSync('medias', { recursive: true })
  mkdirSync('medias', { recursive: true })

  console.log('Processing:', rs)
  const newResults = []
  for (const result of rs) {
    const sanitizedText = result[langDestCode]
      .replace(/[!@#$%^&*()_=\/\\\+\\"<>;]/g, ' ')
      .replace(/\.$/, '')
      .replace(/{{c\d+::/g, '')
      .replace(/}}/g, '')

    const tts = new gTTS(sanitizedText.replace(/~/g, ' '), lang)

    const cryptoSuffixe = crypto.randomBytes(16).toString('hex')

    const mediaName = `${new Date().getTime()}${cryptoSuffixe}.mp3`

    tts.save(path.join('medias', mediaName), (err) => err && console.error(err))

    const cleanText = result[langDestCode].replace(/"/g, '').trim()

    const tags = result.tags.replace(' ', ', ').replace(/,/g, ' ').trim()
    if (isCloze) {
      const words = cleanText.split(' ')

      newResults.push(
        ...words.map((word) => {
          const clozeText = cleanText.replace(word, `{{c1::${word}}}`)
          const recto = `${clozeText}<br><hr />${result[langSrcCode]}`
          if (newResults.find(result => result.recto === recto)) {
            return null
          }
          return {
            recto,
            verso: `[sound:${mediaName}]`,
            tags,
          }
        })
      )
    } else if (result[langDestCode].match(clozeReg)) {

      const recto = `${cleanText}<br><hr />${result[langSrcCode]}`
      if (newResults.find(result => result.recto === recto)) {
        continue
      }

      newResults.push({
        recto,
        verso: `[sound:${mediaName}]`,
        tags,
      })

    } else {
      const recto = `${cleanText}<hr /><br>[sound:${mediaName}]<br>`
      if (newResults.find(result => result.recto === recto)) {
        continue
      }

      newResults.push({
        recto,
        verso: result[langSrcCode],
        tags,
      })
    }

    if (newResults.length % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Pause...:', newResults.length)
    }
  }

  let newCsv = ''

  newCsv = newResults
    .map((result) => `${result.recto};${result.verso};${result.tags}`)
    .join('\n')

  console.log('New cards ===>', newResults.length)

  writeFileSync('out.csv', newCsv, 'utf-8')
}

main()
