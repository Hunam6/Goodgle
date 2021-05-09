//deno-lint-ignore-file no-explicit-any
import {Document} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {renderFile} from 'https://deno.land/x/mustache_ts/mustache.ts'

export const images = async (doc: Document, lang: string) => {
  const data: {
    lang: string
    query: string
    proposition: Record<string, Record<string, string>>
    hasProposition: boolean
    IMGs: Record<string, string | number>[]
    stringedIMGs: string
    stringedAspectRatio: string
  } = {
    lang: lang,
    query: doc.querySelector('title')!.textContent.split(' - ')[0],
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
    IMGs: [],
    stringedIMGs: '',
    stringedAspectRatio: ''
  }

  const baseImgs = JSON.parse(doc.querySelector('#wiz_jd')!.previousElementSibling!.textContent.slice(68, -21).split('"GRID_STATE0",null,')[1].split(',"","","')[0])
  baseImgs.forEach((el: any[], i: number) => (el[0] !== 1 ? baseImgs.splice(i, 1) : null))
  baseImgs.forEach(
    (el: any[], i: number) =>
    (data.IMGs[i] = {
      color: el[1][6],
      height: el[1][2][1],
      width: el[1][2][2],
      resized: el[1][2][0],
      original: el[1][3][0],
      desc: el[1][9]['2003'][3],
      URL: el[1][9]['2003'][2],
      title: el[1][9]['2003'][12]
    })
  )
  data.stringedIMGs = JSON.stringify(data.IMGs.map(({resized}) => resized))
  data.stringedAspectRatio = JSON.stringify(data.IMGs.map(({height, width}) => [height, width]))

  //TODO: find a way to load additional images

  if (doc.querySelector('.hWrGN') != null) {
    data.proposition.proposition.text = doc.querySelector('.WxYNlf')!.textContent.slice(0, -doc.querySelector('.TADXpd')!.textContent.length)
    data.proposition.proposition.data = doc.querySelector('.TADXpd')!.textContent
    data.proposition.proposition.link = '/search/?tab=images&q=' + data.proposition.proposition.data
    data.proposition.original.text = doc.querySelector('.KtvGCc')!.textContent.slice(0, -doc.querySelectorAll('.TADXpd')![1].textContent.length).toLocaleLowerCase()
    data.proposition.original.link = '/search/?tab=images&q=' + data.proposition.proposition.data + '&trueSpelling=1'
  } else data.hasProposition = false

  return await renderFile('./views/images.hbs', data)
}