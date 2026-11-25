#!/usr/bin/env python3
"""Setup script for the Tokaido Duo Automa PWA (pure Python 3, no packages needed).

  python3 setup.py            generate icons, check files, serve on http://localhost:8080
  python3 setup.py --no-serve only generate icons + check files
  python3 setup.py --port 9000

Install as an app: open the served address in Chrome/Edge/Safari (phone or desktop)
and choose "Install app" / "Add to Home Screen". After the first load it works offline.
(Service workers need http://localhost or https — not file://.)
"""
import argparse, http.server, os, socket, socketserver, struct, sys, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
REQUIRED = ["index.html", "style.css", "cards.js", "rules.js", "app.js", "sw.js", "manifest.webmanifest",
            "img/setup-board.jpg", "img/movement-map.jpg", "img/rank-track.jpg", "img/rank-visible.jpg",
            "img/end-of-game.jpg", "img/wave-placing.jpg"]


def png(path, size, pixel):
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(pixel(x, y))
    def chunk(t, d):
        c = struct.pack(">I", len(d)) + t + d
        return c + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)) \
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(data)


def make_icon(size, pad):
    """Deep-teal tile with a row of 'rank track' circles; one filled (the token)."""
    bg, ring, fill = (47, 72, 88), (246, 239, 226), (214, 51, 108)
    s = size / 512.0
    cs = [(256 + (i - 2) * 92 * 1.0, 256) for i in range(5)]
    r_out, r_in = 40 * s * (1 - pad), 31 * s * (1 - pad)
    cx0 = 256 * s
    def pixel(x, y):
        for i, (cx, cy) in enumerate(cs):
            px = cx0 + (cx - 256) * s * (1 - pad)
            d2 = (x - px) ** 2 + (y - cy * s) ** 2
            if d2 <= r_in ** 2:
                return fill if i == 1 else bg
            if d2 <= r_out ** 2:
                return ring
        return bg
    return pixel


def build_icons():
    os.makedirs(os.path.join(HERE, "icons"), exist_ok=True)
    for name, size, pad in (("icon-192.png", 192, 0.0), ("icon-512.png", 512, 0.0), ("icon-maskable-512.png", 512, 0.12)):
        p = os.path.join(HERE, "icons", name)
        if not os.path.exists(p):
            png(p, size, make_icon(size, pad))
            print("  created icons/" + name)


def lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]; s.close(); return ip
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-serve", action="store_true")
    ap.add_argument("--port", type=int, default=8080)
    a = ap.parse_args()
    print("Tokaido Duo Automa — setup")
    build_icons()
    bad = [f for f in REQUIRED if not os.path.exists(os.path.join(HERE, f))]
    if bad:
        print("Missing files:", *bad, sep="\n  "); sys.exit(1)
    print("  all files present ✔")
    if a.no_serve:
        return
    os.chdir(HERE)
    class H(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header("Cache-Control", "no-cache"); super().end_headers()
        def log_message(self, *x): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", a.port), H) as srv:
        print("\nServing at  http://localhost:%d" % a.port)
        ip = lan_ip()
        if ip:
            print("On your phone (same Wi-Fi) http://%s:%d  (installing as an app on a phone needs https — see README note below)" % (ip, a.port))
        print("Open it once online, then 'Install app' — it works offline afterwards. Ctrl+C to stop.")
        print("Tip: to use on a phone, host the folder on any static https host (GitHub Pages, Netlify, Cloudflare Pages).")
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print("\nbye")


if __name__ == "__main__":
    main()
