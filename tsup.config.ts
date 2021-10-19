import { Options } from 'tsup';
import { join } from 'path';

const isProd = process.env.NODE_ENV === 'production';

export const tsup: Options = {
  clean: true,
  splitting: true,
  minify: isProd,
  sourcemap: !isProd,
  watch: isProd ? false : ['src'],
  dts: true,
  entryPoints: ['src/index.ts'],
};
