# Tokaido Duo – Automa (offline PWA)

    ./setup.sh            # or: python3 setup.py   (generates icons, checks files, serves http://localhost:8080)
    ./setup.sh --no-serve # only prepare

Open the address once, then "Install app" / "Add to Home Screen" — it works offline afterwards.
For phones, host this folder on any static https host (GitHub Pages, Netlify, Cloudflare Pages).

- All 18 Character cards (Pilgrim / Merchant / Artist, Levels 1-6) are built in, shown as the real card images.
- Each Character can use its own level (setup, and changeable mid-game).
- Game progress is saved in cookies (mirrored to localStorage) and survives refresh. "New game" clears it.
