import {Application, Router, helpers, send} from 'https://deno.land/x/oak/mod.ts'
import {DOMParser} from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import {existsSync} from 'https://deno.land/std/fs/mod.ts'
import {search} from './src/search.ts'

//Default config
let config = {
  secure: {
    certFile: '',
    keyFile: ''
  },
  port: 8000
}
if (existsSync('./goodgle.config.ts')) config = await import('./goodgle.config.ts').then(res => res.config) //TODO: handle just some configs changed, like only the cert

const app = new Application()
const router = new Router()
app.addEventListener('listen', () => console.log('Server started'))
router
  .get('/', ctx => {
    ctx.response.redirect('/search')
  })
  .get('/search', async ctx => {
    ctx.response.body = await search(helpers.getQuery(ctx))
  })
  .get('/search-icon.svg', async ctx => {
    await send(ctx, ctx.request.url.pathname, {
      root: './assets'
    })
  })
  .get('/test', async ctx => {
    const doc = new DOMParser().parseFromString(
      await fetch('https://google.com/search?q=' + helpers.getQuery(ctx).q, {
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41',
          'accept-language': 'en-GB,en;q=0.9'
        }
      }).then(res => res.text()),
      'text/html'
    )!
    ctx.response.body = doc.querySelector('html')!.outerHTML
  })

app.use(router.routes())
app.use(router.allowedMethods())

if ((config.secure.certFile || config.secure.keyFile) === '') await app.listen({port: config.port})
else await app.listen({port: config.port, secure: true, certFile: config.secure.certFile, keyFile: config.secure.keyFile})
//TODO: http to https
