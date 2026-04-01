---
title: Subsetting
description: "Extraction of a multi-dimensional rectangular pixel array from a data granule, defined by starting location and count along each dimension, or delivery of subset data based on time, space, variable..."
tags:
- core
- to be discussed
- calval ingest
- WGISS
- WGCV
---

# Subsetting

## 1 Definition

Extraction of a multi-dimensional rectangular pixel array from a data granule, defined by starting location and count along each dimension, or delivery of subset data based on time, space, variable type, or characteristics.

### Notes

Data subsetting can be achieved through several tools which support OpenDAP (THREDDS, Hyrax, ERDDAP). Specialized data APIs also support subsetting for order fulfillment (Common Access).
In research communities (for example, [earth sciences](https://en.wikipedia.org/wiki/Earth_science) , [astronomy](https://en.wikipedia.org/wiki/Astronomy) , [business](https://en.wikipedia.org/wiki/Business) , and [government](https://en.wikipedia.org/wiki/Government) ), subsetting is the process of retrieving just the parts of large files which are of interest for a specific purpose. This occurs usually in a client—server setting, where the extraction of the parts of interest occurs on the server before the data is sent to the client over a network. The main purpose of subsetting is to save bandwidth on the network and storage space on the client computer.
Subsetting may be favorable for the following reasons: [[1](https://en.wikipedia.org/wiki/Subsetting#cite_note-Institute2012-1) ]
- restrict or divide the time range
- select [cross sections](https://en.wikipedia.org/wiki/Cross-sectional_data) of data
- select particular kinds of [time series](https://en.wikipedia.org/wiki/Time_series)
- exclude particular observations
Subsetting within Programs
You can subset within statistical software programs to help speed up the process of subsetting if needed. There are many different types of subsetting that can provide challenges with using software programs though.
Some types of subsetting are:
- Atomic Vectors
- Lists
- Matrices and Arrays
- Data Frames
- S3 Objects
- S4 Objects

### Examples

### Sources

- [ECS Project](http://edhs1.gsfc.nasa.gov/waisdata/docsw/pdf/tp1520303.pdf)
- [NCEI/DAB](https://calvalportal.ceos.org/web/guest/t-d_wiki?p_p_id=com_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_com_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn_mvcRenderCommandName=%2Fwiki%2Fedit_page&_com_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn_redirect=https%3A%2F%2Fcalvalportal.ceos.org%2Fweb%2Fguest%2Ft-d_wiki%3Fp_p_id%3Dcom_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn%26p_p_lifecycle%3D0%26p_p_state%3Dnormal%26p_p_mode%3Dview%26_com_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn_mvcRenderCommandName%3D%252Fwiki%252Fview_page%26_com_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn_nodeName%3DCEOS_Terms_and_Definitions%26_com_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn_title%3DSubsetting&_com_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn_nodeId=668236&_com_liferay_wiki_web_portlet_WikiDisplayPortlet_INSTANCE_B9cyrDcwYNcn_title=NCEI%2FDAB)
- NESDIS Data Management Lexicon and Related Terms
