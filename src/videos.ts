//deno-lint-ignore-file no-explicit-any
import {renderFile} from 'mustache_ts'
import type {Document} from 'deno_dom'

export const videos = async (doc: Document, lang: string) => {
  const data: any = {
    search: '',
    menu: '',
    lang: lang,
    query: doc.querySelector('title')!.textContent.split(' - ')[0],
    shownMenu: [],
    hiddenMenu: [],
    proposition: '',
    results: [],
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

  //Spell check / No results
  //eg: q=minecraftg
  if (doc.querySelector('#fprs')) data.proposition =
    doc.querySelector('.gL9Hy')!.textContent
    + ' <a href="/search?q='
    + doc.querySelectorAll('.spell_orig')[1].textContent
    + '">'
    + doc.querySelectorAll('.spell_orig')[1].textContent
    + '</a>, '
    + doc.querySelector('.spell_orig')!.textContent
    + ' <a href="/search?q='
    + data.query
    + '&trueSpelling=1">'
    + data.query
    + '</a>'
  //eg: q=minecraft+hhjhjhjhjhjhjh
  if (doc.querySelector('.d2IKib')) data.proposition =
    doc.querySelector('.d2IKib')!.textContent
    + ' <a href="/search?q='
    + doc.querySelectorAll('.gL9Hy')[1].textContent
    + '">'
    + doc.querySelectorAll('.gL9Hy')[1].textContent
    + '</a>'

  //Results

  doc.querySelectorAll('.LC20lb').forEach((el, i) => (data.results[i] = {title: el.textContent})) //title
  doc.querySelectorAll('.yuRUbf').forEach((el, i) => (data.results[i].link = el.children[0].getAttribute('href'))) //link
  doc.querySelectorAll('.PcHvNb').forEach((el, i) => (data.results[i].id = el.children[0].getAttribute('id'))) //IDs
  doc.querySelectorAll('.aCOpRe').forEach((el, i) => (data.results[i].desc = el.textContent)) //description
  doc.querySelectorAll('.uo4vr').forEach((el, i) => (data.results[i].infos = el.textContent)) //infos

  //Get images
  doc.querySelectorAll('script').forEach(el => {
    if (el.textContent.includes(' s=')) {
      data.IMGs.push([
        el.textContent.slice(19).split("'")[0].replaceAll('\\x3d', '='), //Image base64
        el.textContent.split("['")[1].split("'")[0] //Image ID
      ])
    }
  })
  data.stringedIMGs = JSON.stringify(data.IMGs)

  //TODO: find a way to load additional images

  //Templates
  data.search = await renderFile('./templates/search.hbs', {
    query: data.query
  })
  data.menu = await renderFile('./templates/menu.hbs', {
    shownMenu: data.shownMenu,
    hiddenMenu: data.hiddenMenu
  })

  return await renderFile('./pages/videos.hbs', data)
}