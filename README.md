# electron-my-tools

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Problem

**SyntaxError: The requested module '/node_modules/.vite/deps/swiper.js?v=74bd4e06' does not provide an export named 'Pagination'**

TODO

**TypeError: Failed to set the 'currentTime' property on 'HTMLMediaElement': The provided double value is non-finite.**

传入的值类型不对

## TS Error

**xxx.value is possibly null**

```json
"compilerOptions": {
  "strictNullChecks": false // 限制对空值的检查
}
```

**类型“HTMLElement”上不存在属性“value”**

需要将document.getElementById返回的HTMLElement转换为HTMLInputElement

**error TS2304: Cannot find name 'myHandle'.**

类型“Window & typeof globalThis”上不存在属性“myHandle”

- 在 preload/index.d.ts 里面

```js
interface Window {
  myHandle: any // 加
}
```
- 断言

```js
(window as any).myHandle
```

**error TS2339: Property 'proxy' does not exist on type 'ComponentInternalInstance | null'.**


**error TS2339: Property '$eventBus' does not exist on type 'ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}, {}, string, {}, {}, {}, string, ComponentProvideOptions>, ... 4 more ..., any>'.**

全局挂载事件总线，ts报错

src下 .d.ts 文件（没有就新增）

```js
import { ComponentCustomProperties } from '@/vue'
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $eventBus: any
  }
}
```
**error TS2339: Property '$route' does not exist on type 'CreateComponentPublicInstanceWithMixins<ToResolvedProps<{}, {}>, { menuList: typeof menuList; fullScreen: typeof fullScreen; minScreen: typeof minScreen; closeScreen: typeof closeScreen; clickMenuItem: typeof clickMenuItem; isCollapse: typeof isCollapse; showPageHeader: typeof showPageHeader; breadcrumb: typeof brea...'.**

同上
