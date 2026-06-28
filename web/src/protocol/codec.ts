import { MessageType } from './types';

export const PB = {
  encodeVarint(v: number): number[] {
    const b: number[] = [];
    let val = v >>> 0;
    while (val > 0x7f) {
      b.push((val & 0x7f) | 0x80);
      val >>>= 7;
    }
    b.push(val);
    return b;
  },

  tag(field: number, wire: number): number[] {
    return this.encodeVarint((field << 3) | wire);
  },

  uint32(field: number, v: number): number[] {
    return [...this.tag(field, 0), ...this.encodeVarint(v >>> 0)];
  },

  uint64(field: number, v: bigint): number[] {
    return [...this.tag(field, 0), ...this.encodeVarint(Number(v & BigInt(0xffffffff)))];
  },

  bool(field: number, v: boolean): number[] {
    return [...this.tag(field, 0), v ? 1 : 0];
  },

  string(field: number, s: string): number[] {
    const enc = new TextEncoder().encode(s);
    return [...this.tag(field, 2), ...this.encodeVarint(enc.length), ...enc];
  },

  parse(data: Uint8Array): Record<number, any> {
    const result: Record<number, any> = {};
    let off = 0;
    while (off < data.length) {
      let tag = 0, shift = 0, b: number;
      do {
        b = data[off++];
        tag |= (b & 0x7f) << shift;
        shift += 7;
      } while (b & 0x80);

      const field = tag >>> 3;
      const wire = tag & 7;

      if (wire === 0) {
        let val = 0, s = 0;
        do {
          b = data[off++];
          val |= (b & 0x7f) << s;
          s += 7;
        } while (b & 0x80);
        result[field] = val >>> 0;
      } else if (wire === 2) {
        let l = 0, s = 0;
        do {
          b = data[off++];
          l |= (b & 0x7f) << s;
          s += 7;
        } while (b & 0x80);
        const bytes = data.slice(off, off + l);
        try {
          result[field] = new TextDecoder().decode(bytes);
        } catch {
          result[field] = bytes;
        }
        off += l;
      } else if (wire === 5) {
        off += 4;
      } else if (wire === 1) {
        off += 8;
      }
    }
    return result;
  }
};

export function buildPacket(msgType: number, payload: number[]): Uint8Array {
  const pl = new Uint8Array(payload);
  const header = new ArrayBuffer(6);
  const dv = new DataView(header);
  dv.setUint16(0, msgType, false);
  dv.setUint32(2, pl.length, false);
  const result = new Uint8Array(6 + pl.length);
  result.set(new Uint8Array(header), 0);
  result.set(pl, 6);
  return result;
}

export function parsePacketHeader(data: Uint8Array): [number, number, Uint8Array] {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const type = dv.getUint16(0, false);
  const length = dv.getUint32(2, false);
  const payload = data.slice(6, 6 + length);
  return [type, length, payload];
}

export const Messages = {
  version(): Uint8Array {
    const v1 = (1 << 16) | (4 << 8) | 0;
    const v2 = (BigInt(1) << BigInt(48)) | (BigInt(4) << BigInt(32));
    const payload = new Uint8Array([
      ...PB.uint32(1, v1),
      ...PB.string(2, 'MumbleWeb'),
      ...PB.string(3, 'Web'),
      ...PB.string(4, 'HTML5'),
      ...PB.uint64(5, v2),
    ]);
    return buildPacket(MessageType.Version, [...payload]);
  },

  authenticate(username: string, password: string): Uint8Array {
    const payload = new Uint8Array([
      ...PB.string(1, username),
      ...PB.string(2, password),
      ...PB.bool(5, true),
    ]);
    return buildPacket(MessageType.Authenticate, [...payload]);
  },

  ping(): Uint8Array {
    const ts = BigInt(Date.now());
    return buildPacket(MessageType.Ping, [...PB.uint64(1, ts)]);
  },

  textMessage(message: string, channelId?: number): Uint8Array {
    const fields: number[] = [...PB.string(5, message)];
    if (channelId !== undefined) fields.push(...PB.uint32(3, channelId));
    return buildPacket(MessageType.TextMessage, fields);
  },

  userState(channelId?: number, selfMute?: boolean, selfDeaf?: boolean): Uint8Array {
    const fields: number[] = [];
    if (channelId !== undefined) fields.push(...PB.uint32(5, channelId));
    if (selfMute !== undefined) fields.push(...PB.bool(9, selfMute));
    if (selfDeaf !== undefined) fields.push(...PB.bool(10, selfDeaf));
    return buildPacket(MessageType.UserState, fields);
  },
};
