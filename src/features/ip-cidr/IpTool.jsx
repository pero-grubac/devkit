import { useState, useEffect } from "react";
import { T } from "../../shared/theme";
import { Input, Card, Label, Btn, CopyBtn } from "../../shared/ui";

function ipToLong(ip) {
  return ip.split(".").reduce((acc, o) => (acc << 8) + parseInt(o), 0) >>> 0;
}

function longToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function isPrivate(ip) {
  const n = ipToLong(ip);
  return (
    (n >= ipToLong("10.0.0.0")     && n <= ipToLong("10.255.255.255"))  ||
    (n >= ipToLong("172.16.0.0")   && n <= ipToLong("172.31.255.255"))  ||
    (n >= ipToLong("192.168.0.0")  && n <= ipToLong("192.168.255.255")) ||
    (n >= ipToLong("127.0.0.0")    && n <= ipToLong("127.255.255.255")) ||
    (n >= ipToLong("169.254.0.0")  && n <= ipToLong("169.254.255.255")) ||
    (n >= ipToLong("100.64.0.0")   && n <= ipToLong("100.127.255.255"))
  );
}

function classOf(ip) {
  const first = parseInt(ip.split(".")[0]);
  if (first < 128)  return "A";
  if (first < 192)  return "B";
  if (first < 224)  return "C";
  if (first < 240)  return "D (Multicast)";
  return "E (Reserved)";
}

function parseCIDR(cidr) {
  const [ip, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr);
  if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  const parts = ip.split(".");
  if (parts.length !== 4 || parts.some(p => isNaN(parseInt(p)) || parseInt(p) < 0 || parseInt(p) > 255)) return null;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const ipLong = ipToLong(ip);
  const network = (ipLong & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const hosts = prefix >= 31 ? Math.pow(2, 32 - prefix) : Math.pow(2, 32 - prefix) - 2;
  const firstHost = prefix >= 31 ? network : network + 1;
  const lastHost  = prefix >= 31 ? broadcast : broadcast - 1;

  return {
    ip, prefix,
    mask:      longToIp(mask),
    network:   longToIp(network),
    broadcast: longToIp(broadcast),
    firstHost: longToIp(firstHost),
    lastHost:  longToIp(lastHost),
    hosts:     hosts > 0 ? hosts.toLocaleString() : "0",
    ipLong,
    binary:    ipLong.toString(2).padStart(32, "0").match(/.{8}/g).join("."),
    private:   isPrivate(ip),
    classOf:   classOf(ip),
  };
}

function isValidIPv4(ip) {
  const parts = ip.split(".");
  return parts.length === 4 && parts.every(p => !isNaN(p) && parseInt(p) >= 0 && parseInt(p) <= 255);
}

function isValidIPv6(ip) {
  return /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip) ||
         /^::1$/.test(ip) || /^::$/.test(ip) ||
         /^([0-9a-fA-F]{0,4}:){1,7}:$/.test(ip) ||
         /^:(:[0-9a-fA-F]{0,4}){1,7}$/.test(ip);
}

export function IpTool() {
  const [input, setInput] = useState("192.168.1.100/24");

  const isCIDR = input.includes("/");
  const ipOnly = isCIDR ? input.split("/")[0] : input;

  const v4valid = isValidIPv4(ipOnly);
  const v6valid = !isCIDR && isValidIPv6(input);
  const cidr    = isCIDR && v4valid ? parseCIDR(input) : null;
  const error   = input.trim() && !v4valid && !v6valid ? "Invalid IP address or CIDR notation" : null;

  const InfoRow = ({ label, value, mono = true, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: T.dim, textTransform: "uppercase", paddingTop: 2 }}>{label}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ fontFamily: mono ? "var(--mono)" : "var(--sans)", fontSize: 12, color: color || T.mid, textAlign: "right" }}>{value}</div>
        {value && <CopyBtn text={String(value)} />}
      </div>
    </div>
  );

  const EXAMPLES = ["8.8.8.8", "192.168.1.1/24", "10.0.0.0/8", "172.16.5.10/12", "2001:0db8::1"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>IP Address or CIDR</Label>
        <Input value={input} onChange={setInput} placeholder="192.168.1.0/24 or 8.8.8.8" />
      </div>

      {error && (
        <div style={{ background: T.red + "12", border: `1px solid ${T.red}44`, borderRadius: 6, padding: "10px 14px", color: "#fca5a5", fontSize: 12 }}>{error}</div>
      )}

      {v6valid && (
        <Card>
          <Label>IPv6 Address</Label>
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: T.acc }}>{input}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: T.dim, marginTop: 6 }}>IPv6 CIDR calculation is not supported in this tool.</div>
        </Card>
      )}

      {v4valid && !isCIDR && (
        <Card>
          <InfoRow label="Address"  value={ipOnly}                       color={T.text} />
          <InfoRow label="Type"     value={isPrivate(ipOnly) ? "Private" : "Public"} color={isPrivate(ipOnly) ? T.orange : T.green} />
          <InfoRow label="Class"    value={classOf(ipOnly)}              color={T.acc} />
          <InfoRow label="Decimal"  value={ipToLong(ipOnly).toString()}  />
          <InfoRow label="Hex"      value={ipToLong(ipOnly).toString(16).toUpperCase().padStart(8,"0")} />
          <InfoRow label="Binary"   value={ipToLong(ipOnly).toString(2).padStart(32,"0").match(/.{8}/g).join(".")} />
        </Card>
      )}

      {cidr && (
        <Card>
          <InfoRow label="IP Address"      value={cidr.ip}         color={T.text} />
          <InfoRow label="CIDR Prefix"     value={"/" + cidr.prefix} color={T.acc} />
          <InfoRow label="Subnet Mask"     value={cidr.mask}       />
          <InfoRow label="Network Address" value={cidr.network}    color={T.acc} />
          <InfoRow label="Broadcast"       value={cidr.broadcast}  color={T.orange} />
          <InfoRow label="First Host"      value={cidr.firstHost}  color={T.green} />
          <InfoRow label="Last Host"       value={cidr.lastHost}   color={T.green} />
          <InfoRow label="Usable Hosts"    value={cidr.hosts}      color={T.green} />
          <InfoRow label="Type"            value={cidr.private ? "Private" : "Public"} color={cidr.private ? T.orange : T.green} />
          <InfoRow label="Class"           value={cidr.classOf}    color={T.acc} />
          <InfoRow label="Binary"          value={cidr.binary}     />
        </Card>
      )}

      <div>
        <Label>Examples</Label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {EXAMPLES.map(e => (
            <Btn key={e} small variant={input === e ? "accent" : "default"} onClick={() => setInput(e)}>{e}</Btn>
          ))}
        </div>
      </div>
    </div>
  );
}
