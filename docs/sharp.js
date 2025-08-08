// Browser stub for sharp module
export default function sharp(input) {
  return {
    resize: () => ({}),
    toBuffer: () => Promise.resolve(new Uint8Array()),
    png: () => ({}),
    jpeg: () => ({}),
    webp: () => ({})
  };
}
