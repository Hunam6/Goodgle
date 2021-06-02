//deno-lint-ignore-file no-explicit-any
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

export async function rendPage(page: string, data: Record<string, any>, lang: string): Promise<string> {
  return await renderFile(Deno.cwd() + '/templates/base.hbs', {
    page: await renderFile(Deno.cwd() + '/pages/' + page + '.hbs', data),
    lang: lang || 'en',
    style: page
  })
}

export async function rendNavigation(): Promise<Record<string, string>> {
  return {
    navigation: await renderFile(Deno.cwd() + '/templates/navigation.hbs', {})
  }
}