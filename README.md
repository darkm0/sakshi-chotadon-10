# AshaSetu — Learning Management System of NGO

Created by Sakshi Nitin Bhoir, Roll No. 10.

## Project structure
- `index.html`: GitHub Pages frontend.
- `frontend/index.html`: frontend copy served by the Node backend.
- `backend/`: Node.js, Express and SQLite API.
- `robots.txt` and `sitemap.xml`: Search engine discovery files.

## Local development
1. Open a terminal in `backend/`.
2. Run `npm install`.
3. For local seed defaults only, run `npm run seed`.
4. Run `npm start`, then open `http://localhost:3010`.

Local-only administrator defaults are used only outside production. Never use those defaults in a public production service.

## Production note
The hosted service must set `NODE_ENV=production`, `DB_FILE=/data/learnbridge.db`, a unique `JWT_SECRET`, `ADMIN_ID`, and a strong `ADMIN_PASSWORD` using the host's environment-variable dashboard. Mount a persistent volume at `/data`; otherwise SQLite records may be lost on redeploy/restart. Do not commit `.env` files or database files.
