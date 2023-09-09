<img align="right" src="insvex.http.png?raw=true" width="256" height="256" alt="insveX.http Logo" />

<br />

# insvex.http 

## modern, simple and ⚡-fast http server index built with [svelte](https://svelte.dev)[-kit](https://kit.svelte.dev)

<br />
<br />

It can be configured to run as a standalone http- / file-server with SSR (server side rendering)  
*or* run as SPA (single page application)  
<sub>Thanks, SvelteKit ❤️!</sub>

Regardless of the configuration, insvex.http can (and should be) used in conjunction with your already existing webserver, like nginx.

When using nginx and insvex.http configured as SPA, there isn't even a need to run a node.js server, although thumbnail generation may suffer.  
In fact, with the right nginx-config (sample provided) insvex.http can **work without any dependencies**!  
Configure nginx, drop in SPA files and you're *done*!

![screenshot](screenie.png?raw=true)
## Features

- [x] modern, simple and ⚡-fast
- [x] responsive design
- [x] (optional) standalone server
- [x] SSR (server side rendering)
- [x] works with javascript disabled in SSR mode
- [x] SPA mode
- [x] optionally **without any dependencies**  
  configure nginx, drop files, done!
- [x] thumbnail generation
- [x] extensive file preview
  - [x] synatax highlightin when previewing code
- [ ] directory tree
- [ ] QR-code generation
- [ ] search
- [ ] http**s** in standalone mode  
  (recommended to use nginx for now)

## Installation

```
TODO
```

## Development

```bash
# pnpm as package manager is encouraged, to install:
corepack enable && corepack prepare pnpm@latest
# corepack comes bundled with node.js, so no need to install it


git clone git@github.com:Alia5/insvex.http.git
git submodule update --init --recursive
cd insvex.http
pnpm run setup
pnpm run dev
```

## License

```license
Copyright 2017-2023 Peter Repukat - FlatspotSoftware

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```