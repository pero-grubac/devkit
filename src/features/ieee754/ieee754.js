// IEEE 754 single (32-bit) and double (64-bit) analysis

export function analyzeFloat32(value) {
  const buf  = new ArrayBuffer(4);
  new Float32Array(buf)[0] = value;
  const bits = new Uint32Array(buf)[0];

  const sign     = (bits >>> 31) & 1;
  const expRaw   = (bits >>> 23) & 0xFF;
  const mantissa = bits & 0x7FFFFF;

  const expBias  = 127;
  const expActual = expRaw === 0 ? 1 - expBias : expRaw - expBias;
  const isSpecial = expRaw === 0xFF;
  const isDenorm  = expRaw === 0;

  const signBit  = sign.toString(2);
  const expBits  = expRaw.toString(2).padStart(8, "0");
  const mantBits = mantissa.toString(2).padStart(23, "0");
  const allBits  = signBit + expBits + mantBits;

  const hexStr = bits.toString(16).toUpperCase().padStart(8, "0");

  let category = "Normal";
  if (isSpecial && mantissa === 0) category = sign ? "-Infinity" : "+Infinity";
  else if (isSpecial) category = "NaN";
  else if (isDenorm && mantissa === 0) category = sign ? "-Zero" : "+Zero";
  else if (isDenorm) category = "Subnormal";

  return { bits: allBits, signBit, expBits, mantBits, sign, expRaw, expActual, mantissa, hexStr, category, precision: 32 };
}

export function analyzeFloat64(value) {
  const buf  = new ArrayBuffer(8);
  new Float64Array(buf)[0] = value;
  const view = new DataView(buf);
  const hi   = view.getUint32(4, false);
  const lo   = view.getUint32(0, false);

  const sign     = (hi >>> 31) & 1;
  const expRaw   = ((hi >>> 20) & 0x7FF);
  const mantHi   = hi & 0xFFFFF;
  const mantLo   = lo;

  const expBias   = 1023;
  const expActual = expRaw === 0 ? 1 - expBias : expRaw - expBias;
  const isSpecial = expRaw === 0x7FF;
  const isDenorm  = expRaw === 0;

  const signBit  = sign.toString(2);
  const expBits  = expRaw.toString(2).padStart(11, "0");
  const mantBits = mantHi.toString(2).padStart(20, "0") + mantLo.toString(2).padStart(32, "0");
  const allBits  = signBit + expBits + mantBits;

  const hexStr = hi.toString(16).toUpperCase().padStart(8, "0") + lo.toString(16).toUpperCase().padStart(8, "0");

  let category = "Normal";
  if (isSpecial && mantHi === 0 && mantLo === 0) category = sign ? "-Infinity" : "+Infinity";
  else if (isSpecial) category = "NaN";
  else if (isDenorm && mantHi === 0 && mantLo === 0) category = sign ? "-Zero" : "+Zero";
  else if (isDenorm) category = "Subnormal";

  return { bits: allBits, signBit, expBits, mantBits, sign, expRaw, expActual, hexStr, category, precision: 64 };
}

export function floatFromBits32(bitStr) {
  const n   = parseInt(bitStr.replace(/\s/g, ""), 2);
  const buf = new ArrayBuffer(4);
  new Uint32Array(buf)[0] = n;
  return new Float32Array(buf)[0];
}

export const INTERESTING = [
  { label: "0",           value: 0        },
  { label: "-0",          value: -0       },
  { label: "1",           value: 1        },
  { label: "-1",          value: -1       },
  { label: "0.1",         value: 0.1      },
  { label: "0.1 + 0.2",   value: 0.1+0.2  },
  { label: "π",           value: Math.PI  },
  { label: "MAX_SAFE_INT",value: Number.MAX_SAFE_INTEGER },
  { label: "Infinity",    value: Infinity },
  { label: "NaN",         value: NaN      },
];
