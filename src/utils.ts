//deno-lint-ignore-file no-explicit-any
import {fromUnixTime, format} from 'https://raw.githubusercontent.com/pr0ggy/deno-date-fns/deno_bundle_fixes/index.js'
import {renderFile} from 'mustache_ts'
import type {Document} from 'deno_dom'

export function getQuery(doc: Document): Record<string, string> {
  return {
    query: doc.querySelector('title')!.textContent.split(' - ')[0]
  }
}

export function getBigFatJS(doc: Document): string {
  let bigFatJS = ''
  doc.querySelectorAll('script').forEach(el => el.textContent.includes('(function(){var u=') ? bigFatJS = el.textContent : null)
  return bigFatJS
}

export function getRdmUA() {
  const rdmStr = () => Date.now().toString(36) + Math.random().toString(36).substring(2)
  const OSs = ['Windows NT;', 'Macintosh', 'X11; Linux x86_64', 'X11; Linux i686', 'X11; CrOS i686', 'X11; OpenBSD i386', 'X11; NetBSD']
  return `Mozilla/5.0 (${OSs[~~(Math.random() * OSs.length)]} ${rdmStr()}) AppleWebKit/${rdmStr()} (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * (500 - 50)) + 49} Safari/${rdmStr()} OPR/${rdmStr()}`
}

export function fetchURL(URL: string) {
  return fetch(URL, {
    headers: {
      'user-agent': getRdmUA(),
      'Origin': 'https://google.com'
    }
  })
}

export async function getFinanceData(period: string, id: string) {
  let interval = ''
  if (period === '1d') interval = '300'
  else if (period === '5d') interval = '1800'
  else if (period === ('5Y' || '40Y')) interval = '604800'
  else interval = '86400'
  const URL = 'https://www.google.com/async/finance_wholepage_chart?async=mid_list:/'
    + id
    + ',period:'
    + period
    + ',interval:'
    + interval
    + ',_fmt:pc'
  return await fetchURL(URL)
    .then(res => res.text())
    .then(res => {
      //console.log('---------------------------------------------------------')
      //console.log(JSON.parse(res.substring(res.split('[[["')[0].length))[0][0][1])
      const out: Record<string, (string | number)[]> = {
        values: [],
        labels: []
      }
      JSON.parse(JSON.parse(res.substring(res.split('[[["')[0].length))[0][0][1])[0][3][0][0][0][0].forEach((el: any) => {
        out.values.push(el[2][0][0])
        out.labels.push(format(fromUnixTime(el[5] * 60), 'dd/MM/yyyy HH:mm', {})) //TODO: better tooltip (relative from today for short period, no year for current year)
      })
      return out
    })
}

export async function rendPage(page: string, data: Record<string, any>, lang: string): Promise<string> {
  return await renderFile(Deno.cwd() + '/templates/base.hbs', {
    page: await renderFile(Deno.cwd() + '/pages/' + page + '.hbs', data),
    lang: lang || 'en',
    style: page
  })
}

export async function rendMenu(doc: Document, imagesTab = false): Promise<Record<string, string>> {
  const data: any = {
    shownMenu: [],
    hiddenMenu: []
  }

  if (imagesTab) {
    doc.querySelectorAll('.m3kSL').forEach((el, i) => {
      const rawID = el.parentElement!.getAttribute('href')!
      let ID = ''
      if (rawID == null) ID = 'images'
      else if (rawID.includes('//maps')) ID = 'maps'
      else if (i === 0) ID = 'all'
      else ID = {
        'vid': 'videos',
        'nws': 'news',
        'shop': 'shopping',
        'bks': 'books',
        'flm': 'flights',
        'fin': 'finance'
      }[rawID.split('tbm=')[1].split('&')[0]]!
      if (i < 5) data.shownMenu.push({
        id: ID,
        value: el.parentElement!.textContent
      })
      else data.hiddenMenu.push({
        id: ID,
        value: el.parentElement!.textContent
      })
    })
  } else {
    const raw = getBigFatJS(doc).split('var m=[')[1].split(';')[0]
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
  }
  return {
    menu: await renderFile(Deno.cwd() + '/templates/menu.hbs', data)
  }
}

export async function rendSearch(doc?: Document): Promise<Record<string, string>> {
  return {
    search: await renderFile(Deno.cwd() + '/templates/search.hbs', doc ? getQuery(doc!) : {search: ''})
  }
}

export async function rendNavigation(): Promise<Record<string, string>> {
  return {
    navigation: await renderFile(Deno.cwd() + '/templates/navigation.hbs', {})
  }
}

export async function rendFinance(doc: Document): Promise<Record<string, string>> {
  const data: any = {}

  if (doc.querySelector('#knowledge-finance-wholepage__entity-summary')) {
    data.hasFinance = true
    data.finance = {
      ID: getBigFatJS(doc).split("'[[\\x22/")[1].split('\\')[0],
      positive: false,
      data: '',
      legend: {
        price: '',
        currency: '',
        priceEvolution: '',
        btns: [],
        exchange: ''
      },
      details: []
    }

    if (doc.querySelector('.fw-price-up')) data.finance.positive = true //positive
    await getFinanceData('1d', data.finance.ID).then(res => data.finance.data = JSON.stringify(res)) //data
    data.finance.legend.price = doc.querySelector('.NprOob')!.textContent //price
    data.finance.legend.currency = doc.querySelector('.knFDje')!.textContent //currency
    data.finance.legend.priceEvolution = //price evolution
      doc.querySelector('.WlRRw')!.children[0].textContent
      + doc.querySelector('.jBBUv')!.textContent
      + (data.finance.positive ? ' ▲ ' : ' ▼ ')
      + doc.querySelector('.jdUcZd')!.children[0].textContent
    doc.querySelectorAll('.qUjgX').forEach(el => data.finance.legend.btns.push(el.textContent)) //buttons
    data.finance.legend.exchange = doc.querySelector('.HfMth')!.textContent //exchange
    doc.querySelectorAll('.JgXcPd').forEach(el => data.finance.details.push({ //details
      title: el.textContent,
      content: el.parentElement!.children[1].textContent
    }))
  }

  return {
    finance: await renderFile(Deno.cwd() + '/instantAnswers/finance.hbs', data)
  }
}