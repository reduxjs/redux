export class TaskAbortError implements Error {
  name = 'TaskAbortError'
  message = ''
  constructor(public reason = 'unknown') {
    this.message = `task cancelled (reason: ${reason})`
  }
}
