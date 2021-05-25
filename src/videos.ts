//deno-lint-ignore-file no-explicit-any
import {rendSearch, rendMenu, rendPage} from '../src/utils.ts'
import type {Document} from 'deno_dom'

export const videos = async (doc: Document, lang: string) => {
  let data: Record<string, any> = {
    proposition: '',
    results: [],
    IMGs: [],
    stringedIMGs: ''
  }

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

  data = {
    ...data,
    ...await rendSearch(doc),
    ...await rendMenu(doc),
  }

  return rendPage('videos', data, lang)
}