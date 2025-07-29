---
title: Dependency Graph
toc: false
hide:
  - toc
---


<style>
#graphcontainer {
    height: 800px;
    width: 100%;
}

.graph-controls {
  margin-top: 10px;
  text-align: center;
}

.graph-controls button, .graph-controls input {
  height: 40px !important;
  padding: 8px 12px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

/* Tooltip styles */
#sigma-tooltip {
    position: absolute;
    display: none;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    pointer-events: none;
    z-index: 1000;
    max-width: 500px; /* Increased max-width for better display of article content */
    /*max-height: 400px;  Limit height */
    overflow-y: auto; /* Add scrollbar if content exceeds max-height */
    box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
}

/* You might want to reset some inner article styles if they clash */
#sigma-tooltip h1, #sigma-tooltip h2, #sigma-tooltip h3 {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-size: 1.2em; /* Smaller headings in tooltip */
}
#sigma-tooltip p {
    margin: 0 0 5px 0;
}

#sigma-tooltip aside {
    display: none;
}

.headerlink {
    display: none;
}

.md-content__button {
    display: none;
}


</style>

<script type="importmap">
      {
        "imports": {
          "sigma": "https://cdnjs.cloudflare.com/ajax/libs/sigma.js/3.0.0/sigma.min.js",
          "graphology": "https://cdn.jsdelivr.net/npm/graphology@0.26.0/dist/graphology.umd.min.js",
          "graphologyLibrary": "https://cdn.jsdelivr.net/npm/graphology-library/dist/graphology-library.min.js"
        }
      } 
</script>

<div id="graphcontainer"></div>

<div class="graph-controls">
  <button id="fullscreen-btn">Fullscreen</button>
  <button id="zoom-reset-btn">Reset Zoom</button>

  <input type="text" id="node-filter-input" placeholder="Filter nodes by label">
</div>

<script type="module">
import * as sigma from 'sigma';
import 'graphology';
import 'graphologyLibrary';

async function setupGraph() {
  const container = document.getElementById("graphcontainer");
  const graphDataUrl = 'https://ceos-org.github.io/eo-glossary/assets/sigmajs/sigma_graph_data.json';
  const glossaryBaseUrl = 'https://ceos-org.github.io/eo-glossary/terms/'; 

  try {
    const response = await fetch(graphDataUrl);
    const fileContent = await response.json();
    console.log(fileContent);

    const sigmaGraphData = fileContent;
    const graph = new graphology.Graph();

    sigmaGraphData.nodes.forEach(node => {
      graph.addNode(node.id, { ...node });
    });
    sigmaGraphData.edges.forEach(edge => {
      if (edge.source && edge.target) {
        graph.addEdge(edge.source, edge.target, { ...edge, type: 'arrow', size: 2 });
      }
    });

    graphologyLibrary.layoutForceAtlas2.assign(graph, {
      iterations: 50,
      settings: graphologyLibrary.layoutForceAtlas2.inferSettings(graph)
    });

    const renderer = new Sigma(graph, container, {
        // We draw labels on top of the nodes:
        labelRenderer: (context, data) => {
            const size = data.size;
            const font = `bold ${size}px Arial`;
            context.font = font;
            context.fillStyle = "#333";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(data.label, data.x, data.y + size + 3);
        }
    });

// --- Add Controls ---

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    });

    document.getElementById('zoom-reset-btn').addEventListener('click', () => {
      renderer.getCamera().animatedReset();
    });

    const filterNodes = () => {
      const filterValue = document.getElementById('node-filter-input').value.toLowerCase();
      graph.forEachNode(node => {
        const label = graph.getNodeAttribute(node, 'label').toLowerCase();
        if (filterValue && !label.includes(filterValue)) {
          graph.setNodeAttribute(node, 'hidden', true);
        } else {
          graph.setNodeAttribute(node, 'hidden', false);
        }
      });
      graph.forEachEdge(edge => {
          const sourceNodeHidden = graph.getNodeAttribute(graph.getSourceNode(edge), 'hidden');
          const targetNodeHidden = graph.getNodeAttribute(graph.getTargetNode(edge), 'hidden');
          if (sourceNodeHidden || targetNodeHidden) {
              graph.setEdgeAttribute(edge, 'hidden', true);
          } else {
              graph.setEdgeAttribute(edge, 'hidden', false);
          }
      });
      renderer.refresh();
    };

    document.getElementById('node-filter-input').addEventListener('input', filterNodes);

    // --- Tooltip Logic ---
    const tooltip = document.createElement('div');
    tooltip.id = 'sigma-tooltip';
    document.body.appendChild(tooltip); // Append to body to simplify positioning relative to viewport

    let currentTooltipTimeout;

    renderer.on('enterNode', async ({ node }) => {
        clearTimeout(currentTooltipTimeout); // Clear any pending hide timeout

        const nodeData = graph.getNodeAttributes(node);
        const nodeId = nodeData.id;
        // Convert node ID to a URL-friendly path (lowercase, hyphens instead of spaces)
        const glossaryPath = nodeId.toLowerCase().replace(/ /g, '-');
        const glossaryUrl = `${glossaryBaseUrl}${glossaryPath}/`; // Assuming trailing slash for MkDocs style URLs

        // Position the tooltip based on the node's screen coordinates
        const nodePosition = renderer.getNodeDisplayData(node);
        const containerRect = container.getBoundingClientRect(); // Get container position relative to viewport
        const pageX = nodePosition.x + containerRect.left + window.scrollX;
        const pageY = nodePosition.y + containerRect.top + window.scrollY;

        tooltip.style.left = `${pageX + 15}px`; // Offset to the right of the node
        tooltip.style.top = `${pageY - 15}px`; // Offset slightly above the node
        //tooltip.innerHTML = 'Loading preview...';
        tooltip.style.display = 'block';

               currentTooltipTimeout = setTimeout(async () => {
            try {
                const response = await fetch(glossaryUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${glossaryUrl}`);
                }
                const html = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                let articleContentHtml = '<p>No article content found.</p>';
                // Target the <article> tag
                const articleElement = doc.querySelector('article');

                if (articleElement) {
                    // Extract the innerHTML of the article tag
                    articleContentHtml = articleElement.innerHTML;
                    // Optional: remove common MkDocs heading if it's redundant inside the tooltip
                    // const firstH1 = articleElement.querySelector('h1.md-content__heading');
                    // if (firstH1) {
                    //     firstH1.remove(); // This removes it from the *cloned* DOM, not the original page
                    // }
                }

                // Set the tooltip's content directly to the article's HTML
                // You can still wrap it with the title if you want
                tooltip.innerHTML = `${articleContentHtml}`;
                tooltip.style.display = 'block';

            } catch (error) {
                console.error(`Failed to load glossary preview for ${nodeId} at ${glossaryUrl}:`, error);
                tooltip.innerHTML = `<strong>${nodeData.label}</strong><p>Could not load or parse full article preview.</p>`;
            }
        }, 0);
    });

    renderer.on('leaveNode', () => {
        clearTimeout(currentTooltipTimeout);
        tooltip.style.display = 'none';
    });

  } catch (error) {
    console.error("Failed to load or render graph:", error);
    container.innerHTML = "Could not load the graph data. Please check the console for errors.";
  }
}

setupGraph();
</script>
---

## Legacy Mermaid Graph 

<details style="width: fit-content">
  <summary>Legacy Mermaid Graph</summary>

```mermaid
flowchart TD;
    id_geopositioning(["<a href='../geopositioning'>Geopositioning</a>"]) --> id_geolocating(["<a href='../geolocating'>Geolocating</a>"]);
    id_object(["<a href='../object'>Object</a>"]) --> id_geolocating(["<a href='../geolocating'>Geolocating</a>"]);
    id_object(["<a href='../object'>Object</a>"]) --> id_laboratory_observation(["<a href='../laboratory_observation'>Laboratory Observation</a>"]);
    id_sensor(["<a href='../sensor'>Sensor</a>"]) --> id_observation(["<a href='../observation'>Observation</a>"]);
    id_sensor(["<a href='../sensor'>Sensor</a>"]) --> id_auxiliary_data(["<a href='../auxiliary_data'>Auxiliary Data</a>"]);
    id_sensor(["<a href='../sensor'>Sensor</a>"]) --> id_band_central_wavelength(["<a href='../band_central_wavelength'>Band Central Wavelength</a>"]);
    id_sensor(["<a href='../sensor'>Sensor</a>"]) --> id_calibration(["<a href='../calibration'>Calibration</a>"]);
    id_sensor(["<a href='../sensor'>Sensor</a>"]) --> id_geolocating(["<a href='../geolocating'>Geolocating</a>"]);
    id_sensor(["<a href='../sensor'>Sensor</a>"]) --> id_in-situ_observation(["<a href='../in-situ_observation'>In-situ Observation</a>"]);
    id_sensor(["<a href='../sensor'>Sensor</a>"]) --> id_ancillary_data(["<a href='../ancillary_data'>Ancillary Data</a>"]);
    id_model(["<a href='../model'>Model</a>"]) --> id_vertical_levels(["<a href='../vertical_levels'>Vertical Levels</a>"]);
    id_model(["<a href='../model'>Model</a>"]) --> id_time_of_day(["<a href='../time_of_day'>Time Of Day</a>"]);
    id_model(["<a href='../model'>Model</a>"]) --> id_calibration(["<a href='../calibration'>Calibration</a>"]);
    id_model(["<a href='../model'>Model</a>"]) --> id_temporal_resolution(["<a href='../temporal_resolution'>Temporal Resolution</a>"]);
    id_model(["<a href='../model'>Model</a>"]) --> id_geolocating(["<a href='../geolocating'>Geolocating</a>"]);
    id_model(["<a href='../model'>Model</a>"]) --> id_time_of_year(["<a href='../time_of_year'>Time Of Year</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_information(["<a href='../information'>Information</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_user(["<a href='../user'>User</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_validation(["<a href='../validation'>Validation</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_auxiliary_data(["<a href='../auxiliary_data'>Auxiliary Data</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_observation(["<a href='../observation'>Observation</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_replicability(["<a href='../replicability'>Replicability</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_geographic_data(["<a href='../geographic_data'>Geographic Data</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_calibration(["<a href='../calibration'>Calibration</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_area_of_interest(["<a href='../area_of_interest'>Area Of Interest</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_copernicus_service_provider(["<a href='../copernicus_service_provider'>Copernicus Service Provider</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_standard_uncertainty(["<a href='../standard_uncertainty'>Standard Uncertainty</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_sensor(["<a href='../sensor'>Sensor</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_model(["<a href='../model'>Model</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_reproducibility(["<a href='../reproducibility'>Reproducibility</a>"]);
    id_data(["<a href='../data'>Data</a>"]) --> id_ancillary_data(["<a href='../ancillary_data'>Ancillary Data</a>"]);
    id_place(["<a href='../place'>Place</a>"]) --> id_position(["<a href='../position'>Position</a>"]);
    id_place(["<a href='../place'>Place</a>"]) --> id_location(["<a href='../location'>Location</a>"]);
    id_place(["<a href='../place'>Place</a>"]) --> id_in-situ_observation(["<a href='../in-situ_observation'>In-situ Observation</a>"]);
    id_reference(["<a href='../reference'>Reference</a>"]) --> id_position(["<a href='../position'>Position</a>"]);
    id_reference(["<a href='../reference'>Reference</a>"]) --> id_geographic_data(["<a href='../geographic_data'>Geographic Data</a>"]);
    id_reference(["<a href='../reference'>Reference</a>"]) --> id_geographic_grid(["<a href='../geographic_grid'>Geographic Grid</a>"]);
    id_reference(["<a href='../reference'>Reference</a>"]) --> id_period_identifier(["<a href='../period_identifier'>Period Identifier</a>"]);
    id_reference(["<a href='../reference'>Reference</a>"]) --> id_traceability(["<a href='../traceability'>Traceability</a>"]);
    id_reference(["<a href='../reference'>Reference</a>"]) --> id_geographic_coordinate_reference_system(["<a href='../geographic_coordinate_reference_system'>Geographic Coordinate Reference System</a>"]);
    id_phenomenon(["<a href='../phenomenon'>Phenomenon</a>"]) --> id_observation(["<a href='../observation'>Observation</a>"]);
    id_phenomenon(["<a href='../phenomenon'>Phenomenon</a>"]) --> id_reference(["<a href='../reference'>Reference</a>"]);
    id_phenomenon(["<a href='../phenomenon'>Phenomenon</a>"]) --> id_laboratory_observation(["<a href='../laboratory_observation'>Laboratory Observation</a>"]);
    id_phenomenon(["<a href='../phenomenon'>Phenomenon</a>"]) --> id_remote_sensing(["<a href='../remote_sensing'>Remote Sensing</a>"]);
    id_phenomenon(["<a href='../phenomenon'>Phenomenon</a>"]) --> id_sensor(["<a href='../sensor'>Sensor</a>"]);
    id_phenomenon(["<a href='../phenomenon'>Phenomenon</a>"]) --> id_in-situ_observation(["<a href='../in-situ_observation'>In-situ Observation</a>"]);
    id_uncertainty(["<a href='../uncertainty'>Uncertainty</a>"]) --> id_reference(["<a href='../reference'>Reference</a>"]);
    id_uncertainty(["<a href='../uncertainty'>Uncertainty</a>"]) --> id_standard_uncertainty(["<a href='../standard_uncertainty'>Standard Uncertainty</a>"]);
    id_uncertainty(["<a href='../uncertainty'>Uncertainty</a>"]) --> id_thematic_uncertainty(["<a href='../thematic_uncertainty'>Thematic Uncertainty</a>"]);
    id_uncertainty(["<a href='../uncertainty'>Uncertainty</a>"]) --> id_in-situ_observation(["<a href='../in-situ_observation'>In-situ Observation</a>"]);
    id_uncertainty(["<a href='../uncertainty'>Uncertainty</a>"]) --> id_expanded_uncertainty(["<a href='../expanded_uncertainty'>Expanded Uncertainty</a>"]);
    id_uncertainty(["<a href='../uncertainty'>Uncertainty</a>"]) --> id_traceability(["<a href='../traceability'>Traceability</a>"]);
    id_observation(["<a href='../observation'>Observation</a>"]) --> id_reference(["<a href='../reference'>Reference</a>"]);
    id_observation(["<a href='../observation'>Observation</a>"]) --> id_measurement(["<a href='../measurement'>Measurement</a>"]);
    id_observation(["<a href='../observation'>Observation</a>"]) --> id_temporal_resolution(["<a href='../temporal_resolution'>Temporal Resolution</a>"]);
    id_observation(["<a href='../observation'>Observation</a>"]) --> id_remote_sensing(["<a href='../remote_sensing'>Remote Sensing</a>"]);
    id_observation(["<a href='../observation'>Observation</a>"]) --> id_in-situ_observation(["<a href='../in-situ_observation'>In-situ Observation</a>"]);
    id_observation(["<a href='../observation'>Observation</a>"]) --> id_representativeness(["<a href='../representativeness'>Representativeness</a>"]);
    id_grid(["<a href='../grid'>Grid</a>"]) --> id_geographic_grid(["<a href='../geographic_grid'>Geographic Grid</a>"]);
    id_entity(["<a href='../entity'>Entity</a>"]) --> id_trait(["<a href='../trait'>Trait</a>"]);
    id_entity(["<a href='../entity'>Entity</a>"]) --> id_user(["<a href='../user'>User</a>"]);
    id_entity(["<a href='../entity'>Entity</a>"]) --> id_object(["<a href='../object'>Object</a>"]);
    id_entity(["<a href='../entity'>Entity</a>"]) --> id_model(["<a href='../model'>Model</a>"]);
    id_entity(["<a href='../entity'>Entity</a>"]) --> id_phenomenon(["<a href='../phenomenon'>Phenomenon</a>"]);
    id_measurement(["<a href='../measurement'>Measurement</a>"]) --> id_representativeness(["<a href='../representativeness'>Representativeness</a>"]);
    id_measurement(["<a href='../measurement'>Measurement</a>"]) --> id_measurand(["<a href='../measurand'>Measurand</a>"]);
    id_measurement(["<a href='../measurement'>Measurement</a>"]) --> id_traceability(["<a href='../traceability'>Traceability</a>"]);
    id_measurement(["<a href='../measurement'>Measurement</a>"]) --> id_uncertainty(["<a href='../uncertainty'>Uncertainty</a>"]);
    id_measurand(["<a href='../measurand'>Measurand</a>"]) --> id_uncertainty(["<a href='../uncertainty'>Uncertainty</a>"]);
    id_location(["<a href='../location'>Location</a>"]) --> id_geocoding(["<a href='../geocoding'>Geocoding</a>"]);
    id_location(["<a href='../location'>Location</a>"]) --> id_geolocation_information(["<a href='../geolocation_information'>Geolocation Information</a>"]);
    id_location(["<a href='../location'>Location</a>"]) --> id_representativeness(["<a href='../representativeness'>Representativeness</a>"]);
    id_location(["<a href='../location'>Location</a>"]) --> id_geographic_data(["<a href='../geographic_data'>Geographic Data</a>"]);
    id_value(["<a href='../value'>Value</a>"]) --> id_observation(["<a href='../observation'>Observation</a>"]);
    id_value(["<a href='../value'>Value</a>"]) --> id_band_central_wavelength(["<a href='../band_central_wavelength'>Band Central Wavelength</a>"]);
    id_value(["<a href='../value'>Value</a>"]) --> id_in-situ_observation(["<a href='../in-situ_observation'>In-situ Observation</a>"]);
    id_information(["<a href='../information'>Information</a>"]) --> id_classification_system(["<a href='../classification_system'>Classification System</a>"]);
    id_information(["<a href='../information'>Information</a>"]) --> id_user(["<a href='../user'>User</a>"]);
    id_information(["<a href='../information'>Information</a>"]) --> id_geolocation_information(["<a href='../geolocation_information'>Geolocation Information</a>"]);
    id_information(["<a href='../information'>Information</a>"]) --> id_temporal_reporting_period(["<a href='../temporal_reporting_period'>Temporal Reporting Period</a>"]);
    id_information(["<a href='../information'>Information</a>"]) --> id_area_of_interest(["<a href='../area_of_interest'>Area Of Interest</a>"]);
    id_information(["<a href='../information'>Information</a>"]) --> id_copernicus_service_provider(["<a href='../copernicus_service_provider'>Copernicus Service Provider</a>"]);
    id_information(["<a href='../information'>Information</a>"]) --> id_thematic_resolution(["<a href='../thematic_resolution'>Thematic Resolution</a>"]);
    id_period(["<a href='../period'>Period</a>"]) --> id_temporal_reporting_period(["<a href='../temporal_reporting_period'>Temporal Reporting Period</a>"]);
    id_period(["<a href='../period'>Period</a>"]) --> id_representativeness(["<a href='../representativeness'>Representativeness</a>"]);
    id_period(["<a href='../period'>Period</a>"]) --> id_period_identifier(["<a href='../period_identifier'>Period Identifier</a>"]);
    id_period(["<a href='../period'>Period</a>"]) --> id_temporal_resolution(["<a href='../temporal_resolution'>Temporal Resolution</a>"]);
    id_temporal_resolution(["<a href='../temporal_resolution'>Temporal resolution</a>"]) --> id_temporal_reporting_period(["<a href='../temporal_reporting_period'>Temporal Reporting Period</a>"]);
    id_property(["<a href='../property'>Property</a>"]) --> id_observation(["<a href='../observation'>Observation</a>"]);
    id_property(["<a href='../property'>Property</a>"]) --> id_quantity(["<a href='../quantity'>Quantity</a>"]);
    id_property(["<a href='../property'>Property</a>"]) --> id_in-situ_observation(["<a href='../in-situ_observation'>In-situ Observation</a>"]);
    id_property(["<a href='../property'>Property</a>"]) --> id_phenomenon(["<a href='../phenomenon'>Phenomenon</a>"]);
    id_property(["<a href='../property'>Property</a>"]) --> id_traceability(["<a href='../traceability'>Traceability</a>"]);
    id_sample(["<a href='../sample'>Sample</a>"]) --> id_temporal_consistency(["<a href='../temporal_consistency'>Temporal Consistency</a>"]);
    id_trait(["<a href='../trait'>Trait</a>"]) --> id_property(["<a href='../property'>Property</a>"]);
    id_quantity(["<a href='../quantity'>Quantity</a>"]) --> id_duration(["<a href='../duration'>Duration</a>"]);
    id_quantity(["<a href='../quantity'>Quantity</a>"]) --> id_measurand(["<a href='../measurand'>Measurand</a>"]);
    id_quantity(["<a href='../quantity'>Quantity</a>"]) --> id_measurement(["<a href='../measurement'>Measurement</a>"]);
    id_confidence_interval(["<a href='../confidence_interval'>Confidence interval</a>"]) --> id_expanded_uncertainty(["<a href='../expanded_uncertainty'>Expanded Uncertainty</a>"]);
    id_position(["<a href='../position'>Position</a>"]) --> id_geopositioning(["<a href='../geopositioning'>Geopositioning</a>"]);
    id_position(["<a href='../position'>Position</a>"]) --> id_ancillary_data(["<a href='../ancillary_data'>Ancillary Data</a>"]);
    id_characteristic(["<a href='../characteristic'>Characteristic</a>"]) --> id_trait(["<a href='../trait'>Trait</a>"]);
    id_characteristic(["<a href='../characteristic'>Characteristic</a>"]) --> id_representativeness(["<a href='../representativeness'>Representativeness</a>"]);
    id_characteristic(["<a href='../characteristic'>Characteristic</a>"]) --> id_in-situ_observation(["<a href='../in-situ_observation'>In-situ Observation</a>"]);
    id_feature(["<a href='../feature'>Feature</a>"]) --> id_geopositioning(["<a href='../geopositioning'>Geopositioning</a>"]);
    id_feature(["<a href='../feature'>Feature</a>"]) --> id_characteristic(["<a href='../characteristic'>Characteristic</a>"]);
```
</details>


<style>
.md-container {
  overflow: auto;
}

.mermaid {
  width: 5000px;
}
</style>