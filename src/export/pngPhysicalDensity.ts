const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const PNG_SIGNATURE_LENGTH = 8;
const INCHES_PER_METER = 39.3701;

/**
 * Browsers cannot write PNG DPI metadata via Canvas APIs — canvas.toBlob
 * only controls pixel dimensions. This patches a `pHYs` chunk (pixel
 * density, in pixels-per-meter) directly into the PNG byte stream, right
 * after IHDR as required by the PNG spec, with a recomputed CRC32.
 */
export async function setPngPhysicalDensity(blob: Blob, dpi: number): Promise<Blob> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  const firstChunkLength = view.getUint32(PNG_SIGNATURE_LENGTH, false);
  const firstChunkType = new TextDecoder().decode(
    buf.subarray(PNG_SIGNATURE_LENGTH + 4, PNG_SIGNATURE_LENGTH + 8),
  );
  if (firstChunkType !== "IHDR") {
    throw new Error(`Expected IHDR as the first PNG chunk, got "${firstChunkType}"`);
  }
  const insertAt = PNG_SIGNATURE_LENGTH + 4 + 4 + firstChunkLength + 4;

  const pixelsPerMeter = Math.round(dpi * INCHES_PER_METER);
  const chunkData = new Uint8Array(9);
  const chunkDataView = new DataView(chunkData.buffer);
  chunkDataView.setUint32(0, pixelsPerMeter, false);
  chunkDataView.setUint32(4, pixelsPerMeter, false);
  chunkData[8] = 1; // unit specifier: meters

  const typeBytes = new TextEncoder().encode("pHYs");
  const crcInput = new Uint8Array(typeBytes.length + chunkData.length);
  crcInput.set(typeBytes, 0);
  crcInput.set(chunkData, typeBytes.length);
  const crc = crc32(crcInput);

  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
  const chunkView = new DataView(chunk.buffer);
  chunkView.setUint32(0, chunkData.length, false);
  chunk.set(typeBytes, 4);
  chunk.set(chunkData, 8);
  chunkView.setUint32(8 + chunkData.length, crc, false);

  const result = new Uint8Array(buf.length + chunk.length);
  result.set(buf.subarray(0, insertAt), 0);
  result.set(chunk, insertAt);
  result.set(buf.subarray(insertAt), insertAt + chunk.length);

  return new Blob([result], { type: "image/png" });
}
