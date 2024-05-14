# @gramio/autoload

[![npm](https://img.shields.io/npm/v/@gramio/autoload?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/@gramio/autoload)
[![JSR](https://jsr.io/badges/@gramio/autoload)](https://jsr.io/@gramio/autoload)
[![JSR Score](https://jsr.io/badges/@gramio/autoload/score)](https://jsr.io/@gramio/autoload)

Autoload commands plugin for GramIO.

## Usage

> [full example](https://github.com/gramiojs/autoload/tree/main/example)

> [!IMPORTANT]
> Please read about [Lazy-load plugins](https://gramio.dev/plugins/official/autoload.html)

## Register the plugin

```ts
// index.ts
import { Bot } from "gramio";
import { autoload } from "@gramio/autoload";

const bot = new Bot(process.env.TOKEN as string)
    .extend(autoload())
    .onStart(console.log);

bot.start();

export type BotType = typeof bot;
```

## Create command

```ts
// commands/command.ts
import type { BotType } from "..";

export default (bot: BotType) =>
    bot.command("start", (context) => context.send("hello!"));
```

## Options

| Key       | Type                                                          | Default                    | Description                                                         |
| --------- | ------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| pattern?  | string                                                        | "\*\*\/\*.{ts,js,cjs,mjs}" | [Glob patterns](<https://en.wikipedia.org/wiki/Glob_(programming)>) |
| path?     | string                                                        | "./commands"               | the path to the folder                                              |
| onLoad?   | (params: { absolute: string; relative: string }) => unknown   |                            | the hook that is called when loading a file                         |
| onFinish? | (paths: { absolute: string; relative: string }[]) => unknown; |                            | the hook that is called after loading all files                     |

and other [glob package options](https://www.npmjs.com/package/glob#options)
