# Create a Development Environemt

When the project is small it is accaptable to have a single file that contains the entire code base. But as the project grows and become complex it is less comftable to mantain it as a single file project. Lucky for us JS already face such problem and has the relevant tool to maintain a multi file project and compress it on build time to a single file that contains all the code. In this taturial we will explain how to create a multi file project and how to wrap it as a single file and send it to RedisGears. The taturial assume you have Redis with RedisGears 2.0 installed on `localhost:6379`. See [getting started](../README.md) section for installation instructions.

## Pre-requisite

* npm

## Creating the Project

Lets first create a directory to store our project and initialize our project with npm:

```bash
mkdir project
cd project
```

Now lets create the `src` directory that will contain our code. Inside it lets create a single file, `index.js`, that will be used as our main file:

```bash
mkdir src
cd src
touch index.js
```

Now lets add some code to `index.js`, open `index.js` file and past the following code:

```js
redis.register_function('foo', () => 'bar');
```

This file can be deployed to the server using `@redis/gears-functions-loader`. From the project root directory, run the following:

```bash
npx @redis/gears-functions-deployer ./src/index.js
```

Test the library functionality by running the following:

```bash
> redis-cli RG.FUNCTION CALL library foo
"bar"
```

## Adding Files to our Project

Lets add another file under the `src` direcotry called `test.js` that contains the following code:

```js
export const test = 'test';
```

Lets modify `index.js` to import the `test` variable from `test.js`:

```js
import { test } from './test.js';

redis.register_function('foo', () => test);
```

If we will bundle and deploy our code again:

```bash
npx @redis/gears-functions-deployer ./src/index.js
```

And we can test our function:

```bash
> redis-cli RG.FUNCTION CALL library foo
"test"
```

## Using an External Library

Now lets use some exteral library, for example `mathjs`. To install the library run the following npm command on the project root directory:

```bash
npm install mathjs
```

Lets change our program to use `pi` variable imported from `mathjs` library:

```js
import { pi } from 'mathjs';

redis.register_function('foo', () => pi);
```

Again lets bundle and deploy our project:

```bash
npx @redis/gears-functions-deployer ./src/index.js
```

And run it:

```bash
> redis-cli RG.FUNCTION CALL library foo
"3.1415926535897931"
```

Notice that RedisGears **only supports pure JS libraries**, a library that has a native code or use some native JS API provided by the browser or by nodejs **will not work**.

## Easy Build and Deploy

We can use npm scripts section to achieve an easy build and deploy commands, change the scripts section on `package.json` to the following:

```json
"scripts": {
  "deploy": "@redis/gears-deployer ./src/index.js"
}
```

Now we can run `npm run deploy` to bundle and deploy our library to a local Redis server.

```bash
npm run deploy
```

## `@redis/gears-deployer` options

* `-w`/`--watch` - Watch mode
* `-r`/`--redis` - Redis connection string (i.e. `redis://username:password@host:port`)

You are welcome to come up with a new and nice ideas of impoving the development environment and share it with us.
