import {Document} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {renderFile} from 'https://deno.land/x/mustache_ts/mustache.ts'

export const all = async (doc: Document, lang: string) => {
  let data: {
    lang: string
    query: string
    shownMenu: Record<string, string>[]
    hiddenMenu: Record<string, string>[]
    proposition: Record<string, Record<string, string>>
    hasProposition: boolean
    firstResult: Record<string, string>
    firstResults: Record<string, string>[]
    results: Record<string, string>[]
    hasKnwlPanel: boolean
    knwlPanel: {
      title: string
      subtitle: string
      desc: string
      infos: Record<string, string>[]
    }
  } = {
    lang: lang,
    query: doc.querySelector('title')!.textContent.split(' - ')[0],
    shownMenu: [],
    hiddenMenu: [],
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
    hasProposition: true,
    firstResult: {},
    firstResults: [],
    results: [
      {
        title: 'No results',
        desc: 'Try searching for something else...'
      }
    ],
    hasKnwlPanel: true,
    knwlPanel: {
      title: '',
      subtitle: '',
      desc: '',
      infos: []
    }
  }

  //Get menu infos
  let str = ''
  doc.querySelectorAll('script').forEach(el => el.textContent.includes('(function(){var u=') ? str = el.textContent.split('var m=[')[1].split(';')[0] : null)
  const menuIDs = ['WEB', 'IMAGES', 'VIDEOS', 'NEWS', 'SHOPPING', 'BOOKS', 'MAPS', 'FLIGHTS', 'FINANCE']
  const baseMenu: any[] = []
  menuIDs.forEach((_, i) => baseMenu.push([str.indexOf(menuIDs[i]), str.split(menuIDs[i])[0].split('\\x22')[str.split(menuIDs[i])[0].split('\\x22').length - 3].split('\\x22')[0]]))
  baseMenu.sort((a, b) => a[0] > b[0] ? 1 : -1)
  baseMenu.forEach((el, i) =>
    i < 5 ?
      data.shownMenu.push({
        id: menuIDs[i] !== 'WEB' ? menuIDs[i].toLowerCase() : 'all',
        value: el[1]
      })
      : data.hiddenMenu.push({
        id: menuIDs[i],
        value: el[1]
      }))
  //TODO: Implement "hiddenMenu" aka "more" on google.com to access others menus

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

  //Knowledge panel
  if (doc.querySelector('.wwUB2c') != null) {
    data.knwlPanel.title = doc.querySelector('.qrShPb')!.textContent //knowledge panel title
    data.knwlPanel.subtitle = doc.querySelector('.wwUB2c')!.textContent //knowledge panel subtitle
    if (doc.querySelector('.kno-rdesc')! !== null) data.knwlPanel.desc = doc.querySelector('.kno-rdesc')!.children[1].textContent //knowledge panel description
    doc.querySelectorAll('.w8qArf').forEach((el, i) => (data.knwlPanel.infos[i] = {title: el.children[0].textContent + ': '})) //knowledge panel infos title
    doc.querySelectorAll('.kno-fv').forEach((el, i) => (data.knwlPanel.infos[i].content = el.textContent.replace(' - Disclaimer', '').replace(', MORE', '').replace('%)', '%)\n'))) //knowledge panel infos content
    //TODO: remove unwanted elements from knowledge panel infos (eg: q=toyota)
  } else data.hasKnwlPanel = false

  //Spelling check
  if (doc.querySelector('.spell_orig') != null) {
    data.proposition.proposition.text = doc.querySelector('.gL9Hy')!.textContent
    data.proposition.proposition.data = doc.querySelectorAll('.gL9Hy')![1].textContent
    data.proposition.proposition.link = '/search/?q=' + data.proposition.proposition.data
    data.proposition.original.text = doc.querySelector('.spell_orig')!.textContent.toLocaleLowerCase()
    data.proposition.original.link = '/search/?q=' + data.proposition.proposition.data + '&trueSpelling=1'
  } else data.hasProposition = false

  return await renderFile('./views/all.hbs', data)
}
