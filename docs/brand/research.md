# How top plugin and skill libraries present themselves

Research for the Methodsmith brand and README. Accessed 2026-10-16. Star counts
come from `gh api repos/<owner>/<repo>` on that date.

## What we looked at

| Library | Stars | Hero | Install | Demo | Trust signals |
|---|---|---|---|---|---|
| [obra/superpowers](https://github.com/obra/superpowers) | 300k | Plain H1 and one-sentence definition. No logo, no badges | One section per host (16 hosts) behind a table of contents | None. Prose "How it works" story instead | Narrative of the workflow; "Philosophy" section; 1.0M installs in the [Claude directory](https://claude.com/marketplace/plugins/superpowers) |
| [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | 25.6k | Centred 120px logo, H1, bold one-line promise, three badges (CI, licence, skill count) | Claude Code first as a two-line code block; other hosts in a sentence, details lower down | `assets/demo/compound-loop.gif`, a replay of two real sessions with a caption explaining what was anonymised | "The loop" table of six commands; Philosophy; Limitations; FAQ; named maintainers |
| [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | 51.1k | H1 plus 14 badges (licence, arXiv, version, skill count, CI, socials) | Three numbered options (npx, `gh skill`, Agent Plugins) | YouTube tutorials | arXiv paper, citation block, security scan workflow, "validated skills" language. Emoji headings and a long badge wall read as marketing |
| [anthropics/skills](https://github.com/anthropics/skills) | 181.5k | H1, skills.sh badge, short definition | Per surface: Claude Code, Claude.ai, API | None | Disclaimer section; "Creating a basic skill" template |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 39.9k | Plain H1 | `/plugin install {name}@claude-plugins-official` | None | "Plugin names are immutable" rule; structure diagram in text |
| [Aperivue/medsci-skills](https://github.com/Aperivue/medsci-skills) | 341 | Centred H1, seven badges (licence, release, CI, skills, npm, DOI, arXiv), named physician author with affiliation | No-terminal installer first, then `npx`, then a list of other routes | Demos section | "Patient data and safety" section, citation, "not an autonomous author" statement |
| [openai/plugins](https://github.com/openai/plugins) (Figma, Notion, Superpowers listings) | 7.5k | n/a (catalogue) | Codex marketplace | n/a | Each plugin ships `interface.logo`, `composerIcon` and `brandColor` |

## Patterns worth copying

1. **One logo, one line, three or four badges.** Every's hero (logo, name, one bold
   promise, CI/licence/count badges) is the cleanest. K-Dense's 14-badge wall is
   the counter-example: it reads as a sales page.
2. **Claude Code install as a two-line code block above the fold**, other hosts
   one click away. Superpowers and Every both do this; Every keeps it to a
   single block before any prose.
3. **The loop is the product.** Every presents a six-row command table and a
   return arrow ("That return arrow is the whole point"). Superpowers tells the
   loop as a story. Both make the method legible before the inventory.
4. **A demo that is honest about what it is.** Every's GIF caption says it is a
   replay, names what was anonymised, and links the source. That caption is a
   trust device in its own right.
5. **Safety and limits as their own section.** MedSci's "Patient data and safety"
   and Every's "Limitations" both say what the tool is not. Our audience
   research says this matters more to statisticians than speed claims.
6. **A named, accountable maintainer.** MedSci names a physician with ORCID and
   affiliation; Every names two maintainers. Biostatisticians trust people, not
   brands.
7. **Citation.** K-Dense and MedSci both give a citation block and DOI. Researchers
   cite the tool version they used.

## Patterns to avoid

- Emoji section headings and "Accelerate your research" copy (K-Dense).
- Autonomy as a selling point (Every's `/lfg` "hands-off" framing works for
  software teams; our audience research flags "autonomous" as a risk word; see
  the ASA 2024 statement cited in the audience research).
- A table of contents longer than the hero (Superpowers lists 16 hosts first).

## Directory listing requirements

- **Claude directory.** The listing is built from `plugin.json` and the plugin
  folder's README ([submit](https://claude.com/docs/plugins/submit)). The
  manifest's `icon` field (a path inside the plugin) plus `documentationUrl`
  and `supportUrl` feed the listing; Claude Code ignores them at load time
  ([plugins reference](https://code.claude.com/docs/en/plugins-reference#directory-listing-fields)).
  Only PNG, JPEG, GIF, WebP and SVG images are accepted inside the plugin
  folder; an `.ico` file is held for a reviewer, and README images must use
  Markdown image syntax ([pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist)).
  No screenshot field exists.
- **OpenAI plugin directory and Codex.** `.codex-plugin/plugin.json` `interface`
  takes `logo`, `composerIcon` (both required for distribution), optional
  `logoDark`, `composerIconDark`, `brandColor`, `brandColorDark` and
  `screenshots`. Icons must be square, at least 48x48, PNG/JPEG/WebP/SVG, under
  5 MiB ([submission docs](https://developers.openai.com/plugins/deploy/submission#icons-and-screenshots)).
  Shipped listings use a 512x512 PNG logo (Figma) or 256x256 (Notion) and a
  small SVG composer icon. The app-directory guidelines say screenshots are no
  longer shown; starter prompts (`defaultPrompt`, up to three, 128 characters)
  do that job.
- **GitHub social preview.** PNG, JPG or GIF under 1 MB; 1280x640 recommended;
  set only through Settings, not the API
  ([GitHub docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)).

## What this means for Methodsmith

- Hero: mark, wordmark, the tagline, four badges (release, licence, CI, docs).
- Install: Claude Code and Codex as code blocks above the fold; other hosts link
  to `docs/setup.md`.
- The loop first (plan -> work -> review -> compound), then the feature grid by
  audience, then "Why trust it" (EQUATOR, PHI guard, numbers locked, reviewers).
- A terminal demo on synthetic data, captioned as a scripted replay.
- Credit Every's Compound Engineering by name and link, as lineage.
- Brand vocabulary from the audience research: rigorous, reproducible,
  verified, transparent, audit trail. Not: autonomous, 10x, vibe, "AI
  statistician".
