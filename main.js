/*
 * MIT License
 * 
 * Copyright (c) 2021 Ziad Lteif
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
let [coordX, coordY] = [58.089, -68.428]; //CYVP airport 59.094 -68.421
const layer02 = 'REPS.DIAG.6_PRMM.ERGE0.2'; //Regional precipitation >= 0.2mm
const layer1 = 'REPS.DIAG.6_PRMM.ERGE1'; //Regional precipitation >= 1mm
const layer25 = 'REPS.DIAG.6_PRMM.ERGE2.5'; //Regional precipitation >= 2.5mm
const layer5 = 'REPS.DIAG.6_PRMM.ERGE5'; //Regional precipitation >= 5mm
const layerTemp = 'RDPS.ETA_TT'; //Regional mean average temperature
const layerWindDir = 'RDPS.ETA_WD'; //Wind direction
const layerWindSp = 'RDPS.ETA_WSPD'; //Wind speed
const nightly = 'https://geomet-dev-03-nightly.cmc.ec.gc.ca/geomet?service=WMS&version='; //Nightly build
const regular = 'https://geo.weather.gc.ca/geomet?service=WMS&version='; //Regular build
const regularCapab = 'https://geo.weather.gc.ca/geomet/?lang=en&service=WMS&version=1.3.0&request=GetCapabilities&layers=';
const nightlyCapab = 'https://geomet-dev-03-nightly.cmc.ec.gc.ca/geomet?service=WMS&version=1.3.0&request=GetCapabilities&layers=';
let utc = -4; //Timezone
let [version, request, info_format] = ['1.3.0', 'GetFeatureInfo', 'application/json']; //Version, request and format for the information
let [minx, miny, maxx, maxy] = [coordX - 0.25, coordY - 0.25, coordX + 0.25, coordY + 0.25]; //bbox around CYVP airport
let progress = 0;
const colorArray = ["low0","low1","low2","low3","medium1","medium2","medium3","high1","high2","high3","high4"];
/**
 * Initializes an array containing all the required information to send the requests to Geomet.
 * Timesteps for the time= parameter is also considered and calculated.
 * @param {Array} headers containing the timestamps covered
 * @returns {Array} containing timesteps and urls
 */
function prepareRequests(headers, server) {
  const interval = headers[3];
  let timesteps = [];
  timesteps.push(headers[4].toISOString().replace('.000', '')); //Remove trailing zeroes for compatibility with time= parameter
  let increment = headers[4];
  for (let i = 0; i < headers[6]; ++i) {
    increment.setHours(increment.getHours() + Number(interval)); //Set the hour according to the intervals supported
    timesteps.push(increment.toISOString().replace('.000', '')); //Add to timesteps array
  }
  let url02 = server +
    version + '&request=' + request + '&layers=' + layer02 + '&crs=EPSG:4326&bbox=' +
    minx + ',' + miny + ',' + maxx + ',' + maxy + '&exceptions=xml&width=10&height=10&INFO_FORMAT=' +
    info_format + '&query_layers=' + layer02 + '&x=1&y=1';
  let url1 = server +
    version + '&request=' + request + '&layers=' + layer1 + '&crs=EPSG:4326&bbox=' +
    minx + ',' + miny + ',' + maxx + ',' + maxy + '&exceptions=xml&width=10&height=10&INFO_FORMAT=' +
    info_format + '&query_layers=' + layer1 + '&x=1&y=1';
  let url25 = server +
    version + '&request=' + request + '&layers=' + layer25 + '&crs=EPSG:4326&bbox=' +
    minx + ',' + miny + ',' + maxx + ',' + maxy + '&exceptions=xml&width=10&height=10&INFO_FORMAT=' +
    info_format + '&query_layers=' + layer25 + '&x=1&y=1';
  let url5 = server +
    version + '&request=' + request + '&layers=' + layer5 + '&crs=EPSG:4326&bbox=' +
    minx + ',' + miny + ',' + maxx + ',' + maxy + '&exceptions=xml&width=10&height=10&INFO_FORMAT=' +
    info_format + '&query_layers=' + layer5 + '&x=1&y=1';
  let urlTemp = server +
    version + '&request=' + request + '&layers=' + layerTemp + '&crs=EPSG:4326&bbox=' +
    minx + ',' + miny + ',' + maxx + ',' + maxy + '&exceptions=xml&width=10&height=10&INFO_FORMAT=' +
    info_format + '&query_layers=' + layerTemp + '&x=1&y=1';
  let urlWd = server +
    version + '&request=' + request + '&layers=' + layerWindDir + '&crs=EPSG:4326&bbox=' +
    minx + ',' + miny + ',' + maxx + ',' + maxy + '&exceptions=xml&width=10&height=10&INFO_FORMAT=' +
    info_format + '&query_layers=' + layerWindDir + '&x=1&y=1';
  let urlWspd = server +
    version + '&request=' + request + '&layers=' + layerWindSp + '&crs=EPSG:4326&bbox=' +
    minx + ',' + miny + ',' + maxx + ',' + maxy + '&exceptions=xml&width=10&height=10&INFO_FORMAT=' +
    info_format + '&query_layers=' + layerWindSp + '&x=1&y=1';
  let info = [];
  info.push(timesteps, url02, url1, url25, url5, urlTemp, urlWd, urlWspd);
  return info;
}
/**
 * Function takes in the headers prepared by prepareRequests() and a nb for the url to fetch and sends
 * the request asynchronously.
 * @param {Array} headers Array containing timesteps, urls
 * @param {Number} nb Index of url to fetch
 * @returns Values for the requested layer
 */
async function sendRequests(headers, nb) {
  console.log("Sending requests batch #" + nb);
  let responses = [];
  let datesMod = [];
  let url = headers[nb].concat("&time=" + headers[0][0]);
  for (let k = 0; k < headers[0].length; ++k) {
    datesMod.push(headers[0][k]);
  }
  for (let i = 0; i < datesMod.length; ++i) {
    try {
      if (i != 0) {
        url = url.replace(/[^=]*$/.exec(url), datesMod[i]);
      }
      let response = await fetch(url);
      let data = await response.json();
      responses.push(data.features[0].properties.value);
      progress = progress + 1.2;
      if (progress >= 100) {
        progress = 100;
      }
      if (document.getElementById("loading-progress")) {
        document.getElementById("loading-progress").innerHTML = Math.round(progress) + '%';
      }
    } catch (e) {
      console.log("Exception detected with request. Skipping request(s)...");
    }
  }
  return responses;
}
/**
 * Function that finds the cardinality of an angle. (5 degrees becomes North).
 * @param {Number} num Integer to be transformed into cardinal
 * @return {String} Cardinality of the angle number provided in parameters.
 */
function degToCompass(num) {
  let val = Number((num / 45));
  let arr = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  if (Math.round((val % 8)) == 8) {
    return "Variables";
  }
  return arr[Math.round((val % 8))];
}
/**
 * Function takes in dates array and data array and traces the plotly.js plot 
 * for data visualisation. Dates are in ISO8601 format and trimmed to keep YYYY-MM-DD HH:MM.
 * A date containing empty data is pushed at the end of the array to prevent graph from cutting off
 * 
 * @param {*} xaxis 
 * @param {*} yaxis 
 * @param {*} nb 
 * @param {*} title 
 */
function tracePlot(xaxis, yaxis) {
  let date = [];
  let tempRounded = [];
  let windKm = [];
  let lastDate = new Date(xaxis[xaxis.length-1]);
  lastDate.setHours(lastDate.getHours() + 6);
  lastDate = lastDate.toLocaleString('fr-CA');
  lastDate = lastDate.substring(0, lastDate.indexOf('m'));
  lastDate = lastDate.replace(' h ', 'h');

  for (let i = 0; i < xaxis.length; ++i) {
    date[i] = xaxis[i].toLocaleString('fr-CA');
    date[i] = date[i].substring(0, date[i].indexOf('m'));
    date[i] = date[i].replace(' h ', 'h');
  }
  date.push(lastDate);
  for (let j = 0; j < yaxis[4].length; ++j) {
    tempRounded[j] = Number(Math.round(yaxis[4][j]));
  }
  for (let k = 0; k < yaxis[6].length; ++k) {
    if (!isNaN(Math.round(yaxis[6][k]))) {
      windKm[k] = Number(Math.round(yaxis[6][k] * 3.6));
    }
  }
  for (let l = 0; l < yaxis.length; ++l) {
    yaxis[l].push(0);
  }
  var trace1 = {
    x: date,
    y: yaxis[0],
    mode: 'lines+markers',
    name: 'Probabilités ≥ 0.5mm',
    line: {
      color: 'rgb(144, 224, 239)',
      width: 3,
      shape: 'hv'
    },
    fill: 'tozeroy',
  };
  var trace2 = {
    x: date,
    y: yaxis[1],
    mode: 'lines+markers',
    name: 'Probabilités ≥ 1.0mm',
    line: {
      color: 'rgb(72, 202, 228)',
      width: 3,
      shape: 'hv'
    },
    fill: 'tozeroy',
  }
  var trace3 = {
    x: date,
    y: yaxis[2],
    mode: 'lines+markers',
    name: 'Probabilités ≥ 2.5mm',
    line: {
      color: 'rgb(0, 150, 199)',
      width: 3,
      shape: 'hv'
    },
    fill: 'tozeroy',
  }
  var trace4 = {
    x: date,
    y: yaxis[3],
    mode: 'lines+markers',
    name: 'Probabilités ≥ 5.0mm',
    line: {
      color: 'rgb(2, 62, 138)',
      width: 3,
      shape: 'hv'
    },
    fill: 'tozeroy',
  }
  var layout = {
    title: 'Probabilités de précipitations',
    automargin: true,
    showlegend: true,
    showlegend: true,
    legend: {
      "orientation": "h"
    },
    xaxis: {
      showticklabels: true,
      tickangle: 0,
      nticks: 6,
      tickfont: {
        family: 'Old Standard TT, serif',
        size: 12,
        color: 'black'
      },
    },
    yaxis: {
      title: 'Probabilités (%)',
      range: [0, 100]
    }
  };
  
var data = [trace1, trace2, trace3, trace4 /*trace5, trace6*/];
  Plotly.newPlot('reps0', data, layout);
}
/**
 * Function takes in date and data arrays to populate the HTML table.
 * A heatmap is attributed to the values in each probabilities cells.
 * @param {*} date 
 * @param {*} data 
 * @param {*} nb 
 */
function createTable(date, data) {
  for (let z = 0; z < data.length; ++z) {
    data[z].pop();
  }
  console.log("Table date below.");
  console.table(data);
  console.table(date);
  let table = document.querySelector("#table-probs");
  let row;
  for (let k = 0; k < date.length; ++k) {
    date[k] = date[k].toLocaleString('fr-CA');
    date[k] = date[k].substring(0, date[k].indexOf('m'));
    date[k] = date[k].replace(' h ', 'h');
  }
  for (let i = 0; i < date.length; ++i) {
    row = table.insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(-1);
    let cell4 = row.insertCell(-1);
    let cell5 = row.insertCell(-1);
    let cell6 = row.insertCell(-1);
    let cell7 = row.insertCell(-1);
    if (!isNaN(Math.round(data[4][i]))) {
      cell6.innerHTML = Math.round(data[4][i]) + " °C";
    } else {
      cell6.setAttribute("id", "nan");
    }
    if (!isNaN(Math.round(data[5][i])) && !isNaN(Math.round(data[6][i]))) {
      cell7.innerHTML = Math.round(data[6][i] * 3.6) + " km/h " + degToCompass(data[5][i]);
    } else {
      cell7.setAttribute("id", "nan");
    }
    cell1.innerHTML = date[i];
    cell2.innerHTML = data[0][i] + " %";
    cell3.innerHTML = data[1][i] + " %";
    cell4.innerHTML = data[2][i] + " %";
    cell5.innerHTML = data[3][i] + " %";
    /*
     * Array lookup to correlate value with color scheme
     */
    for (let j = 0; j < 4; ++j) {
      switch(j) {
        case 0:
          let val = data[0][i] / 10;
          cell2.classList.add(colorArray[Math.round(val % 11)]);
          break;
        case 1:
          let val1 = data[1][i] / 10;
          cell3.classList.add(colorArray[Math.round(val1 % 11)]);
          break;
        case 2:
          let val2 = data[2][i] / 10;
          cell4.classList.add(colorArray[Math.round(val2 % 11)]);
          break;
        case 3:
          let val3 = data[3][i] / 10;
          cell5.classList.add(colorArray[Math.round(val3 % 11)]);
          break;
      }
    }
  }
}
/**
 * Function converts Zulu dates to ISO-8601 compliant dates that is then adjusted to the user's local time. 
 * @param {*} time 
 * @returns 
 */
function adjustUTC(time) {
  let adjustedDate = [];
  let dateTime;
  for (let i = 0; i < time.length; ++i) {
    dateTime = new Date(time[i]);
    adjustedDate.push(dateTime);
  }
  return adjustedDate;
}
/**
 * Parses Geomet service's GetCapabilities to retrieve time values.
 * Once time values are retrieved, requests are prepared and sent using
 * prepareRequests() and sendRequests()
 * Time values are then adjusted to local timezones with adjustUTC().
 * Finally, the graphs and tables are generated.
 */
console.log("Task started.");
document.querySelector("#version").innerHTML = "Version 3.1.1"
var parser = new ol.format.WMSCapabilities();
fetch(regularCapab + layer02).catch(function(e) {
  if (document.querySelector("body > div.container > div.row.loading")) {
    document.querySelector("body > div.container > div.row.loading").remove();
  }
  if (document.querySelector("body > div > p")) {
    document.querySelector("body > div > p").id = "fatal-exception";
    document.querySelector("body > div > p").innerHTML = "Une exception s'est produite. Vérifiez si vous êtes bel et bien connecté au VPN.";
  }
}).then(function(response) {
    return response.text();
  }).then(function(text) {
    let result = parser.read(text);
    console.log("GetCapabilities successfully retrieved.");
    let startTime = result.Capability.Layer.Layer[0].Layer[0].Layer[0].Layer[0].Dimension[0].default; //Retrieve start time dimensions.
    let values = result.Capability.Layer.Layer[0].Layer[0].Layer[0].Layer[0].Dimension[0].values; //Retrieve start time, end time and interval
    let endTime = values.substring(
      values.indexOf("/") + 1,
      values.lastIndexOf("/")
    ); //Substring to retrieve the end date. Usual format is startdate/enddate/interval. We want the substring of the string between the two slashes.
    let interval = /[^/]*$/.exec(values)[0].match(/\d+/)[0]; //RegEx to retrieve the number(X) in the PTXH value.  
    startDate = new Date(startTime);
    endDate = new Date(endTime);
    var dif = (Math.abs(endDate - startDate) / 36e5) / interval; //Number of different timestamps in start time and end time. 
    let headers = [];
    headers.push(startTime, values, endTime, interval, startDate, endDate, dif);
    headers = prepareRequests(headers, regular); //Prepare requests
    console.log("Requests successfully created.");
    let [begin, end] = [startTime.split('T')[0], endTime.split('T')[0]]; //For HTML title dates
    document.getElementById("title").innerHTML = "Pr&eacute;visions Kuujjuaq (CYVP) du " + begin + " au " + end;
    let adjustedUTC = adjustUTC(headers[0]);
    let promises = [];
    for (let i = 1; i < headers.length; ++i) {
      promises.push(sendRequests(headers, i));
    }
    Promise.all(promises)
      .then((results) => {
        console.log("Results received successfully. Details below:");
        console.table(results);
        console.log("Tracing graph...");
        tracePlot(adjustedUTC, results);
        console.log("Graph traced.");
        console.log("Populating table...");
        createTable(adjustedUTC, results);
        console.log("Table populated.");
        /*
         * Once the requests, graphs and tables are generated and the page is ready to be viewed, DOM manipulation to remove the loading animation. 
         */
        if (document.querySelector("body > div.container > div.row.loading")) {
          document.querySelector("body > div.container > div.row.loading").remove();
        }
        if (document.querySelector("body > div > p")) {
          document.querySelector("body > div > p").remove();
        }
        if (document.querySelector("#production-date")) {
          document.querySelector("#production-date").innerHTML = "Bulletin produit par le Service Météorologique du Canada le " + begin + ' à 12h00 HAE.';
        }
        console.log("Task done.");
      }).catch(err => {
        console.log(err);
        console.error('Une erreur s\'est produite. Veuillez réessayer dans quelques minutes. Si l\'erreur persiste, veuillez contacter Ziad.lteif@ec.gc.ca')});
  })