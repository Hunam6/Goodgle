import {Application, Router, helpers, send} from 'https://deno.land/x/oak/mod.ts'
import {existsSync} from 'https://deno.land/std/fs/mod.ts'
import {DOMParser} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {all} from './src/all.ts'
import {images} from './src/images.ts'

//TODO: maybe switch to .env config
//Default config
let config = {
  secure: {
    certFile: '',
    keyFile: ''
  },
  port: 8000
}
if (existsSync('./goodgle.config.ts')) config = await import('./goodgle.config.ts').then(res => res.config) //TODO: handle just some configs changed, like only the cert

const search = async (params: Record<string, string>) => {
  //TODO: handle lang switch (from config or url)
  let url = 'https://google.com/search?q=' + params.q
  if (params.page != undefined) url += '&start=' + (parseInt(params.page) - 1) + '0' //Handle page

  const getDoc = async (url: string) => {
    return new DOMParser().parseFromString(
      await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41',
          'accept-language': 'en-GB,en;q=0.9'
        }
      }).then(res => res.text()),
      'text/html'
    )!
  }

  //Handle tabs
  switch (params.tab) {
    case 'images':
      url += '&tbm=isch'
      return images(await getDoc(url))
    case 'videos':
      url += '&tbm=vid'
      //TODO: videos
      break
    case 'news':
      url += '&tbm=nws'
      //TODO: news
      break
    case 'shopping':
      url += '&tbm=shop'
      //TODO: shopping
      break
    case 'books':
      url += '&tbm=bks'
      //TODO: books
      break
    default:
      return all(await getDoc(url))
  }
}

const app = new Application()
const router = new Router()
app.addEventListener('listen', () => console.log('Server started'))
router
  .get('/', ctx => {
    ctx.response.redirect('/search') //TODO: make a home page, probably need a logo for this, a placeholder for now
  })
  .get('/search', async ctx => {
    ctx.response.body = await search(helpers.getQuery(ctx))
  })
  .get('/search-icon.svg', async ctx => {
    await send(ctx, ctx.request.url.pathname, {
      root: './assets'
    })
  })
app.use(router.routes())
app.use(router.allowedMethods())

if ((config.secure.certFile || config.secure.keyFile) === '') await app.listen({port: config.port})
else await app.listen({port: config.port, secure: true, certFile: config.secure.certFile, keyFile: config.secure.keyFile})
//TODO: http to https
