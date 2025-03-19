# KCEO Glossary
Bridging EO communities. Contribute to this community-driven glossary and improve or add definitions!

## Contributions and Feedback
The KCEO Glossary is built for the EO community. Your feedback and ideas are fundamental for the further development of this glossary. PR's and contributions of any kind are highly welcomed. 

### Contribution Guide

#### Editing existing terms 
Click the top right edit icon on a term page: 

![image](https://github.com/user-attachments/assets/f8a3a10a-f91d-45fa-8c83-957057dab9ef)

#### Adding new terms 
If you'd like to add an entirely new term to the glossary, you can do so by using the GitHub UI. Two steps are necessary: 

1. Creating a new markdown file under the `docs` directory, e.g. for `Your New Term`

You can copy the template from this file, change the content and commit the changes when you're done.
https://github.com/ec-jrc/KCEO-Glossary/blob/main/docs/_template.md

https://github.com/user-attachments/assets/6ac4090d-6aa9-4fd1-be2a-93158fd2dc95

2. Now that the file is created, it must be referenced in `mkdocs.yml` so that the site builder knows where it should appear on the web page. Just open this file and reference it in alphabetic order.
https://github.com/ec-jrc/KCEO-Glossary/blob/main/mkdocs.yml

![image](https://github.com/user-attachments/assets/2c510f52-02c7-4cac-bc16-3bbfc5ffca3b)

Commit the changes, done.

#### Tags 
We currently use the following tag system: 

If you want to add or remove tags you need to follow this syntax:

```markdown
---
title: In-Situ Observation
tags:
  - to be discussed
---
```
There is a tab in front of every tag followed by a hypen and a space.

We currently use the following tag system for: 

1. Discussion status:
- term to add (only tagged in issue/discussion)
- to be defined
- to be discussed
- to be approved
- approved

2. Class of term (from: "Lost in Translation: The Need for Common Vocabularies and an Interoperable Thesaurus in Earth Observation Sciences, to be published", DOI: 10.1007/s10712-024-09854-8)
- base term
- core term
- controversial term
- high-impact term


## To Do's:
- Update GitHub actions to run custom scripts for cross linking, topology and dependency graph every time. Requires some careful testing. High priority.
- Add contribution guide in this readme. High priority.
- Update landing page search with new terms if found. Requires small Python script. Low priority for now.
- Add versioning with mike.
- Decide about regular GitHub releases (e.g. yearly? or only when a "critial mass" is reached once it's more stable?)

## FAQ
### Mac build error
- If error `ERROR   -  "cairosvg" Python module is installed, but it crashed with:` just use:
- `export DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib` before. Or set it once, e.g. for zsh shell:
- `echo 'export DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib' >> ~/.zshrc && source ~/.zshrc`

### Local installation
- best create virtual env with python 3.11 with 
- `pip install "mkdocs-material[imaging]==9.5.34"`
- `pip install mkdocs-glightbox mkdocs-minify-plugin mkdocs-git-revision-date-localized-plugin mkdocs-git-committers-plugin-2`
- `mkdocs serve` for local server or `mkdocs build` for the static html with assets

(See also github actions in .github/workflows/ci.yml)
