import * as tt from 'typescript-definition-tester'

describe('TypeScript definitions', function() {
  it('should compile against index.d.ts', done => {
    tt.compileDirectory(
      __dirname + '/typescript',
      fileName => fileName.match(/\.ts$/),
      {
        strictNullChecks: true
      },
      () => done()
    )
  })
})
