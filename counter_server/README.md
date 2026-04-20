Counter server
=================

Simple Node.js server that stores a persistent counter in `data/count.json` and
serves an SVG at `/counter.svg`. Each request to `/counter.svg` increments the
counter by 1 and returns an SVG showing the current count (padded to 4 digits).

Quick start (locally):

1. Install dependencies:

```
cd counter_server
npm install
```

2. Run:

```
npm start
```

By default the server listens on port `8080`. Open `http://localhost:8080/counter.svg`
to test.

Docker (build & run):

```
docker build -t counter-server ./counter_server
docker run -p 8080:8080 counter-server
```

Deploy: you can deploy this service to Render, Railway, Fly, a VPS, or any host
that supports Node.js or Docker. After deployment, set the image src in your
site to `https://<your-server>/counter.svg` so the global counter increments on
each page visit.
