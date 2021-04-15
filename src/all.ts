import {Document} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {renderFile} from 'https://deno.land/x/mustache_ts/mustache.ts'

export const all = async (doc: Document) => {
  let data: {
    query: string
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
    relatedSearchs: string[]
  } = {
    query: doc.querySelector('title')!.textContent.split(' - ')[0],
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
    },
    relatedSearchs: []
  }

  doc.querySelectorAll('.LC20lb.DKV0Md').forEach((el, i) => (data.results[i] = {title: el.textContent})) //results title
  doc.querySelectorAll('.aCOpRe').forEach((el, i) => (data.results[i].desc = el.textContent)) //results description
  doc.querySelectorAll('.TbwUpd.NJjxre').forEach((el, i) => (data.results[i].shownLink = el.textContent)) //results shown link
  doc.querySelectorAll('.yuRUbf').forEach((el, i) => (data.results[i].link = el.children[0].getAttribute('href')!)) //results link
  data.firstResult = data.results.shift()! //first result
  doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i] = {title: el.textContent})) //first results title
  doc.querySelectorAll('.st').forEach((el, i) => (data.firstResults[i].desc = el.textContent)) //first results description
  doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i].link = el.parentElement!.children[0].getAttribute('href')!)) //first results link
  data.firstResults = data.firstResults.slice(0, 4) //Better visibility
  
  if (doc.querySelector('.wwUB2c') !== null) {
    data.knwlPanel.title = doc.querySelector('.qrShPb')!.textContent //knowledge panel title
    data.knwlPanel.subtitle = doc.querySelector('.wwUB2c')!.textContent //knowledge panel subtitle
    if (doc.querySelector('.kno-rdesc')! !== null) data.knwlPanel.desc = doc.querySelector('.kno-rdesc')!.children[1].textContent //knowledge panel description
    doc.querySelectorAll('.w8qArf').forEach((el, i) => (data.knwlPanel.infos[i] = {title: el.children[0].textContent + ': '})) //knowledge panel infos title
    doc.querySelectorAll('.kno-fv').forEach((el, i) => (data.knwlPanel.infos[i].content = el.textContent.replace(' - Disclaimer', '').replace(', MORE', '').replace('%)', '%)\n'))) //knowledge panel infos content
    //TODO: remove unwanted elements from knowledge panel infos (eg: q=toyota)
  } else data.hasKnwlPanel = false

  return await renderFile('./views/all.hbs', data)
}
