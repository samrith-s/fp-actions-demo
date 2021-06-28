import { Options } from 'tsup';

const isProd = process.env.NODE_ENV === 'production';

export const tsup: Options = {
  entryPoints: ['src/index.ts'],
  clean: true,
  splitting: true,
  minify: isProd,
  sourcemap: !isProd,
  watch: isProd ? false : ['src'],
  dts: true,
};
