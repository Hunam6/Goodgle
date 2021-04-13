import {Document} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {renderFile} from 'https://deno.land/x/mustache_ts/mustache.ts'

export const images = async (doc: Document) => {
  //TODO: add credit to original script author
  function imgRefs(content: string) {
    const refs = []
    const re = /\["(http.+?)",(\d+),(\d+)\]/g
    let result
    while ((result = re.exec(content)) !== null) if (result.length > 3 && !/gstatic.com|abc.com/.test(result[1])) refs.push({url: result[1]})
    return refs
  }
  const scriptContents: string[] = []
  doc.querySelectorAll('script').forEach(el => (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].some(ext => el.textContent.toLowerCase().includes(ext)) ? scriptContents.push(el.textContent) : null))

  let data: {
    query: string
    imgs: Record<string, string>[]
  } = {
    query: doc.querySelector('title')!.textContent.split(' - ')[0],
    imgs: []
  }

  scriptContents.map(imgRefs)[0].forEach((el, i) => (data.imgs[i] = {url: el.url})) //Images url
  doc.querySelectorAll('.WGvvNb')!.forEach((el, i) => (data.imgs[i].title = el.textContent.slice(0, -el.children[0].textContent.length))) //Images title
  doc.querySelectorAll('.fxgdke')!.forEach((el, i) => (data.imgs[i].subtitle = el.textContent)) //Images subtitle

  //Fix images link
  data.imgs.forEach(el => (el.url.includes('cdn.vox-cdn.com') ? (el.url = 'https://cdn.vox-cdn.com' + el.url.split('cdn.vox-cdn.com')[2]) : null))
  data.imgs.forEach(el => (el.url.includes('play-lh.googleusercontent.com') ? (el.url = el.url.split('\\')[0]) : null))
  data.imgs.forEach(el => el.url.replace('\u003d', '=')) //TODO: Find why it's not working
  data.imgs.forEach(el => (el.url = el.url.split('/revision/latest')[0]))

  //TODO: optimize images (see https://www.industrialempathy.com/posts/image-optimizations)

  return await renderFile('./views/images.hbs', data)
}
