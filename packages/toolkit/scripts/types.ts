export interface BuildOptions {
  format: 'cjs' | 'umd' | 'esm'
  name:
    | 'cjs.development'
    | 'cjs.production.min'
    | 'esm'
    | 'modern'
    | 'modern.development'
    | 'modern.production.min'
    | 'umd'
    | 'umd.min'
  minify: boolean
  env: 'development' | 'production' | ''
  target?: 'es2017'
}

export interface EntryPointOptions {
  prefix: string
  folder: string
  entryPoint: string
  extractionConfig: string
  // globalName is used in the conversion to umd files to separate rtk from rtk-query on a global namespace
  globalName: string
}
