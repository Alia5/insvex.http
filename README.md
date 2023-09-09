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

Before installation, you should decide if you want to run insvex.http with SSR or as SPA.

### SPA mode with nginx autoindex

**Pros:**
  - no dependencies
  - easy setup

**Cons:**
  - no thumbnail generation
  - requires clientside javascript
  - no pagination

#### Setup

1. configure nginx according to the [provided sample config](/sample-SPA_NGINX_AUTOINDEX.nginx.site.conf)
2. Drop the files of the `SPA-NginX-AUTOINDEX`-artifact into your webroot

### SSR

**Pros:**
  - thumbnail generation
  - no clientside javascript required
  - pagination (or endless scrolling)
  - fastest

**Cons:**
  - dependencies

#### Setup

1. configure nginx according to the [provided sample config](/sample-SSR.nginx.site.conf)
2. copy the files of the `SSR`-artifact into any directory, but **not** into your webroot
3. Install dependencies
    ```bash
    # ubuntu
    sudo apt install nodejs ffmpeg graphicsmagick libreoffice
    # arch
    sudo pacman -S nodejs ffmpeg graphicsmagick libreoffice
    ```
4. cd into the directory where you copied the `SSR`-files
5. edit `config.json` to your liking
6. Install node dependencies
    ```bash
    npm i
    ```
7. run the server
    ```bash
    npm run start
    ```
8. (optional) Configure a systemd service
   ```
    [Unit]
    Description=insvex.http systemd service
    Documentation=https://github.com/Alia5/insvex.http
    
    [Service]
    Type=simple
    WorkingDirectory=/path/to/ssr/server/files
    Environment="NODE_ENV=production"
    ExecStart=node index.js
    Restart=always
    
    [Install]
    WantedBy=multi-user.target                           
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
