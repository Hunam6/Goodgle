//deno-lint-ignore-file no-explicit-any
import {rendSearch, rendMenu, rendPage} from '../src/utils.ts'
import type {Document} from 'deno_dom'

export const images = async (doc: Document, lang: string) => {
  let data: any = {
    proposition: '',
    IMGs: [],
    stringedIMGs: '',
    stringedAspectRatio: ''
  }

  //Spell check / No results
  //eg: q=minecraftg
  if (doc.querySelector('.hWrGN')) {
    data.proposition =
      doc.querySelector('.WxYNlf')!.innerHTML.split('<')[0]
      + ' <a href="/search?q='
      + data.query
      + '">'
      + data.query
      + '</a>, '
    if (doc.querySelector('.KtvGCc>.TADXpd')) data.proposition +=
      doc.querySelector('.KtvGCc')!.innerHTML.split('<')[0].toLocaleLowerCase()
      + ' <a href="/search?q='
      + doc.querySelectorAll('.TADXpd')[1].textContent
      + '&trueSpelling=1">'
      + doc.querySelectorAll('.TADXpd')[1].textContent
      + '</a>'
    else data.proposition +=
      doc.querySelector('.KtvGCc')!.textContent.charAt(0).toLocaleLowerCase()
      + doc.querySelector('.KtvGCc')!.textContent.slice(1)
  }
  //eg: q=minecraft+hhjhjhjhjhjhjh
  if (doc.querySelector('.G0nQ7b')) data.proposition =
    doc.querySelector('.G0nQ7b')!.textContent
    + ' <a href="/search?q='
    + doc.querySelector('.TADXpd')!.textContent
    + '">'
    + doc.querySelector('.TADXpd')!.textContent
    + '</a>'
  if (doc.querySelector('.eUYiW')) {
    //eg: q=q+dsqdsqhdsqhdh
    data.proposition =
      '<a href="/search?q='
      + doc.querySelector('.M5HqZb>strong')!.textContent
      + '">'
      + doc.querySelector('.M5HqZb>strong')!.textContent
      + '</a>'
      + doc.querySelector('.M5HqZb')!.innerHTML.split('>')[2]
      + '<br>'
      + doc.querySelector('.eUYiW')!.children[1].textContent
      + ' '
    doc.querySelectorAll('.pvadze>li').forEach((el, i) => i < 3 ? data.proposition += el.textContent.toLocaleLowerCase().slice(0, -1) + ', ' : data.proposition += el.textContent.toLocaleLowerCase())
  } else {
    //Get images
    const baseImgs = JSON.parse(doc.querySelector('#wiz_jd')!.previousElementSibling!.textContent.slice(68, -21).split('"GRID_STATE0",null,')[1].split(',"","","')[0])
    baseImgs.forEach((el: any[], i: number) => (el[0] !== 1 ? baseImgs.splice(i, 1) : null))
    baseImgs.forEach((el: any[], i: number) => {
      data.IMGs[i] = {
        color: el[1][6],
        height: el[1][2][1],
        width: el[1][2][2],
        resized: el[1][2][0],
        original: el[1][3][0],
        desc: el[1][9]['2003'][3],
        URL: el[1][9]['2003'][2],
        title: el[1][9]['2003'][12]
      }
    })
    data.stringedIMGs = JSON.stringify(data.IMGs.map(({resized}: {resized: number}) => resized))
    data.stringedAspectRatio = JSON.stringify(data.IMGs.map(({height, width}: {height: number, width: number}) => [height, width]))
  }

  //TODO: find a way to load additional images

  data = {
    ...data,
    ...await rendSearch(doc),
    ...await rendMenu(doc, true)
  }

  return rendPage('images', data, lang)
}