import { checkDirectory } from 'typings-tester'

describe('TypeScript definitions', () => {
  it('should compile against index.d.ts', () => {
    checkDirectory(__dirname + '/typescript')
  })
})
