const pad = (n, len = 2) => String(n).padStart(len, "0");

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS   = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function tzParts(date) {
  const offMin = -date.getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const abs  = Math.abs(offMin);
  return { sign, hh: pad(Math.floor(abs / 60)), mm: pad(abs % 60) };
}

export function dayOfYear(date) {
  return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
}

export function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon = 0
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return { week, year: d.getUTCFullYear() };
}

export function quarter(date) {
  return Math.floor(date.getMonth() / 3) + 1;
}

const TOKEN_RE = /YYYY|YY|MMMM|MMM|MM|M|DDDD|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|SSS|A|a|ZZ|Z/g;

// Lightweight moment.js-style token formatter — no dependency, covers the common tokens.
export function formatDate(date, pattern) {
  if (!date || isNaN(date)) return "";
  const Y = date.getFullYear();
  const mo = date.getMonth();
  const d = date.getDate();
  const day = date.getDay();
  const H = date.getHours();
  const mi = date.getMinutes();
  const s = date.getSeconds();
  const ms = date.getMilliseconds();
  const h12 = H % 12 === 0 ? 12 : H % 12;
  const { sign, hh: tzh, mm: tzm } = tzParts(date);

  const map = {
    YYYY: String(Y),
    YY: pad(Y % 100),
    MMMM: MONTHS[mo],
    MMM: MONTHS[mo].slice(0, 3),
    MM: pad(mo + 1),
    M: String(mo + 1),
    DDDD: pad(dayOfYear(date), 3),
    DD: pad(d),
    D: String(d),
    dddd: WEEKDAYS[day],
    ddd: WEEKDAYS[day].slice(0, 3),
    HH: pad(H),
    H: String(H),
    hh: pad(h12),
    h: String(h12),
    mm: pad(mi),
    m: String(mi),
    ss: pad(s),
    s: String(s),
    SSS: pad(ms, 3),
    A: H < 12 ? "AM" : "PM",
    a: H < 12 ? "am" : "pm",
    ZZ: `${sign}${tzh}${tzm}`,
    Z: `${sign}${tzh}:${tzm}`,
  };
  return pattern.replace(TOKEN_RE, m => map[m] ?? m);
}

export const FORMAT_TOKENS = [
  ["YYYY", "4-digit year"],
  ["YY", "2-digit year"],
  ["MMMM", "full month name"],
  ["MMM", "short month name"],
  ["MM", "2-digit month"],
  ["M", "month"],
  ["DD", "2-digit day"],
  ["D", "day"],
  ["dddd", "full weekday"],
  ["ddd", "short weekday"],
  ["HH", "hour, 24h (2-digit)"],
  ["H", "hour, 24h"],
  ["hh", "hour, 12h (2-digit)"],
  ["h", "hour, 12h"],
  ["mm", "minutes (2-digit)"],
  ["ss", "seconds (2-digit)"],
  ["SSS", "milliseconds"],
  ["A / a", "AM/PM"],
  ["Z / ZZ", "UTC offset"],
];

export const COMMON_ZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Belgrade",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function zoneSnapshot(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const get = t => parts.find(p => p.type === t)?.value ?? "";
    return {
      zone: timeZone,
      display: `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`,
      offset: get("timeZoneName").replace("GMT", "UTC"),
    };
  } catch {
    return { zone: timeZone, display: "—", offset: "" };
  }
}
