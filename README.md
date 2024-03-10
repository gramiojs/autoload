# @gramio/autoload

Autoload commands plugin for GramIO.

## Usage

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

| Key      | Type   | Default                    | Description                                                         |
| -------- | ------ | -------------------------- | ------------------------------------------------------------------- |
| pattern? | string | "\*\*\/\*.{ts,js,cjs,mjs}" | [Glob patterns](<https://en.wikipedia.org/wiki/Glob_(programming)>) |
| path?    | string | "./commands"               | the path to the folder                                              |

and other [glob package options](https://www.npmjs.com/package/glob#options)
