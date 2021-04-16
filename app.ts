import {Application, Router, helpers, send} from 'https://deno.land/x/oak/mod.ts'
import {existsSync} from 'https://deno.land/std/fs/mod.ts'
import {DOMParser} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import 'https://deno.land/x/dotenv/load.ts'
import {all} from './src/all.ts'
import {images} from './src/images.ts'

const search = async (params: Record<string, string>) => {
  //TODO: handle lang switch (from config or url)
  //TODO: proxy support
  let url = 'https://google.com/search?q=' + params.q
  if (params.page != undefined) url += '&start=' + (parseInt(params.page) - 1) + '0' //Handle page

  const getDoc = async (url: string) =>
    new DOMParser().parseFromString(
      await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41'
        }
      }).then(res => res.text()),
      'text/html'
    )!

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
  .get('/', async ctx => {
    ctx.response.body = await Deno.readTextFile('./views/index.html')
  })
  .get('/search', async ctx => {
    ctx.response.body = await search(helpers.getQuery(ctx))
  })
  .get('/search.svg', async ctx => {
    await send(ctx, ctx.request.url.pathname, {root: './assets'})
  })
  .get('/goodgle.svg', async ctx => {
    await send(ctx, ctx.request.url.pathname, {root: './assets'})
  })
app.use(router.routes())
app.use(router.allowedMethods())

if ((Deno.env.get('CERT_FILE') || Deno.env.get('KEY_FILE')) != undefined && existsSync(Deno.env.get('CERT_FILE')!) && existsSync(Deno.env.get('KEY_FILE')!))
  await app.listen({
    port: Deno.env.get('PORT') == undefined ? 8000 : parseInt(Deno.env.get('PORT')!),
    secure: true,
    certFile: Deno.env.get('CERT_FILE')!.toString(),
    keyFile: Deno.env.get('KEY_FILE')!.toString()
  })
else
  await app.listen({
    port: Deno.env.get('PORT') == undefined ? 8000 : parseInt(Deno.env.get('PORT')!)
  })

//TODO: http to https
//TODO: PWA
