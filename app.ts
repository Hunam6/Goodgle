import {Application, Router, helpers, send} from 'oak'
import {DOMParser} from 'deno_dom'
import {exists} from 'https://deno.land/std/fs/mod.ts'
import 'https://deno.land/x/dotenv/load.ts'
import {getRdmUA, fetchURL, getFinanceData, rendSearch, rendPage} from './src/utils.ts'
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

async function search(params: Record<string, string>) {
  //TODO: proxy support (maybe use https://proxyscrape.com/free-proxy-list)
  //TODO: add tests like with no results etc
  //TODO: blacklist sites

  let URL = 'https://google.com/search?q=' + params.q
  if (params.page != undefined) URL += '&start=' + (parseInt(params.page) - 1) + '0' //Handle page
  URL += '&hl=' + getLang(params)
  if (params.trueSpelling != undefined) URL += '&nfpr=' + params.trueSpelling //Handle force good spelling
  const getDoc = async (URL: string) => new DOMParser().parseFromString(await fetchURL(URL).then(res => res.text()), 'text/html')!

  //Handle tabs
  switch (params.tab) {
    case 'images':
      URL += '&tbm=isch'
      return images(await getDoc(URL), getLang(params))
    case 'videos':
      URL += '&tbm=vid'
      return videos(await getDoc(URL), getLang(params))
    case 'news':
      URL += '&tbm=nws'
      //TODO: news
      break
    case 'shopping':
      URL += '&tbm=shop'
      //TODO: shopping
      break
    case 'books':
      URL += '&tbm=bks'
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
      return all(await getDoc(URL), getLang(params))
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
    ctx.response.body = await fetchURL('https://suggestqueries.google.com/complete/search?client=toolbar&q=' + helpers.getQuery(ctx).q)
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
  }).get('/finance', async ctx => {
    ctx.response.body = await getFinanceData(helpers.getQuery(ctx).period, helpers.getQuery(ctx).id)
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