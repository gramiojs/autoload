# @gramio/autoload

Autoload commands plugin for GramIO.

## Usage

> [full example](https://github.com/gramiojs/autoload/tree/main/example)

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
