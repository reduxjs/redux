declare module 'merge-source-map' {
  import { RawSourceMap } from 'source-map'
  export default function merge(
    map1: string | RawSourceMap,
    map2: string | RawSourceMap
  ): RawSourceMap
}
