import {DOMParser} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {renderFile} from 'https://deno.land/x/mustache_ts/mustache.ts'

export const images = async (params: Record<string, string>) => {
  //TODO: change results per page (& handle for start param)
  const doc = new DOMParser().parseFromString(
    await fetch('https://google.com/search?q=' + params.q + (params.page != undefined ? '&start='+ (parseInt(params.page)-1) + '0' : ''), {
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41',
        'accept-language': 'en-GB,en;q=0.9'
      }
    }).then(res => res.text()),
    'text/html'
  )!

  interface KnwlPanel {
    title: string
    subtitle: string
    desc: string
    infos: Record<string, string>[]
  }

  let data: {
    query: string
    firstResult: Record<string, string>
    firstResults: Record<string, string>[]
    results: Record<string, string>[]
    hasKnwlPanel: boolean
    knwlPanel: KnwlPanel
    relatedSearchs: string[]
  } = {
    query: params.q,
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
  let shownLink: string[] = [] //results shown link
  doc.querySelectorAll('.iUh30.Zu0yb').forEach(el => shownLink.push(el.textContent))
  shownLink = [...new Set(shownLink)]
  shownLink.forEach((el, i) => (data.results[i].shownLink = el))
  doc.querySelectorAll('.yuRUbf').forEach((el, i) => (data.results[i].link = el.children[0].getAttribute('href')!)) //results link
  data.firstResult = data.results.shift()! //first result
  doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i] = {title: el.textContent})) //first results title
  doc.querySelectorAll('.st').forEach((el, i) => (data.firstResults[i].desc = el.textContent)) //first results description
  doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i].link = el.parentElement!.children[0].getAttribute('href')!)) //first results link
  data.firstResults = data.firstResults.slice(0, 4) //Better visibility
  if (doc.querySelector('.qrShPb') !== null) {
    data.knwlPanel.title = doc.querySelector('.qrShPb')!.textContent //knowledge panel title
    data.knwlPanel.subtitle = doc.querySelector('.wwUB2c')!.textContent //knowledge panel subtitle
    if (doc.querySelector('.kno-rdesc')! !== null) data.knwlPanel.desc = doc.querySelector('.kno-rdesc')!.children[1].textContent //knowledge panel description
    doc.querySelectorAll('.w8qArf').forEach((el, i) => (data.knwlPanel.infos[i] = {title: el.children[0].textContent + ': '})) //knowledge panel infos title
    doc.querySelectorAll('.kno-fv').forEach((el, i) => (data.knwlPanel.infos[i].content = el.textContent.replace(' - Disclaimer', '').replace(', MORE', '').replace('%)', '%)\n'))) //knowledge panel infos content
    //TODO: remove unwanted elements from knowledge panel infos (eg: q=toyota)
  } else data.hasKnwlPanel = false

  return await renderFile('./views/index.hbs', data)
}


async function GIS(query: string) {
  function fileExt(s: string) {
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].some(imgExt)
    function imgExt(ext: string) {
      return s.toLowerCase().includes(ext)
    }
  }
  function imgRefs(content: string) {
    const refs = []
    const re = /\["(http.+?)",(\d+),(\d+)\]/g
    let result
    while ((result = re.exec(content)) !== null) {
      if (result.length > 3 && !result[1].includes('gstatic.com')) {
        refs.push({
          url: result[1],
          width: +result[3],
          height: +result[2]
        })
      }
    }
    return refs
  }

  const doc = new DOMParser().parseFromString(
    await fetch('http://google.com/search?tbm=isch&q=' + query.replace(' ', '+'), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
      }
    }).then(res => res.text()),
    'text/html'
  )!

  const scripts = doc.querySelectorAll('script')
  const scriptContents: string[] = []
  for (let i = 0; i < scripts.length; ++i) if (fileExt(scripts[i].textContent)) scriptContents.push(scripts[i].textContent)

  return scriptContents.map(imgRefs)
}