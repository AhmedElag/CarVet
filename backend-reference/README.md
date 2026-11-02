# Original server-side matching reference

These files preserve the trained matching engine, public sample catalog, model artifacts, API boundary and original verification fixtures from the server version of CarVet. They are not imported or served by the GitHub Pages demo.

The website in this package uses transparent sample filtering and price ordering in `demo/sample-match.ts`. GitHub Pages does not execute an API or model inference.

For a connected MVP, host the original engine behind an authenticated API, adapt `api-match/route.ts` imports to this directory, validate requests through `matching/http.js`, then replace the direct sample adapter in `components/ClientDemo.tsx` with your API request. Keep model files on that server. The files here are a backend integration reference; they are not a separately deployed service.

The original tests retain their original directory assumptions; run them in the original server project, or update their imports before using them here. The executable tests for this standalone demo are `npm test` at the package root.
