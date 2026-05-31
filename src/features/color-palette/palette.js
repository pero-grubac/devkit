export function hexToHsl(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return null;
  let [rv, gv, bv] = [parseInt(r[1],16)/255, parseInt(r[2],16)/255, parseInt(r[3],16)/255];
  const max = Math.max(rv,gv,bv), min = Math.min(rv,gv,bv);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case rv: h = ((gv-bv)/d + (gv<bv?6:0))/6; break;
      case gv: h = ((bv-rv)/d + 2)/6; break;
      case bv: h = ((rv-gv)/d + 4)/6; break;
    }
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1-l);
  const f = n => {
    const k = (n + h/30) % 12;
    return Math.round((l - a*Math.max(Math.min(k-3,9-k,1),-1)) * 255)
      .toString(16).padStart(2,"0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generatePalette(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const { h, s } = hsl;

  // Shades: 50→950 (Tailwind-style)
  const shadeSteps = [95, 88, 78, 66, 54, 44, 35, 26, 18, 11];
  const shades = shadeSteps.map((l, i) => ({
    name: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900][i],
    hex:  hslToHex(h, Math.min(s+5, 100), l),
    l,
  }));

  // Harmonies
  const complementary = [
    { name: "Base",          hex, hsl },
    { name: "Complementary",hex: hslToHex((h+180)%360, s, hsl.l), hsl: {h:(h+180)%360,s,l:hsl.l} },
  ];

  const triadic = [
    { name: "Base",      hex },
    { name: "Triadic 1", hex: hslToHex((h+120)%360, s, hsl.l) },
    { name: "Triadic 2", hex: hslToHex((h+240)%360, s, hsl.l) },
  ];

  const analogous = [-30,-15,0,15,30].map(offset => ({
    name: offset === 0 ? "Base" : `${offset>0?"+":""}${offset}°`,
    hex:  hslToHex((h+offset+360)%360, s, hsl.l),
  }));

  const tints  = Array.from({length:5},(_,i) => ({ name: `Tint ${i+1}`,  hex: hslToHex(h, s, Math.min(hsl.l+10*(i+1),95)) }));
  const muted  = [100,80,60,40,20].map((sat,i) => ({ name: `Muted ${i+1}`, hex: hslToHex(h, sat, hsl.l) }));

  return { shades, complementary, triadic, analogous, tints, muted, hsl };
}

export function toCssVars(shades, name = "color") {
  return shades.map(s => `  --${name}-${s.name}: ${s.hex};`).join("\n");
}

export function toTailwind(shades, name = "brand") {
  const inner = shades.map(s => `      ${s.name}: '${s.hex}',`).join("\n");
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${name}: {\n${inner}\n        },\n      },\n    },\n  },\n};`;
}
