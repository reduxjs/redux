import formatProdErrorMessage from '../../src/utils/formatProdErrorMessage'

describe('formatProdErrorMessage', () => {
  it('returns message with expected code references', () => {
    const code = 16

    const errorMessage = formatProdErrorMessage(code)

    expect(errorMessage).toContain(`#${code}`)
    expect(errorMessage).toContain(`code=${code}`)
  })
})
