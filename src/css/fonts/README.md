# Self-hosted fonts

These unmodified normal-style variable WOFF2 subsets come from
`@fontsource-variable/inter@5.2.8` and
`@fontsource-variable/jetbrains-mono@5.2.8` (Latin and Latin Extended).

- [Inter upstream](https://github.com/rsms/inter), [Fontsource](https://fontsource.org/fonts/inter)
- [JetBrains Mono upstream](https://github.com/JetBrains/JetBrainsMono), [Fontsource](https://fontsource.org/fonts/jetbrains-mono)

Both use the SIL Open Font License 1.1; the corresponding license files are
included here. Fontsource is only the download source, not a package dependency.

`../fonts.css` declares the Unicode subsets with `font-display: swap` so browsers
only fetch the subsets they need. Docusaurus bundles and fingerprints the files
referenced by CSS. This replaces the render-blocking Google Fonts stylesheet
while retaining the existing families and system fallbacks for other scripts.
