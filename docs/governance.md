---
id: governance
title: Governance
sidebar_position: 2
description: Governance model, roles, and review cycles for the CEOS Common Dictionary.
---

# Governance

The CEOS Common Dictionary operates on a balance of **Agility** (quick development and community contribution) and **Authority** (trusted, stable definitions backed by domain experts). 

Following the decisions made at [WGISS-60](https://ceos.org/document_management/Working_Groups/WGISS/Meetings/WGISS-60/WGISS-60%20Minutes%20and%20Actions%20v1.0.pdf) (see p. 50), this document outlines the governance model and lifecycle of contributions.

## Roles and Responsibilities

Our governance model relies on three tiers of participation to ensure broad community involvement while maintaining high scientific standards.

### 1. Contributors
*   **Who:** The global Earth Observation (EO) community, including members from the public, private, and academic sectors.
*   **Responsibilities:** 
    *   Propose new terms.
    *   Suggest edits or alternate definitions for existing terms.
    *   Participate in community discussions on GitHub Issues.
*   **How to join:** Anyone can contribute by opening a Pull Request (PR) or Issue in the GitHub repository. Please refer to our [Contribution Guidelines](/contribute) for step-by-step instructions.

### 2. Moderators
*   **Who:** Trusted technical experts and glossary maintainers managing daily repository operations.
*   **Responsibilities:**
    *   Review incoming edits for formatting, clarity, and adherence to dictionary principles (e.g., ensuring no circular definitions).
    *   Approve and merge simple, non-controversial changes ("Agile" workflow).
    *   Tag terms appropriately (e.g., `base`, `core`, `controversial`, `to be discussed`).
    *   Flag foundational changes or controversial terms for review by the CEOS Expert Groups.

### 3. Distributed Steering Group (CEOS Expert Groups)
*   **Who:** Chairs, Vice-Chairs, or nominated Leads from existing CEOS Working Groups and Virtual Constellations (e.g., WGCV, WGClimate, WGISS).
*   **Responsibilities:**
    *   Provide the ultimate authority and veto rights on terms assigned to their specific domain.
    *   Review foundational and controversial changes during the Pre-Release Cycle.
    *   Set the strategic direction for terminology within their expertise.

## Terminology Rules & Tagging

To maintain a clean and usable dictionary, the following technical rules apply:
*   **No Circular Definitions:** Terms must utilize parent-child relationships. 
*   **Base Terms:** Terms with no parents are considered *Base Terms*.
*   **Multiple Definitions:** A single term may have multiple definitions to reflect different domain usages. The first definition listed is considered the primary/most widely used definition.
*   **Tags:** Each term carries two tags — a **term class** (`base`, `core`, `controversial`, `high-impact`) and a **discussion status** (`to be defined`, `to be discussed`, `to be approved`, `approved`). See the [Contribution Guide](/contribute#tag-system) for details.

## Workflow and Approval Process

To balance rapid updates with authoritative oversight, changes are processed through two distinct tracks:

### The Agile Track (Daily Operations)
Simple additions, formatting fixes, or non-controversial updates are handled continuously. 
1. A Contributor opens a PR.
2. A Moderator reviews the PR against styling and structural guidelines.
3. If the change is straightforward, the Moderator merges it directly to the live site.

### The Authority Track (Pre-Release Cycle)
Foundational terms (e.g., *Data*, *Resolution*, *In-situ*) or highly debated definitions require domain expert consensus.
1. **Collation:** Over a 6-to-12-month period, Moderators collate proposed foundational changes into a "Pre-release" branch.
2. **Assignment:** Proposed terms are assigned to the relevant CEOS Expert Group based on domain (e.g., radiometric calibration terms go to WGCV).
3. **Review:** The designated CEOS Points of Contact review the Pre-release package. They may approve the changes, request modifications, or exercise veto rights.
4. **Release:** Once consensus is reached among the Expert Groups, the Pre-release is officially merged into the main dictionary as a new authoritative version.

## Conflict Resolution
In cases where consensus on a term cannot be reached between different EO domains, the dictionary embraces complexity rather than forcing false agreement. The term will be tagged as `controversial`, and multiple definitions will be clearly documented alongside context explaining the differing domain perspectives.