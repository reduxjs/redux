module.exports = {
  plain: {
    color: '#f8f8f2',
    backgroundColor: '#272822'
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#c6cad2'
      }
    },
    {
      types: ['punctuation'],
      style: {
        color: '#F8F8F2'
      }
    },
    {
      types: ['property', 'tag', 'constant', 'symbol', 'deleted'],
      style: {
        color: '#F92672'
      }
    },
    {
      types: ['boolean', 'number'],
      style: {
        color: '#AE81FF'
      }
    },
    {
      types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
      style: {
        color: '#a6e22e'
      }
    },
    {
      types: ['operator', 'entity', 'url', 'variable'],
      style: {
        color: '#F8F8F2'
      }
    },
    {
      types: ['atrule', 'attr-value', 'function'],
      style: {
        color: '#E6D874'
      }
    },
    {
      types: ['keyword'],
      style: {
        color: '#F92672'
      }
    },
    {
      types: ['regex', 'important'],
      style: {
        color: '#FD971F'
      }
    }
  ]
}
