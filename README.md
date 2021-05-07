<h1 align='center'><ins>Goodgle</ins></h1>
<p align='center'><strong>A metasearch engine based on Google written in Deno 🦕</strong></p>

---

## This project is at an early stage!

## Goals

- Based on Google so really good results
- Beautiful UI and innovative UX
- Privacy respecting (no cookies, no link-tracking, random user-agent, etc.)
- No ads
- Proxy support (maybe Tor too in the future)
- Optional customization

<i><b>Non-goal</b>: support old browsers</i>

## Usage

### Locally

Run `deno run --allow-net --allow-read --allow-env --unstable app.ts`

### On Okteto

Click on [![Okteto](https://okteto.com/develop-okteto.svg)](https://cloud.okteto.com/deploy?repository=https://github.com/Hunam6/Goodgle)

## Contributing

Hi and welcome! Contributing is very welcome! Every type of contribution is welcomed, just remember to follow the [GitHub Community Guidelines](https://docs.github.com/articles/github-community-guidelines).

*PS: if you don't know where to start look at all the "TODO" comments (I recommend Todo Tree for VSCode).*

## License

This project is licensed under the [Mozilla Public License 2.0](./LICENSE).

## Credits

[Whoogle](https://github.com/benbusby/whoogle-search) by [@benbusby](https://github.com/benbusby): the original idea and the logic behind the autocomplete search script.

[Oak](https://github.com/oakserver/oak) by [@kitsonk](https://github.com/kitsonk): the web framework/middleware.

[Deno DOM](https://github.com/b-fuze/deno-dom) by [@b-fuze](https://github.com/b-fuze): the DOM parser.

[Dotenv](https://github.com/pietvanzoen/deno-dotenv) by [@bpietvanzoen](https://github.com/pietvanzoen): the .env file handler.

[Mustache.ts](https://github.com/fabrv/mustache.ts) by [@fabrv](https://github.com/fabrv): the template engine.
