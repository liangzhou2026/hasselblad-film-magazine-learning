# Project showcase assets

- `site/assets/a12-mobile.png`: the maintainer-supplied, actual mobile screenshot. The complete 947 × 2048 original is retained without cropping or redrawing the model. It shows the Chinese A12 interface; it is not a new browser-test capture.
- `site/assets/social-preview.png`: 1280 × 640 PNG share card, smaller than 1 MB. The screenshot is only scaled to fit the composition, with no generated or reconstructed interface.
- `docs/showcase/social-preview.svg`: editable vector layout for the share card. It references the original screenshot using a relative path. Export at 1280 × 640 using an SVG renderer with DejaVu Sans and Noto Sans CJK SC available. Embed the referenced PNG when using a renderer that does not load relative image files.

The card uses a short English introduction for GitHub's international audience, with the Chinese project name and a bilingual educational-scope note. The Chinese and English READMEs each provide their own concise introduction and demo link.

## Website and repository previews

The website's Open Graph and Twitter metadata lives in `site/index.html`. It is static and bilingual so sharing crawlers can read it without running JavaScript; changing `?lang=en` does not create a separate crawler-localized share card. The regular page description follows the existing Chinese/English interface translation.

Deploy `site/assets/social-preview.png` with the site. If hosting a fork, update the canonical, `og:url`, `og:image` and `twitter:image` URLs to the new Pages address.

GitHub's repository Social preview is a separate repository setting. Committing this file does not update that setting. Upload the same PNG in repository Settings → Social preview when authorized. GitHub recommends 1280 × 640 pixels and a PNG, JPG or GIF smaller than 1 MB: [official documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview).

## Suggested repository settings

These are copy-ready suggestions, not settings applied by this source change.

**Description:** Free Chinese/English 3D explorer for 16 Hasselblad film magazines, with A12/A16/A24 assembly demos. Educational approximations.

**Homepage:** https://liangzhou2026.github.io/hasselblad-film-magazine-learning/

**Topics:** `hasselblad`, `film-photography`, `analog-photography`, `medium-format`, `3d-visualization`, `education`, `threejs`, `webgl`.

No model, animation or manual files are modified by these showcase changes. The existing third-party notices remain applicable. These screenshots do not establish mechanical accuracy, complete device compatibility or rights clearance for other bundled material.

## Check

```sh
node scripts/check-release.mjs
node --expose-gc scripts/check-i18n.cjs
```

The release audit also checks screenshot dimensions, share-image dimensions and size, metadata consistency, and the README image paths. Browser/WebGL behavior, live deployment and social-platform caches must be verified separately.
