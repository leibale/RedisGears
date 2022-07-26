import { Command } from 'commander';
import { createClient } from '@redis/client';
import { resolve } from 'path';
import * as rollup from 'rollup';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

await new Command()
  .argument('<filename>')
  .option('-r, --redis')
  .option('-w, --watch')
  .action(async (filename, { redis, watch }) => {
    const client = createClient({ url: redis });
    client.on('error', err => console.error('Redis client error', err));
    await client.connect();

    return (watch ? watchAndDeploy : buildAndDeploy)(client, {
      input: {
        file: resolve(process.cwd(), filename)
      },
      plugins: [
        preserveShebangs(),
        nodeResolve(),
        commonjs(),
        json()
      ]
    });
  })
  .parseAsync();

async function buildAndDeploy(client, rollupOptions) {
  try {
    await deploy(client, await rollup.rollup(rollupOptions));
  } finally {
    await client.quit();
  }
}

async function watchAndDeploy(client, rollupOptions) {
  (await rollup.watch({
    ...rollupOptions,
    watch: {
      skipWrite: true
    }
  })).on('event', async ({ code, error, result }) => {
    switch (code) {
      case 'ERROR':
        console.error('Rollup bundle error', error);
        break;

      case 'BUNDLE_END':
        await deploy(client, result);
        break;
    }
  });
}

async function deploy(client, result) {

  try {
    const { output: [{ code }] } = await result.generate({
      format: 'es'
    });

    await client.sendCommand(['RG.FUNCTION', 'LOAD', 'UPGRADE', code]);
    console.log('Deployed! :)');
  } catch (err) {
    console.error('Deploy error', err);
  }
}
