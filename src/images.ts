//deno-lint-ignore-file no-explicit-any
import {Document} from 'deno_dom'
import {renderFile} from 'mustache_ts'

export const images = async (doc: Document, lang: string) => {
  const data: any = {
    search: '',
    menu: '',
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
    IMGs: [],
    stringedIMGs: '',
    stringedAspectRatio: ''
  }

  //Get menu infos
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
  //TODO: Implement data.hiddenMenu aka "more" on google.com to access others tabs

  //Spelling check
  if (doc.querySelector('.hWrGN') != null) {
    data.proposition.proposition.text = doc.querySelector('.WxYNlf')!.textContent.slice(0, -doc.querySelector('.TADXpd')!.textContent.length)
    data.proposition.proposition.data = doc.querySelector('.TADXpd')!.textContent
    data.proposition.proposition.link = '/search/?tab=images&q=' + data.proposition.proposition.data
    data.proposition.original.text = doc.querySelector('.KtvGCc')!.textContent.slice(0, -doc.querySelectorAll('.TADXpd')![1].textContent.length).toLocaleLowerCase()
    data.proposition.original.link = '/search/?tab=images&q=' + data.proposition.proposition.data + '&trueSpelling=1'
  } else data.hasProposition = false

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

  //TODO: find a way to load additional images

  //Templates
  data.search = await renderFile('./templates/search.hbs', {
    query: data.query
  })
  data.menu = await renderFile('./templates/menu.hbs', {
    shownMenu: data.shownMenu,
    hiddenMenu: data.hiddenMenu
  })

  return await renderFile('./pages/images.hbs', data)
}