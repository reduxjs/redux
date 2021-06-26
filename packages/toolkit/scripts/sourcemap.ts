import { fromObject, fromComment } from 'convert-source-map'
const SOURCEMAPPING_URL = 'sourceMappingURL'

const SOURCEMAP_REG = new RegExp(
  `^\\/\\/#\\s+${SOURCEMAPPING_URL}=.+\\n?`,
  'gm'
)
function appendInlineSourceMap(code: string, sourceMap: any) {
  if (sourceMap) {
    const mapping = fromObject(sourceMap)
    return `${code}\n${mapping.toComment()}`
  } else {
    return code
  }
}
function removeInlineSourceMap(code) {
  return code.replace(
    new RegExp(`^\\/\\/#\\s+${SOURCEMAPPING_URL}=.+\\n?`, 'gm'),
    ''
  )
}
function extractInlineSourcemap(code: string) {
  return fromComment(code.match(SOURCEMAP_REG)?.[0]).toObject()
}
function getLocation(
  source: string,
  search: string
): { line: number; column: number } {
  const outIndex = source.indexOf(search)
  if (outIndex < 0) {
    throw new Error(`Failed to find ${search} in output`)
  }
  const outLines = source.slice(0, outIndex).split('\n')
  const outLine = outLines.length
  const outColumn = outLines[outLines.length - 1].length
  return {
    line: outLine,
    column: outColumn,
  }
}

export {
  extractInlineSourcemap,
  removeInlineSourceMap,
  appendInlineSourceMap,
  getLocation,
}
