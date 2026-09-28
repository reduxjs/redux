// Passthrough loader. Registers the given files as dependencies of each
// module so the bundler's persistent cache recompiles it when they change.
module.exports = function toolkitTypesDependency(source) {
  for (const file of this.getOptions().files) {
    this.addDependency(file)
  }
  return source
}
