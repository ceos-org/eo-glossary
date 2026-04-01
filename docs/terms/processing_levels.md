---
title: Processing Levels
description: "Raw Data
The physical telemetry payload data as received from the satellite, i.e."
tags:
- core
- to be discussed
- calval ingest
- WGCV
- WGClimate
---

# Processing Levels

## 1 Definition

Raw Data
The physical telemetry payload data as received from the satellite, i.e. a serial data stream without de-multiplexing.
Level 0
Reconstructed unprocessed data at full space-time resolution with all available supplemental information to be used in subsequent processing (e.g. ephemeris, health and safety) appended.
Level 1A
Reconstructed unprocessed data at full resolution, time-referenced, and annotated with ancillary information, including radiometric and geometric calibration coefficients and geo-referencing parameters (e.g. ephemeris) computed and appended but not applied to the Level 0 data.
Level 1B
Radiometrically corrected and calibrated data in physical units at full instrument resolution as acquired.
Level 1C
L1B data orthorectified, re-sampled to a specified grid
Level 2
Derived geophysical parameters (e.g. sea surface temperature, leaf area index) at the same resolution and location as Level 1B source data.
Level 3
Data or retrieved geophysical parameters which have been spatially and/or temporally re-sampled (i.e. derived from Level 1 or 2 products), usually with some completeness and consistency. Such re-sampling may include averaging and compositing.
Level 4
Model output or results from analyses of lower level data (i.e., variables that are not directly measured by the instruments, but are derived from these measurements; could be derived from multiple instrument measurements).

### Notes

### Examples

### Sources

- [CEOS/WGISS/DSIG/GLOS](https://ceos.org/document_management/Working_Groups/WGISS/Interest_Groups/Data_Stewardship/White_Papers/EO-DataStewardshipGlossary.pdf)
- [CEOS EO Data Stewardship Glossary](https://ceos.org/document_management/Working_Groups/WGISS/Interest_Groups/Data_Stewardship/White_Papers/EO-DataStewardshipGlossary.pdf)
- NESDIS Data Management Lexicon and Related Terms
