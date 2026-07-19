// src/polyfill.ts
declare var global: any;
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? 'DOMException';
    }
  } as any;
}