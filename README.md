# <img src="https://github.com/roblox-js/core/blob/main/img/banner.png?raw=true">

[![View on NPM](https://img.shields.io/badge/View%20On%20NPM-0F0F0F?style=for-the-badge)](https://npmjs.com/package/roflare) [![View on Yarn](https://img.shields.io/badge/View%20On%20Yarn-0F0F0F?style=for-the-badge)](https://yarnpkg.com/package/roflare) [![View on Github](https://img.shields.io/badge/View%20On%20Github-0F0F0F?style=for-the-badge)](https://github.com/roblox-js/core) [![Typescript](https://img.shields.io/badge/roflare.ml-0F0F0F?style=for-the-badge)](https://roflare.ml) [![Typescript](https://img.shields.io/badge/built%20with%20typescript-0F0F0F?style=for-the-badge)](https://typescript.com)

## Overview

Roflare allows you to interact with [Roblox's](https://roblox.com) web API in a variety of ways. A few examples are:
- `[✅]`Fetch information about an experience
- `[✅]` Fetch information about a user
- `[✅]` Manage account

Roflare provides secure access to authentication-required features without ever asking for your password. Our login process uses ROBLOX's quick login system, keeping your credentials safe while enabling full API functionality.

### Installation

```bash
#npm
npm i roflare

# yarn
yarn add roflare
```

### Example

To learn more about **Roflare**, visit the [documentation](https://docs.roflare.ml)

```js
const { GetUserAvatar } = require('roflare');

(async () => {
    console.log(await GetUserAvatar(1)) 
})()
```