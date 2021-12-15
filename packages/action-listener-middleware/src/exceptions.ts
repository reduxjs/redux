export class TaskAbortError implements Error {
  name: string
  message: string
  constructor(public reason?: string) {
    this.name = 'TaskAbortError'
    this.message = `task cancelled` + (reason != null ? `: "${reason}"` : '')
  }
}
