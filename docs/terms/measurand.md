---
title: Measurand
tags:
  - core
  - to be approved
description: Particular Quantity subject to Measurement.
---

# Measurand

## 1 Definition

Particular Quantity subject to Measurement.

### Notes

### Examples

| Step | Process description |
| :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
--- |
| (Raw) | The complete and unaltered/unprocessed set of Data acquired by one or several sensors on a platform |
| M/0 uncalibrated | Unaltered/unprocessed Level 0 (main) Sensor Data annotated with processed Ancillary Data and supplemented by Auxiliary Data (including radiometric and geometric Calibration coefficients and geo-referencing parameters) allowing further processing to higher Levels. |
| M/1 Sensor-calibrated | Level M/0 Sensor Data which have been calibrated (ideally traceable to SI) and spatially aligned (co-located, eventually co-gridded) to represent at-Sensor measurements (Value and Uncertainty) in Sensor nominal spatiotemporal sampling, supplemented by appropriate ancillary data. |
| M/2 target-calibrated | Level M/1 Data processed to represent geophysical Property values (and uncertainties) for a specified target (Object, Feature of interest, e.g. surface reflectance, apparent temperature) derived from M/1 Sensor Data, as much as possible maintaining the sensors nominal spatial and temporal sampling (Observation preserving). |
| M/3 homogenised | Level M/1 or M/2 Data which have been generalised and integrated across one or several platforms and acquisitions to achieve an increased, more regular or in any other form enhanced spatial or temporal coverage in which states geophysical values agnostic of the originally acquiring Sensor and Observation condition and thus directly comparable. This homogenisation and fusion may include measurand re-Calibration to external standards and references including use of modelling, aggregation and interpolation. |
| M/4 derived/inferred | Model output or results from analyses of Level M/3 (or lower level) Data i.e., attributes that might not be directly observable by the Sensor(s) but are derived from observations in combination with other external incl. non-observational Data using techniques like modelling or machine learning (AI). |

From http://doi.org/10.2760/46796

### Sources
- VIM: 1993, 2.6
