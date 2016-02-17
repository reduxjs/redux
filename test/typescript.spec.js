import * as tt from 'typescript-definition-tester'


describe('TypeScript definitions', () => {
  it('should compile against index.d.ts', (done) => {
    tt.compileDirectory(
      __dirname + '/typescript',
      fileName => fileName.match(/\.ts$/),
      () => done()
    )
  })
})
