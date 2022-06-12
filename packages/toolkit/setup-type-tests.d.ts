// Not available on old TS versions but used by `@testing-library/user-event`
// @see https://stackoverflow.com/a/61505395
declare class ClipboardItem {
  constructor(data: { [mimeType: string]: Blob })
}
