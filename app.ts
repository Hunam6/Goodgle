import {Application, Router, helpers, send} from 'oak'
import {DOMParser} from 'deno_dom'
import {exists} from 'https://deno.land/std/fs/mod.ts'
import 'https://deno.land/x/dotenv/load.ts'
import {rendSearch, rendPage} from './src/utils.ts'
import {all} from './src/all.ts'
import {images} from './src/images.ts'
import {videos} from './src/videos.ts'

function getLang(params: Record<string, string> = {}): string {
  let lang = ''
  if ((Deno.env.get('LANG') || params.lang) != undefined) {
    if ((Deno.env.get('LANG') && params.lang) != undefined || params.lang != undefined) lang = params.lang
    else lang = Deno.env.get('LANG')!.toString()
  }
  return lang
}

function getRdmUA(): string {
  const rdmStr = () => Date.now().toString(36) + Math.random().toString(36).substring(2)
  const OSs = ['Windows NT;', 'Macintosh', 'X11; Linux x86_64', 'X11; Linux i686', 'X11; CrOS i686', 'X11; OpenBSD i386', 'X11; NetBSD']
  return `Mozilla/5.0 (${OSs[~~(Math.random() * OSs.length)]} ${rdmStr()}) AppleWebKit/${rdmStr()} (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * (500 - 50)) + 49} Safari/${rdmStr()} OPR/${rdmStr()}`
}

async function search(params: Record<string, string>) {
  //TODO: proxy support (maybe use https://proxyscrape.com/free-proxy-list)
  //TODO: add tests like with no results etc
  //TODO: blacklist sites

  let url = 'https://google.com/search?q=' + params.q
  if (params.page != undefined) url += '&start=' + (parseInt(params.page) - 1) + '0' //Handle page
  url += '&hl=' + getLang(params)
  if (params.trueSpelling != undefined) url += '&nfpr=' + params.trueSpelling //Handle force good spelling

  const getDoc = async (url: string) =>
    new DOMParser().parseFromString(
      await fetch(url, {
        headers: {
          'user-agent': getRdmUA()
        }
      }).then(res => res.text()),
      'text/html'
    )!

  //Handle tabs
  switch (params.tab) {
    case 'images':
      url += '&tbm=isch'
      return images(await getDoc(url), getLang(params))
    case 'videos':
      url += '&tbm=vid'
      return videos(await getDoc(url), getLang(params))
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
    case 'maps':
      //TODO: maps
      break
    case 'flights':
      //TODO: flights
      break
    case 'finance':
      //TODO: finance
      break
    default:
      return all(await getDoc(url), getLang(params))
  }
}

const app = new Application()
const router = new Router()
app.addEventListener('listen', ({secure, hostname, port}) => console.log('Listening on: ' + (secure ? 'https://' : 'http://') + (hostname ?? 'localhost') + ':' + port))
router
  .get('/', async ctx => {
    ctx.response.body = await rendPage('home', {...await rendSearch()}, getLang())
  })
  .get('/search', async ctx => {
    ctx.response.body = await search(helpers.getQuery(ctx))
  })
  .get('/autocomplete', async ctx => {
    ctx.response.body = await fetch('https://suggestqueries.google.com/complete/search?client=toolbar&q=' + helpers.getQuery(ctx).q, {
      headers: {
        'user-agent': getRdmUA()
      }
    })
      .then(res => res.text())
      .then(res => {
        const suggestions: [string, string[]] = [helpers.getQuery(ctx).q, res.split('"').filter((_, b) => b % 2 !== 0)]
        suggestions[1].shift()
        suggestions[1].forEach((el, i) => suggestions[1][i] = el.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec)))
        return suggestions
      })
  })
  .get('/opensearch.xml', async ctx => {
    ctx.response.headers.set('Content-Type', 'application/opensearchdescription+xml')
    ctx.response.body = (await Deno.readTextFile('./assets/opensearch.xml')).replaceAll('{URL}', ctx.request.url.origin)
  })
  .get('/cors', async ctx => {
    ctx.response.body = await fetch(helpers.getQuery(ctx).url, {
      headers: {
        'user-agent': getRdmUA()
      }
    }).then(res => res.blob())
    ctx.response.headers.set('Access-Control-Allow-Origin', '*')
  })
app.use(router.routes())
app.use(router.allowedMethods())
app.use(async ctx => {
  if (await exists('./assets' + ctx.request.url.pathname)) await send(ctx, ctx.request.url.pathname, {root: './assets'})
  else {
    ctx.response.body = 'error 404' //TODO: make a good looking 404 page
    ctx.response.status = 404
  }
})

await app.listen({port: Deno.env.get('PORT') == undefined ? 8080 : parseInt(Deno.env.get('PORT')!)})

//TODO: Deno Deploy support
//TODO: Qovery support
//TODO: Railway instructions