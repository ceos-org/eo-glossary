---
description: Contribution Guide
---

# Contribution Guide

The KCEO Glossary is built from the EO community for the EO community. It is supposed to follow and implement the recommendations given in the [semantics chapter](https://github.com/ceos-org/interoperability-handbook/blob/main/Vocabulary.md#vocabulary-semantics) of [new (draft) version of the CEOS Interoperability Handbook](https://github.com/ceos-org/interoperability-handbook/tree/main?tab=readme-ov-file#ceos-interoperability-handbook-20). Your feedback and ideas are fundamental for the further development of this glossary. PR's and contributions of any kind are highly welcomed and encouraged. If you find yourself struggling with any of these steps, please reach out in the GitHub issues section. All you need to propose changes or add new terms is a GitHub account.

## Principles
- Avoid circular definitions at all cost 
- Multiple different definitions are allowed, but need to be separated 
- The files need to follow a certain structure to allow for proper parsing and tools to work (e.g. graph creation)
- We use tags for dicussion status and term classes (base, core, controversial, high-impact)

## Tag System
We currently use the following tag system for: 

1. Discussion status:
    - term to add (only tagged in issue/discussion)
    - to be defined
    - to be discussed
    - to be approved
    - approved

2. Class of term (from Strobl et al. 2024)
    - base term
    - core term
    - controversial term
    - high-impact term

## Editing Terms 
Editing existing terms is very simple. On each site in the glossary you will find a tiny edit icon on the top right, just next to the pages heading. If you click it you'll go directly to editing mode. Make the changes and create a PR.

## Adding Terms

If you are technical: You can either create a PR in the GitHub repository where we will review the request for certain formal aspects mentioned above under principles. If suitable, it will be merged. If it's a more controversial term, it will be discussed in the open where everyone can join the conversation. 

If you are not technical, you can simply open an issue in the GitHub repository and ask us directly to add the term. The term can then be discussed just in the same way in the open. Have a look at the structure of the existing terms in the glossary and make sure to include the following sections:

- Tags (facultative)
- Definition 
- Notes (facultative)
- Examples (facultative)
- Sources 

## Technical Details 

This glossary is built on mkdocs-material for simplicity. The source files are written in markdown and converted to html by mkdocs. If you intend on creating a PR with a new term, please see the `_template.md` file in the `docs` folder. A template for a term with two possible definitions looks like this: 

```markdown
---
title: Test term
tags:
- base
---

# Test term

## 1 Definition

Definition_goes_here. 

### Notes
- here should be bullets
- like this

### Examples 
- this is also bullets
- like this

### Sources 
- KCEO (no link included, so no brackets)
- [Website](https://en.wikipedia.org/wiki/Thai_script) ( if you have web references, just add the term goes into square [] brackets and the url into () normal brackets

in case that there is more than one definition, just add three underscores to separate the definition, rest remains identical 

___

# Test term

## 2 Definition

Second_definition_goes_here. 

### Notes
- here should be bullets
- like this

### Examples 
- this is also bullets
- like this

### Sources 
- KCEO (no link included, so no brackets)
- [Website](https://en.wikipedia.org/wiki/Thai_script) ( if you have web references, just add the term goes into square [] brackets and the url into () normal brackets
```

---

References: 

1. Strobl, P. A., Woolliams, E. R., & Molch, K. (2024). Lost in Translation: The Need for Common Vocabularies and an Interoperable Thesaurus in Earth Observation Sciences. Surveys in Geophysics, 1-29.
