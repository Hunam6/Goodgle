<h1 align='center'><img src="./assets/goodgle.svg" height="24" width="24"/> <ins>Goodgle</ins></h1>
<p align='center'><strong>A metasearch engine based on Google written in Deno 🦕</strong></p>

---

![Goodgle Demo](https://github.com/Hunam6/Goodgle/assets/38606542/544a5d81-4f43-45ad-aadc-251366cf5942)

### ⚠️ Current state of the project ⚠️

I haven't been posting updates since some days because I'm working on a V2 written in [V](https://github.com/vlang/v)! The current project is pretty usable but, the speed isn't good enough. For a casual website that's good but for a search engine it isn't satisfying enough. I'm also currently blocked by a [bug/feature in V itself](https://github.com/vlang/v/issues/10683).

### *This project is at an early stage!*

## Goals

- Based on Google to get best results
- Beautiful UI and innovative UX
- Privacy respecting (no cookies, no link-tracking, random user-agent, etc.)
- No ads
- Proxy support (maybe Tor too in the future)
- Optional customization

<i><b>Non-goal</b>: support old, or even not so old, browsers</i>

## Usage

### Quickly test it

You can quickly test it on my instances, just remember to only use it for testing proposes as they may be unavailable during some dev sessions:

- <https://goodgle.up.railway.app>
- <https://goodgle-hunam6.cloud.okteto.net>

### Locally

    git clone https://github.com/Hunam6/Goodgle & cd Goodgle
    deno run --allow-net --allow-read --allow-env --unstable --import-map=IM.json app.ts

### On Railway

Click on [![Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2FHunam6%2FGoodgle&envs=PORT&PORTDefault=8080)

### On Okteto

Click on [![Okteto](https://okteto.com/develop-okteto.svg)](https://cloud.okteto.com/deploy?repository=https://github.com/Hunam6/Goodgle)

## Contributing

Hi and welcome! Contributing is very welcome! Every type of contribution is welcomed, just remember to follow the [GitHub Community Guidelines](https://docs.github.com/articles/github-community-guidelines).

- Report `Internal Server Error`s when performing searches, don't forget to provide the search terms and the geographic location of the server (or the instance used).

- Submit an issue.

- Submit a PR: please follow the styling rules indicated in `.editorconfig` and `.vscode/settings.json`.

*__PS__: if you don't know where to start look at all the "TODO" comments (I recommend [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) for VSCode).*

## License

This project is licensed under the [Mozilla Public License 2.0](./LICENSE).

## Credits

[Whoogle](https://github.com/benbusby/whoogle-search) by [@benbusby](https://github.com/benbusby): the original idea

[Oak](https://github.com/oakserver/oak) by [@kitsonk](https://github.com/kitsonk): the web framework/middleware

[Deno DOM](https://github.com/b-fuze/deno-dom) by [@b-fuze](https://github.com/b-fuze): the DOM parser

[Dotenv](https://github.com/pietvanzoen/deno-dotenv) by [@bpietvanzoen](https://github.com/pietvanzoen): the .env file handler

[Mustache.ts](https://github.com/fabrv/mustache.ts) by [@fabrv](https://github.com/fabrv): the template engine
