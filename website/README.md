# Documentation site

The site publishes `docs/setup.md` and the Docusaurus landing page to
<https://sajor2000.github.io/ce-datascience/>.

```bash
cd website
bun install
bun run start
```

Run `bun run build` before submitting documentation changes. Merges to `main`
deploy automatically through `.github/workflows/deploy-docs.yml`.
