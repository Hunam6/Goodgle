import {Document} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {renderFile} from 'https://deno.land/x/mustache_ts/mustache.ts'

export const images = async (doc: Document) => {
  const data: {
    query: string
    IMGs: Record<string, string | number>[]
    stringedIMGs: string
  } = {
    query: doc.querySelector('title')!.textContent.split(' - ')[0],
    IMGs: [],
    stringedIMGs: ''
  }

  const baseImgs = JSON.parse(doc.querySelector('#wiz_jd')!.previousElementSibling!.textContent.slice(68, -21).split('"GRID_STATE0",null,')[1].split(',"","","')[0])
  baseImgs.forEach((el: any[], i: number) => (el[0] !== 1 ? baseImgs.splice(i, 1) : null))
  baseImgs.forEach(
    (el: any[], i: number) =>
      (data.IMGs[i] = {
        color: el[1][6],
        height: el[1][2][1],
        width: el[1][2][2],
        resizedIMG: el[1][2][0],
        originalIMG: el[1][3][0],
        desc: el[1][9]['2003'][3],
        URL: el[1][9]['2003'][2],
        title: el[1][9]['2003'][12]
      })
  )
  data.stringedIMGs = JSON.stringify(data.IMGs.map(({resizedIMG}) => resizedIMG))

  //TODO: ability to click on an image and get all the custom "data-" attributes displayed nicely, a popup or sidebar, or maybe a "bottom bar"
  //TODO: find a way to load additional images

  return await renderFile('./views/images.hbs', data)
}
