---
title: Contribution Guide
description: How to contribute terms and definitions to the EO Glossary — the community thesaurus for Earth Observation sciences.
---

# Contribution Guide

The EO Glossary is built from the EO community for the EO community. It implements the recommendations of the [semantics chapter](https://github.com/ceos-org/interoperability-handbook/blob/main/Vocabulary.md#vocabulary-semantics) of the [CEOS Interoperability Handbook 2.0](https://github.com/ceos-org/interoperability-handbook). Your feedback and ideas are fundamental — PRs and contributions of any kind are highly welcomed. If you get stuck at any step, open a GitHub issue. All you need is a GitHub account.

## Core Principles

- **No circular definitions** — a term must not be used in its own definition, and avoid circular chains (A defined by B, B defined by A).
- **Substitution principle** (THES#4) — definitions must be written such that they can replace the term in a sentence. A definition of "Accuracy" must not begin with "Accuracy is…"; it should begin directly with the meaning.
- **Separate notes from definitions** (THES#5) — explanations, caveats, and context go in a `### Notes` section. Examples go in `### Examples`. These complement the definition but are not part of it.
- **Source every definition** (THES#6) — every definition must include a `### Sources` section linking to the original source document.
- **Multiple definitions are allowed** (THES#8) — especially for controversial terms. Separate them with `___` and number them (`## 1 Definition`, `## 2 Definition`, …).

## Tag System

Tags classify each term by its **type** and **discussion status**.

### Term class (from Strobl et al. 2024)

| Tag | Meaning | Examples |
|-----|---------|---------|
| `base` | Foundational concepts used in definitions of other terms; require cross-community consensus | Data, Entity, Phenomenon, Property |
| `core` | Standard EO vocabulary with broadly agreed definitions | Accuracy, Calibration, Collection, Sensor |
| `controversial` | Terms used differently by separate communities; multiple definitions provided | Observation, In-Situ, Model, Sample |
| `high-impact` | Terms requiring full framework documents, not just a sentence definition | Interoperability, Policy, Near Real Time |

### Discussion status

| Tag | Meaning |
|-----|---------|
| `to be defined` | Term placeholder; definition not yet written |
| `to be discussed` | Draft definition exists; community discussion needed |
| `to be approved` | Definition ready; awaiting formal approval |
| `approved` | Definition approved by the community |

## Editing Existing Terms

Every term page has an **Edit this page** link at the bottom. Click it to open the file directly in GitHub's editor. Make your changes and submit a pull request. Simple edits (typos, grammar, minor clarifications) can go straight to a PR. Substantive changes to a definition should be discussed in an issue first, especially for `controversial` or `approved` terms.

## Adding New Terms

**If you are technical:** Create a PR in the GitHub repository. Name the file `docs/terms/your_term.md` using lowercase and underscores. Follow the template below.

**If you are not technical:** Open a [GitHub issue](https://github.com/ceos-org/eo-glossary/issues) and describe the term you want to add. We will work with you to draft the definition and add it.

## Term File Template

```markdown
---
title: Term Name
description: One-sentence summary of the definition (used for SEO and link previews).
tags:
  - core          # or base, controversial, high-impact
  - approved      # or to be defined, to be discussed, to be approved
---

# Term Name

## 1 Definition

Substitutable definition text here — written so it can replace the term in a sentence.
Must NOT begin with "Term Name is…".

### Notes

- Explanatory note providing additional context.
- Further clarifications or caveats.

### Examples

- Concrete example of the term in use.

### Sources

- [Source Organisation](https://example.com/source)
- ISO 12345:2023, clause 4.1

___

# Term Name

## 2 Definition

Alternative definition from a different community or standard.

### Notes

- Note specific to this definition.

### Sources

- [Alternative Source](https://example.com/alt-source)
```

## References

1. Strobl, P. A., Woolliams, E. R., & Molch, K. (2024). Lost in Translation: The Need for Common Vocabularies and an Interoperable Thesaurus in Earth Observation Sciences. *Surveys in Geophysics*. [doi:10.1007/s10712-024-09854-8](https://doi.org/10.1007/s10712-024-09854-8)
2. CEOS Interoperability Handbook 2.0 — Vocabulary (Semantics) chapter. [GitHub](https://github.com/ceos-org/interoperability-handbook)
