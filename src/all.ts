//deno-lint-ignore-file no-explicit-any
import {DOMParser} from 'deno_dom'
import {getBigFatJS, getQuery, rendSearch, rendMenu, rendPage} from '../src/utils.ts'
import type {Document} from 'deno_dom'

export const all = async (doc: Document, lang: string) => {
  let data: Record<string, any> = {
    proposition: '',
    firstResult: {},
    firstResults: [],
    hasQuickAnswers: true,
    quickAnswers: [],
    results: [],
    hasKnwlPanel: true,
    knwlPanel: {
      title: '',
      subtitle: '',
      desc: '',
      infos: [],
      additionalInfos: []
    },
    IMGs: [],
    stringedIMGs: ''
  }

  let noFirstResult = false
  //TODO: error 500 with q=&

  //Spell check / No results
  //eg: q=minecraftg
  if (doc.querySelector('#fprs')) data.proposition =
    doc.querySelector('.gL9Hy')!.textContent
    + ' <a href="/search?q='
    + doc.querySelectorAll('.gL9Hy')[1].textContent
    + '">'
    + doc.querySelectorAll('.gL9Hy')[1].textContent
    + '</a>, '
    + doc.querySelector('.spell_orig')!.innerHTML.split('<')[0].toLocaleLowerCase()
    + ' <a href="/search?q='
    + data.query
    + '&trueSpelling=1">'
    + data.query
    + '</a>'
  //eg: q=minecraft+fdsfdsfsffdgfdgdfgdsqdsqdsqdsq+dsqd+sd+sqd+sqd+sd+sq+sqdq
  if (doc.querySelector('.gqLncc') && doc.querySelector('.uzjuFc')) {
    noFirstResult = true
    const divParts = doc.querySelector('.gqLncc')!.textContent.split(':')
    data.firstResult = {
      title: doc.querySelector('.v3jTId')!.textContent,
      desc:
        divParts[0]
        + ': <a href="/search?q='
        + divParts[1]
        + '">'
        + divParts[1]
        + '</a><br>'
        + doc.querySelector('.Cy9gW')!.textContent.replace('.', '.<br>')
    }
  }
  //eg: q=minecraft+fdsfdsfsffdgfdgdfgdsqdsqdsqdsq+dsqd+sd+sqd+sqd+sd+sq
  if (!doc.querySelector('.gqLncc') && doc.querySelector('.uzjuFc')) {
    noFirstResult = true
    data.firstResult = {
      title: doc.querySelector('.v3jTId')!.textContent,
      desc: doc.querySelector('.Cy9gW')!.textContent
    }
  }
  //eg: q=minecraft+hhjhjhjhjhjhjh
  if (doc.querySelector('.gqLncc') && !doc.querySelector('.uzjuFc')) data.proposition =
    doc.querySelector('.gL9Hy')!.textContent
    + ' <a href="/search?q='
    + doc.querySelectorAll('.gL9Hy')![1].textContent
    + '">'
    + doc.querySelectorAll('.gL9Hy')![1].textContent
    + '</a>'
  //eg: q=minecraft+fdsfdsfsffdgfdgdfgdsqdsqdsqdsq+dsqdsqhdsqhdhsqbdshqbdsqdbsqhdb
  if (doc.querySelector('.card-section>ul')) {
    noFirstResult = true
    data.firstResult = {
      title: doc.querySelector('.card-section')!.textContent.split('(')[0]
    }
    doc.querySelectorAll('ul')![3].textContent.split('.').forEach((el, i) => {
      if (i === 0) data.firstResult.desc = el + ', '
      if (i === 1) data.firstResult.desc += el.toLocaleLowerCase() + ', '
      if (i === 2) data.firstResult.desc += el.toLocaleLowerCase() + '.'
    })
  }
  //eg: q=abc+dsqddsqddsqdsqdsdsqdsqddsqsqdsqdsqdsqdsqd
  if (doc.querySelector('#result-stats')) if (doc.querySelector('#result-stats')!.textContent.split(/\s/g)[1] === '0') {
    noFirstResult = true
    data.firstResult = {
      title: '0 ' + doc.querySelector('#result-stats')!.textContent.split(/\s/g)[2]
    }
  }

  //Results
  doc.querySelectorAll('.LC20lb.DKV0Md').forEach((el, i) => (data.results[i] = {title: el.textContent})) //results title
  doc.querySelectorAll('.aCOpRe').forEach((el, i) => (data.results[i].desc = el.textContent)) //results description
  doc.querySelectorAll('.TbwUpd.NJjxre').forEach((el, i) => (data.results[i].shownLink = el.textContent)) //results shown link
  doc.querySelectorAll('.yuRUbf').forEach((el, i) => (data.results[i].link = el.children[0].getAttribute('href')!)) //results link
  if (!noFirstResult) data.firstResult = data.results.shift() //first result
  if (doc.querySelectorAll('.st').length !== 1) {
    doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i] = {title: el.textContent})) //first results title
    doc.querySelectorAll('.usJj9c').forEach((el, i) => (data.firstResults[i].desc = el.textContent)) //first results description
    doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i].link = el.parentElement!.children[0].getAttribute('href')!)) //first results link
    data.firstResults = data.firstResults.slice(0, 4) //limit to 4 first results
  }

  //Quick answers
  if (doc.querySelector('.JolIg') != null) {
    let i = 0
    getBigFatJS(doc)
      .split(');}')
      .filter(el => (el.includes('iOBnre') || el.includes('wDYxhc')) && !el.includes('Ya0K2e'))
      .map(el => JSON.parse('"' + el.split("'")[3].replaceAll('\\x', '\\u00') + '"'))
      .forEach(el => {
        const doc = new DOMParser().parseFromString(el, 'text/html')!
        if (el.includes('iOBnre')) {
          data.quickAnswers.push({
            question: doc.querySelector('.iOBnre')!.textContent.split(': ')[1]
          })
          i++
        }
        else data.quickAnswers[i - 1] != undefined ? data.quickAnswers[i - 1].answer = doc.querySelector('.wDYxhc')!.innerHTML : null
      })
  } else data.hasQuickAnswers = false

  //Knowledge panel
  if (doc.querySelector('.liYKde.g.VjDLd') != null) {
    data.knwlPanel.title = doc.querySelector('.qrShPb')!.textContent //title
    data.knwlPanel.subtitle = doc.querySelector('.wwUB2c')!.textContent //subtitle
    if (doc.querySelector('.kno-rdesc')! != null) data.knwlPanel.desc = doc.querySelector('.kno-rdesc')!.children[1].textContent //description
    doc.querySelectorAll('.w8qArf').forEach((el, i) => (data.knwlPanel.infos[i] = {title: el.children[0].textContent + ': '})) //infos title
    doc.querySelectorAll('.kno-fv').forEach((el, i) => (data.knwlPanel.infos[i].content = el.textContent.split(' - ')[0])) //infos content

    //Additional infos
    if (doc.querySelector('.Ss2Faf:not(.ellip)')) {
      let index = 0
      doc.querySelectorAll('.Ss2Faf:not(.ellip)').forEach(el => {
        const next = el.parentElement!.children[1]
        //check if not an ad (eg: q=minecraft+dungeons)
        if (!el.parentElement!.className.includes('ellip') && (next.className !== 'JeEise fBkrHb') && (next.getAttribute('style') !== 'display:none')) {
          //title
          if (el.children[0]) {
            if (el.children[0].children[0]) data.knwlPanel.additionalInfos[index] = {title: el.children[0].children[0].textContent}
            else data.knwlPanel.additionalInfos[index] = {title: el.textContent}
          }
          else data.knwlPanel.additionalInfos[index] = {title: el.textContent}
          //content
          if (next.tagName === 'WEB-QUOTE-CONTAINER') {
            //quotes
            data.knwlPanel.additionalInfos[index].isQuotes = true
            data.knwlPanel.additionalInfos[index].quotes = []
            next.querySelectorAll('.kssN8d').forEach(el => data.knwlPanel.additionalInfos[index].quotes.push(el.textContent))
          } else if (next.tagName === 'CRITIC-REVIEWS-CONTAINER') {
            //critic reviews
            data.knwlPanel.additionalInfos[index].isCritics = true
            data.knwlPanel.additionalInfos[index].critics = []
            next.children[0].children[0].childNodes.forEach(el => data.knwlPanel.additionalInfos[index].critics.push({
              critic: el.children[0].children[0].children[0].textContent,
              link: el.children[0].children[0].children[1].getAttribute('href'),
              name: el.children[0].children[1].children[1].querySelector('a')!.textContent,
              icon: el.children[0].children[1].children[0].children[0].getAttribute('id')
            }))
          } else if (next.className === 'tpa-cc') {
            //musical platforms
            data.knwlPanel.additionalInfos[index].isPlatforms = true
            data.knwlPanel.additionalInfos[index].platforms = []
            next.querySelectorAll('tr').forEach(el => data.knwlPanel.additionalInfos[index].platforms.push({
              platform: el.textContent,
              link: el.children[0].children[0].getAttribute('href'),
              icon: el.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].getAttribute('id')
            }))
          } else if (next.className === 'AxJnmb gIcqHd') {
            //artworks
            data.knwlPanel.additionalInfos[index].isWorks = true
            data.knwlPanel.additionalInfos[index].works = []
            next.childNodes.forEach(el => data.knwlPanel.additionalInfos[index].works.push({
              work: el.textContent,
              link: '/search?q=' + el.textContent
            }))
          } else if (next.className === 'pOM64e') {
            //TODO: handle "Audience reviews" eg: q=minecraft+dungeons
            //TODO: fix detecting Audience rating summary
          } else if (next.className === 'jYcvae kY5Gde') {
            //TODO: handle "Audience rating summary" eg: q=minecraft+dungeons
          } else {
            //normal
            data.knwlPanel.additionalInfos[index].isNormal = true
            data.knwlPanel.additionalInfos[index].elements = []
            next.childNodes.forEach((el, j) => {
              if (j < 4) data.knwlPanel.additionalInfos[index].elements.push({
                title: el.children[0].children[1] ? el.children[0].children[1].textContent : el.textContent, //additional info title
                subtitle: el.children[0].children[2] ? el.children[0].children[2].textContent : null, //additional info subtitle
                link: el.parentElement!.children[j].querySelector('a')!.getAttribute('href')!.startsWith('/') ? el.parentElement!.children[j].querySelector('a')!.getAttribute('href')!.split('&')[0] : el.parentElement!.children[j].querySelector('a')!.getAttribute('href'), //additional info link
                ID: el.children[0].querySelector('img')!.getAttribute('id') //additional info image ID
              })
            })
          }
          index++
        }
      })
    }
  } else data.hasKnwlPanel = false

  //Get images
  doc.querySelectorAll('script').forEach(el => {
    if (el.textContent.includes('{var s')) {
      data.IMGs.push([
        el.textContent.slice(19).split("'")[0].replaceAll('\\x3d', '='), //Image base64
        el.textContent.split("['")[1].split("'")[0] //Image ID
      ])
    }
  })
  data.stringedIMGs = JSON.stringify(data.IMGs)

  data = {
    ...data,
    ...getQuery(doc),
    ...await rendSearch(doc),
    ...await rendMenu(doc),
  }

  return rendPage('all', data, lang)
}