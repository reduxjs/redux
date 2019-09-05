import { checkDirectory } from 'typings-tester'

describe('TypeScript definitions', function() {
  it('should compile against redux.d.ts', () => {
    checkDirectory(__dirname + '/typescript')
  })
})
