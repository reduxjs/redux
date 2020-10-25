if (process.env.NODE_ENV === 'production') {
  module.exports = require('./makeStore.prod')
} else {
  module.exports = require('./makeStore.dev')
}
