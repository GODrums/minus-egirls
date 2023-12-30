<p align="center"><img width="128" height="128" src="./src/public/icon/128.png"></p>
<h1 align="center">Minus Egirls</h1>

Inspired by [egirl-blocker](https://github.com/theerfan/egirl-blocker).
This template should help get you started developing with Svelte in WXT.

## Tech Stack

- [Web Extension Framework (WXT)](https://wxt.dev/) powered by [Vite](https://vitejs.dev/)
- Manifest Version 3 (MV3) in [TypeScript](https://www.typescriptlang.org/)
- [Svelte](https://svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/) with [DaisyUI](https://daisyui.com/)
- [PNPM](https://pnpm.io/)

## Build Instructions

#### 1. Install dependencies

```bash
  pnpm install
  # prepare wxt
  pnpm postinstall
```

#### 2. Run the extension

- Run a development command

```bash
  # For chrome
  pnpm dev
  # For firefox
  pnpm dev:firefox
```


#### 4. Build the extension

- Run the build command

```bash
  # Build for chrome
  pnpm build
  # Build for firefox
  pnpm build:firefox
```

- This will create a new build the `.output` folder of the root directory
- The `.output` folder can contain multiple builds for different browsers (e.g. `.output/chrome-mv3`)

### 5. Miscellaneous

- Svelte checks:

```bash
  pnpm check
```

## License

This software and associated documentation files (the "Software") has been written by [Rums](https://github.com/GODrums) for [Waxpeer](https://waxpeer.com/). All rights reserved.

No part of the Software may be copied, modified, distributed, or sold in any form or by any means without prior written permission from the any of the copyright holders.

Unauthorized use, modification, or distribution of this Software is strictly prohibited.
