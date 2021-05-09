//deno-lint-ignore-file no-explicit-any
import {Document, DOMParser} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {renderFile} from 'https://deno.land/x/mustache_ts/mustache.ts'

export const all = async (doc: Document, lang: string) => {
  const data: {
    lang: string
    query: string
    shownMenu: Record<string, string>[]
    hiddenMenu: Record<string, string>[]
    hasProposition: boolean
    proposition: Record<string, Record<string, string>>
    firstResult: Record<string, string>
    firstResults: Record<string, string>[]
    hasQuickAnswers: boolean
    quickAnswers: Record<string, string>[]
    results: Record<string, string>[]
    hasKnwlPanel: boolean
    knwlPanel: {
      title: string
      subtitle: string
      desc: string
      infos: Record<string, string>[]
      additionalInfos: {
        title: string
        infos: Record<string, string>[]
      }
    }
    IMGs: string[][]
    stringedIMGs: string
  } = {
    lang: lang,
    query: doc.querySelector('title')!.textContent.split(' - ')[0],
    shownMenu: [],
    hiddenMenu: [],
    hasProposition: true,
    proposition: {
      proposition: {
        text: '',
        link: '',
        data: ''
      },
      original: {
        text: '',
        link: ''
      }
    },
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
      additionalInfos: {
        title: '',
        infos: []
      }
    },
    IMGs: [],
    stringedIMGs: ''
  }

  //Get the big fat JS tag containing a lot of messy information
  let bigFatJS = ''
  doc.querySelectorAll('script').forEach(el => el.textContent.includes('(function(){var u=') ? bigFatJS = el.textContent : null)

  //Get menu infos
  const raw = bigFatJS.split('var m=[')[1].split(';')[0]
  const menuIDs = ['WEB', 'IMAGES', 'VIDEOS', 'NEWS', 'SHOPPING', 'BOOKS', 'MAPS', 'FLIGHTS', 'FINANCE']
  const baseMenu: any[] = []
  menuIDs.forEach((_, i) => baseMenu.push([
    raw.indexOf(menuIDs[i]),
    raw.split(menuIDs[i])[0].split('\\x22')[raw.split(menuIDs[i])[0].split('\\x22').length - 3].split('\\x22')[0],
    menuIDs[i] !== 'WEB' ? menuIDs[i].toLowerCase() : 'all'
  ]))
  baseMenu.sort((a, b) => a[0] > b[0] ? 1 : -1)
  baseMenu.forEach((el, i) =>
    i < 5 ?
      data.shownMenu.push({
        id: el[2],
        value: el[1]
      })
      : data.hiddenMenu.push({
        id: el[2],
        value: el[1]
      }))
  //TODO: Implement data.hiddenMenu aka "more" on google.com to access others tabs

  //Spelling check
  if (doc.querySelector('.spell_orig') != null) {
    data.proposition.proposition.text = doc.querySelector('.gL9Hy')!.textContent
    data.proposition.proposition.data = doc.querySelectorAll('.gL9Hy')![1].textContent
    data.proposition.proposition.link = '/search?q=' + data.proposition.proposition.data
    data.proposition.original.text = doc.querySelector('.spell_orig')!.innerHTML.split('<')[0].toLocaleLowerCase()
    data.proposition.original.link = '/search?q=' + data.query + '&trueSpelling=1'
  } else data.hasProposition = false

  //No results
  if (doc.querySelector('#result-stats') != null && doc.querySelector('#result-stats')!.textContent.split(/\s/g)[1] === '0') {
    data.results[0] = {
      title: doc.querySelector('.spell_orig')!.textContent
    }
    data.hasProposition = false
  }
  if (doc.querySelector('.mnr-c:not(.g)') != null) {
    data.results[0] = {
      title: doc.querySelector('.card-section')!.textContent.split('(')[0]
    }
    doc.querySelectorAll('ul')![3].textContent.split('.').forEach((el, i) => {
      if (i === 0) data.results[0].desc = el + ', '
      if (i === 1) data.results[0].desc += el.toLocaleLowerCase() + ', '
      if (i === 2) data.results[0].desc += el.toLocaleLowerCase() + '.'
    })
    data.results[0].link = '/search?q=' + data.results[0].title.split(': ')[1]
  }

  //Results
  doc.querySelectorAll('.LC20lb.DKV0Md').forEach((el, i) => (data.results[i] = {title: el.textContent})) //results title
  doc.querySelectorAll('.aCOpRe').forEach((el, i) => (data.results[i].desc = el.textContent)) //results description
  doc.querySelectorAll('.TbwUpd.NJjxre').forEach((el, i) => (data.results[i].shownLink = el.textContent)) //results shown link
  doc.querySelectorAll('.yuRUbf').forEach((el, i) => (data.results[i].link = el.children[0].getAttribute('href')!)) //results link
  data.firstResult = data.results.shift()! //first result
  doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i] = {title: el.textContent})) //first results title
  doc.querySelectorAll('.st').forEach((el, i) => (data.firstResults[i].desc = el.textContent)) //first results description
  doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i].link = el.parentElement!.children[0].getAttribute('href')!)) //first results link
  data.firstResults = data.firstResults.slice(0, 4) //Better visibility

  //Quick answers
  if (doc.querySelector('.JolIg') != null) {
    const formatted: string[] = []
    bigFatJS.split("');})();(function(){window.jsl.dh('").forEach(el => el.includes('iOBnre') || el.includes('wDYxhc') && !el.includes('NFQFxe') ? formatted.push(JSON.parse('"' + el.slice(el.indexOf(',') + 2).replaceAll('\\x', '\\u00') + '"')) : null)
    let i = 0
    formatted.forEach(el => {
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
  if (doc.querySelector('.wwUB2c') != null) {
    data.knwlPanel.title = doc.querySelector('.qrShPb')!.textContent //knowledge panel title
    data.knwlPanel.subtitle = doc.querySelector('.wwUB2c')!.textContent //knowledge panel subtitle
    if (doc.querySelector('.kno-rdesc')! != null) data.knwlPanel.desc = doc.querySelector('.kno-rdesc')!.children[1].textContent //knowledge panel description
    if (doc.querySelector('.w8qArf')! != null) {
      doc.querySelectorAll('.w8qArf').forEach((el, i) => (data.knwlPanel.infos[i] = {title: el.children[0].textContent + ': '})) //knowledge panel infos title
      doc.querySelectorAll('.kno-fv').forEach((el, i) => (data.knwlPanel.infos[i].content = el.textContent.split(' - ')[0])) //knowledge panel infos content
      if (doc.querySelector('.VLkRKc') != null) data.knwlPanel.additionalInfos.title = doc.querySelector('.VLkRKc')!.textContent
      else data.knwlPanel.additionalInfos.title = doc.querySelector('.Ss2Faf')!.textContent
      if (doc.querySelectorAll('.kno-vrt-t') != null) {
        doc.querySelectorAll('.kno-vrt-t').forEach((el, i) => i < 4 ? data.knwlPanel.additionalInfos.infos.push({
          link: el.children[0].getAttribute('href')!.slice(7).split('&')[0],
          ID: el.children[0].children[0].children[0].children[0].getAttribute('id')!,
          title: el.children[0].children[1].textContent,
          subtitle: el.children[0].children[2] != null ? el.children[0].children[2].textContent : ''
        }) : null)
      }
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

  return await renderFile('./views/all.hbs', data)
}