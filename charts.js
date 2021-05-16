function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samplesData = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var sampleNumber = samplesData.filter(sampleObj => sampleObj.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var firstSample = sampleNumber[0];
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIDs = sampleNumber.map(function(id){
      return id.otu_ids;
    });
    var otuLabels = sampleNumber.map(function(label){
      return label.otu_labels;
    });
    var sampleValues = sampleNumber.map(function(values){
      return values.sample_values;
    })

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    var topTenOTUids = firstSample.otu_ids.slice(0,10).sort((a,b) => a.otuIDs - b.otuIDs).reverse();
    for (el in topTenOTUids) {
      topTenOTUids[el] = "OTU " + topTenOTUids[el]
    };
    var topTenOTUvalues = firstSample.sample_values.slice(0,10).sort((a,b) => a.sampleValues - b.sampleValues).reverse();

    var topTenLabels = firstSample.otu_labels.slice(0,10);

    // 8. Create the trace for the bar chart. 
    var trace1 = {
      x: topTenOTUvalues,
      y: topTenOTUids,
      text: topTenLabels,
      type: "bar",
      orientation: "h"
    };
    
    var barData = [trace1];
      
    // 9. Create the layout for the bar chart. 
    var barLayout = {
     title: {
      text: "Top 10 Bacteria Cultures Found",
      x: 0.5,
      y: 0.85,
      xanchor: "center",
      yanchor: "top"
      },
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    // 1. Create the trace for the bubble chart.
    var OTUids = firstSample.otu_ids;
    var OTUvalues = firstSample.sample_values;
    var Labels = firstSample.otu_labels;
    
    var trace2 = {
      x: OTUids,
      y: OTUvalues,
      text: Labels,
      type: "scatter",
      mode: "markers",
      marker: {
        size: OTUvalues,
        color: OTUids
      }
    };
    
    var bubbleData = [trace2];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: {
        text: "Bacteria Cultures Per Sample",
        x: 0.5,
        y: 0.8,
        xanchor: "center",
        yanchor: "top"
      },
      xaxis: {
        title: {
          text:"OTU ID"
        }
      }
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // D2: 3. Use Plotly to plot the data with the layout.
    var metadata = data.metadata;
    var washFreq = metadata.filter(metadataObj => metadataObj.id == sample);
    var firstWashFreq = washFreq[0];
    var wFreq = washFreq.map(function(wfreq){
      return metadata.wfreq;
    });
    washFrequency = firstWashFreq.wfreq
    
    // 4. Create the trace for the gauge chart.
    var trace3 = {
      domain: {x: OTUids, y: OTUvalues},
      value: washFrequency,
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: {range: [null, 10], dtick: 2},
        bar: {color: "black"},
        steps: [
          {range: [0, 2], color: "red"},
          {range: [2, 4], color: "orange"},
          {range: [4, 6], color: "yellow"},
          {range: [6, 8], color: "lightgreen"},
          {range: [8, 10], color: "green"}
        ]
      }
      
    };
    
    var gaugeData = [trace3];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
     title: {
       text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
       x: 0.5,
       y: 0.8,
       xanchor: "center",
       yanchor: "top"
     }

    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
