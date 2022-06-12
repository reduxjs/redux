// Patches types not available on old TS versions but is used by `@testing-library/user-event`.
// @see https://stackoverflow.com/a/61505395
declare module 'lib.dom.ts' {
  type ClipboardItemData = Promise<ClipboardItemDataType>;
  type ClipboardItemDataType = string | Blob;
  type PresentationStyle = "attachment" | "inline" | "unspecified";

  interface ClipboardItemOptions {
    presentationStyle?: PresentationStyle;
  }

  interface ClipboardItem {
    readonly types: ReadonlyArray<string>
    getType(type: string): Promise<Blob>
  }

  var ClipboardItem: {
    prototype: ClipboardItem
    new (
      items: Record<string, ClipboardItemData>,
      options?: ClipboardItemOptions
    ): ClipboardItem
  }
}
