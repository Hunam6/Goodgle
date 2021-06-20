//deno-lint-ignore-file no-explicit-any
import {DOMParser} from 'deno_dom'
import {getBigFatJS, getQuery, rendSearch, rendMenu, rendPage, rendNavigation, rendFinance} from '../src/utils.ts'
import type {Document} from 'deno_dom'
export const all = async (doc: Document, lang: string) => {
  let data: any = {
    query: getQuery(doc),
    proposition: '',
    firstResult: {},
    firstResults: [],
    hasQuickAnswers: true,
    quickAnswers: [],
    results: [],
    hasKnwlPanel: true,
    knwlPanel: {
      title: '',
      subtitle: '',
      desc: '',
      infos: [],
      additionalInfos: []
    },
    IMGs: [],
    stringedIMGs: ''
  }

  let noFirstResult = false
  //TODO: error 500 with q=&

  //Spell check / No results
  //eg: q=minecraftg
  if (doc.querySelector('#fprs')) data.proposition =
    doc.querySelector('.gL9Hy')!.textContent
    + ' <a href="/search?q='
    + doc.querySelectorAll('.gL9Hy')[1].textContent
    + '">'
    + doc.querySelectorAll('.gL9Hy')[1].textContent
    + '</a>, '
    + doc.querySelector('.spell_orig')!.innerHTML.split('<')[0].toLocaleLowerCase()
    + ' <a href="/search?q='
    + data.query
    + '&trueSpelling=1">'
    + data.query
    + '</a>'
  //eg: q=minecraft+fdsfdsfsffdgfdgdfgdsqdsqdsqdsq+dsqd+sd+sqd+sqd+sd+sq+sqdq
  if (doc.querySelector('.gqLncc') && doc.querySelector('.uzjuFc')) {
    noFirstResult = true
    const divParts = doc.querySelector('.gqLncc')!.textContent.split(':')
    data.firstResult = {
      title: doc.querySelector('.v3jTId')!.textContent,
      desc:
        divParts[0]
        + ': <a href="/search?q='
        + divParts[1]
        + '">'
        + divParts[1]
        + '</a><br>'
        + doc.querySelector('.Cy9gW')!.textContent.replace('.', '.<br>')
    }
  }
  //eg: q=minecraft+fdsfdsfsffdgfdgdfgdsqdsqdsqdsq+dsqd+sd+sqd+sqd+sd+sq
  if (!doc.querySelector('.gqLncc') && doc.querySelector('.uzjuFc')) {
    noFirstResult = true
    data.firstResult = {
      title: doc.querySelector('.v3jTId')!.textContent,
      desc: doc.querySelector('.Cy9gW')!.textContent
    }
  }
  //eg: q=minecraft+hhjhjhjhjhjhjh
  if (doc.querySelector('.gqLncc') && !doc.querySelector('.uzjuFc')) data.proposition =
    doc.querySelector('.gL9Hy')!.textContent
    + ' <a href="/search?q='
    + doc.querySelectorAll('.gL9Hy')![1].textContent
    + '">'
    + doc.querySelectorAll('.gL9Hy')![1].textContent
    + '</a>'
  //eg: q=minecraft+fdsfdsfsffdgfdgdfgdsqdsqdsqdsq+dsqdsqhdsqhdhsqbdshqbdsqdbsqhdb
  if (doc.querySelector('.card-section>ul')) {
    noFirstResult = true
    data.firstResult = {
      title: doc.querySelector('.card-section')!.textContent.split('(')[0]
    }
    doc.querySelectorAll('ul')![3].textContent.split('.').forEach((el, i) => {
      if (i === 0) data.firstResult.desc = el + ', '
      if (i === 1) data.firstResult.desc += el.toLocaleLowerCase() + ', '
      if (i === 2) data.firstResult.desc += el.toLocaleLowerCase() + '.'
    })
  }
  //eg: q=abc+dsqddsqddsqdsqdsdsqdsqddsqsqdsqdsqdsqdsqd
  if (doc.querySelector('#result-stats')) if (doc.querySelector('#result-stats')!.textContent.split(/\s/g)[1] === '0') {
    noFirstResult = true
    data.firstResult = {
      title: '0 ' + doc.querySelector('#result-stats')!.textContent.split(/\s/g)[2]
    }
  }

  //Results
  doc.querySelectorAll('.LC20lb.DKV0Md').forEach((el, i) => (data.results[i] = {title: el.textContent})) //results title
  doc.querySelectorAll('.IsZvec').forEach((el, i) => (data.results[i].desc = el.children[0].innerHTML)) //results description
  doc.querySelectorAll('.TbwUpd.NJjxre').forEach((el, i) => (data.results[i].shownLink = el.textContent)) //results shown link
  doc.querySelectorAll('.yuRUbf').forEach((el, i) => (data.results[i].link = el.children[0].getAttribute('href')!)) //results link
  if (!noFirstResult) data.firstResult = data.results.shift() //first result
  if (doc.querySelectorAll('.st').length !== 1) {
    doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i] = {title: el.textContent})) //first results title
    doc.querySelectorAll('.usJj9c').forEach((el, i) => (data.firstResults[i].desc = el.textContent)) //first results description
    doc.querySelectorAll('.l').forEach((el, i) => (data.firstResults[i].link = el.parentElement!.children[0].getAttribute('href')!)) //first results link
    data.firstResults = data.firstResults.slice(0, 4) //limit to 4 first results
  }

  //Quick answers
  if (doc.querySelector('.JolIg')) {
    let i = 0
    getBigFatJS(doc)
      .split(');}')
      .filter(el => (el.includes('iOBnre') || el.includes('wDYxhc')) && !el.includes('Ya0K2e'))
      .map(el => JSON.parse('"' + el.split("'")[3].replaceAll('\\x', '\\u00') + '"'))
      .forEach(el => {
        const doc = new DOMParser().parseFromString(el, 'text/html')!
        if (el.includes('iOBnre')) {
          data.quickAnswers.push({
            question: doc.querySelector('.iOBnre')!.textContent.split(': ')[1]
          })
          i++
        }
        else data.quickAnswers[i - 1] != undefined ? data.quickAnswers[i - 1].answer = doc.querySelector('.wDYxhc')!.innerHTML : null
      })
  } else data.hasQuickAnswers = false

  //Knowledge panel
  if (doc.querySelector('.liYKde.g.VjDLd')) {
    data.knwlPanel.title = doc.querySelector('.qrShPb')!.textContent //title
    if (doc.querySelector('.wwUB2c')) data.knwlPanel.subtitle = doc.querySelector('.wwUB2c')!.textContent //subtitle
    else if (doc.querySelector('.YhemCb')) data.knwlPanel.subtitle = doc.querySelector('.YhemCb')!.textContent
    if (doc.querySelector('.kno-rdesc')) data.knwlPanel.desc = doc.querySelector('.kno-rdesc')!.children[1].textContent //description
    if (doc.querySelector('.ivg-i')) { //image
      const base = doc.querySelector('.ivg-i')!.children[0]
      if (doc.querySelector('.ivg-i')) data.knwlPanel.IMG = {
        IMG: base.getAttribute('id'),
        height: base.getAttribute('height'),
        width: base.getAttribute('width')
      }
    }

    //Infos
    doc.querySelectorAll('.wDYxhc').forEach(element => {
      const addInfo = (title: string, content: string) => data.knwlPanel.infos.push({
        title: title,
        content: content
      })
      const createLink = (link: string, shown?: string) => '<a href="' + link + '">' + (shown ? shown : link) + '</a>'

      if (element.children[0]) {
        const el = element.children[0].parentElement!
        const attr = el.getAttribute('data-attrid')!
        if (el.hasAttribute('data-attrid')) {
          if (
            el.children[0].children[0] &&
            !el.children[0].classList.contains('kpS1Ac') &&
            !el.children[0].classList.contains('Ob2kfd') &&
            !el.querySelector('g-scrolling-carousel') &&
            !attr.includes('edit') &&
            !el.querySelector('.Ss2Faf') &&
            !el.querySelector('.P7hEAd') &&
            !el.querySelector('.qd9Mkf') && //TODO: like percentage (eg: a film)
            !el.querySelector('.PQbOE')
          ) {
            if (attr === 'kc:/local:scalable_attributes_group') {
              //security
              const base = el.querySelector('.Wowtd')!.parentElement!
              addInfo(
                base.children[0].textContent,
                base.textContent.slice(base.children[0].textContent.length, -base.children[1].textContent.length - 3)
              )
            } else if (attr === 'kc:/collection/knowledge_panels/has_phone:phone') {
              //phone
              const tel = el.children[0].children[0].children[1].textContent
              addInfo(
                el.children[0].children[0].children[0].textContent,
                createLink('tel: ' + tel, tel)
              )
            } else if (attr === 'kc:/location/location:hours') {
              //hours
              addInfo(
                el.querySelector('.GRkHZd')!.textContent,
                el.querySelector('.h-n')!.textContent
              )
            } else if (attr === 'kc:/location/location:address') {
              //address
              const link = el.children[0].children[0].children[1].textContent
              addInfo(
                el.children[0].children[0].children[0].textContent,
                createLink('https://www.google.com/maps?q=' + link, link)
              )
            } else if (attr.includes('website')) {
              //website
              const link = el.querySelector('.Eq0J8')!.children[0]
              addInfo(
                el.querySelector('.GRkHZd')!.textContent,
                createLink(link.getAttribute('href')!, link.textContent)
              )
            } else if (el.querySelector('.Eq0J8')) {
              //list of links
              addInfo(
                el.querySelector('.GRkHZd')!.textContent,
                el.querySelector('.Eq0J8')!.textContent
              )
            } else if (el.querySelector('.xFAlBc')) {
              //appointment
              addInfo(
                el.querySelector('b')!.textContent + ': ',
                createLink(el.querySelector('.xFAlBc')!.getAttribute('href')!.split('/?utm')[0], el.querySelector('.xFAlBc')!.textContent)
              )
            } else if (el.querySelector('c-wiz')) {
              //some special cases
              const title = el.querySelector('.d2aWRb')!.textContent
              addInfo(
                title,
                el.querySelector('.d2aWRb')!.parentElement!.textContent.substring(title.length)
              )
            } else if (el.querySelector('.w8qArf')) {
              //normal
              addInfo(
                el.children[0].children[0].children[0].textContent,
                el.children[0].children[0].children[1].textContent
              )
            }
          }
        }
      }
    })

    //Additional infos
    if (doc.querySelector('.Ss2Faf:not(.ellip)')) {
      let index = 0
      doc.querySelectorAll('.Ss2Faf:not(.ellip)').forEach(el => {
        const next = el.parentElement!.children[1]
        //check if not an ad (eg: q=minecraft+dungeons)
        if (el.parentElement!.children[0].className.includes('qLYAZd') && !el.parentElement!.className.includes('ellip') && (next.className !== 'JeEise fBkrHb') && (next.getAttribute('style') !== 'display:none')) {
          //title
          if (el.children[0]) {
            if (el.children[0].children[0]) data.knwlPanel.additionalInfos[index] = {title: el.children[0].children[0].textContent}
            else data.knwlPanel.additionalInfos[index] = {title: el.textContent}
          }
          else data.knwlPanel.additionalInfos[index] = {title: el.textContent}
          //content
          if (next.tagName === 'WEB-QUOTE-CONTAINER') {
            //quotes
            data.knwlPanel.additionalInfos[index].isQuotes = true
            data.knwlPanel.additionalInfos[index].quotes = []
            next.querySelectorAll('.kssN8d').forEach(el => data.knwlPanel.additionalInfos[index].quotes.push(el.textContent))
          } else if (next.tagName === 'CRITIC-REVIEWS-CONTAINER') {
            //critic reviews
            data.knwlPanel.additionalInfos[index].isCritics = true
            data.knwlPanel.additionalInfos[index].critics = []
            next.children[0].children[0].childNodes.forEach(el => data.knwlPanel.additionalInfos[index].critics.push({
              critic: el.children[0].children[0].children[0].textContent,
              link: el.children[0].children[0].children[1].getAttribute('href'),
              name: el.children[0].children[1].children[1].querySelector('a')!.textContent,
              icon: el.children[0].children[1].children[0].children[0].getAttribute('id')
            }))
          } else if (next.className === 'tpa-cc') {
            //musical platforms
            data.knwlPanel.additionalInfos[index].isPlatforms = true
            data.knwlPanel.additionalInfos[index].platforms = []
            next.querySelectorAll('tr').forEach(el => data.knwlPanel.additionalInfos[index].platforms.push({
              platform: el.textContent,
              link: el.children[0].children[0].getAttribute('href'),
              icon: el.children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].getAttribute('id')
            }))
          } else if (next.className === 'AxJnmb gIcqHd') {
            //artworks
            data.knwlPanel.additionalInfos[index].isWorks = true
            data.knwlPanel.additionalInfos[index].works = []
            next.childNodes.forEach(el => data.knwlPanel.additionalInfos[index].works.push({
              work: el.textContent,
              link: '/search?q=' + el.textContent
            }))
          } else if (next.className === 'idWF4b') {
            //TODO: handle "Audience reviews" eg: q=minecraft+dungeons
            //TODO: fix detecting Audience rating summary
          } else if (next.className === 'jYcvae kY5Gde') {
            //TODO: handle "Audience rating summary" eg: q=minecraft+dungeons
          } else {
            //normal
            data.knwlPanel.additionalInfos[index].isNormal = true
            data.knwlPanel.additionalInfos[index].elements = []
            next.childNodes.forEach((el, j) => {
              if (j < 4) data.knwlPanel.additionalInfos[index].elements.push({
                title: el.children[0].children[1] ? el.children[0].children[1].textContent : el.textContent, //additional info title
                subtitle: el.children[0].children[2] ? el.children[0].children[2].textContent : null, //additional info subtitle
                link: el.parentElement!.children[j].querySelector('a')!.getAttribute('href')!.startsWith('/') ? el.parentElement!.children[j].querySelector('a')!.getAttribute('href')!.split('&')[0] : el.parentElement!.children[j].querySelector('a')!.getAttribute('href'), //additional info link
                ID: el.children[0].querySelector('img')!.getAttribute('id') //additional info image ID
              })
            })
          }
          index++
        }
      })
    }
  } else data.hasKnwlPanel = false

  //Get images
  const IMGs: string[][] = []
  doc.querySelectorAll('script').forEach(el => {
    if (el.textContent.includes('{var s')) IMGs.push([
      el.textContent.slice(19).split("'")[0].replaceAll('\\x3d', '='), //Image base64
      el.textContent.split("['")[1].split("'")[0] //Image ID
    ])
  })
  data.IMGs = JSON.stringify(IMGs)

  data = {
    ...data,
    ...await rendSearch(doc),
    ...await rendMenu(doc),
    ...await rendNavigation(),
    ...await rendFinance(doc)
  }

  return rendPage('all', data, lang)
}