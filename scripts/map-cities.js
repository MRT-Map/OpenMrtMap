var towns; //declared here so that it can be used by other functions

$.ajax({
    url: 'https://script.google.com/macros/s/AKfycbwde4vwt0l4_-qOFK_gL2KbVAdy7iag3BID8NWu2DQ1566kJlqyAS1Y/exec?spreadsheetId=1JSmJtYkYrEx6Am5drhSet17qwJzOKDI7tE7FxPx4YNI&sheetName=New%20World',
    type: 'GET',
    success: (res) => {
        mapTowns(res)
    }
})

let cityMarkers = {}
let cityLayers = {}

//when we zoom the map
//remove cities when we zoom out
//add them when we zoom in
function mapLayers() {
    if (!displayTowns) {
      map.removeLayer(cityLayers.Community);
      map.removeLayer(cityLayers.Premier);
      map.removeLayer(cityLayers.Governor);
      map.removeLayer(cityLayers.Senator);
      map.removeLayer(cityLayers.Mayor);
      map.removeLayer(cityLayers.Councillor);
      map.removeLayer(cityLayers.Unranked);
      map.removeLayer(CC);
      return;
    }
    map.removeLayer(searchLayer);
    map.addLayer(CC);
    if (map.getZoom() >= 1) {
        map.addLayer(cityLayers.Premier);
    } else {
        map.removeLayer(cityLayers.Premier);
    }

    if (map.getZoom() >= 2) {
        map.addLayer(cityLayers.Governor);
        map.addLayer(cityLayers.Senator);
        map.addLayer(cityLayers.Community);
    } else {
        map.removeLayer(cityLayers.Governor);
        map.removeLayer(cityLayers.Senator);
        map.removeLayer(cityLayers.Community);
    }

    if (map.getZoom() >= 3) {
        map.addLayer(cityLayers.Councillor);
        map.addLayer(cityLayers.Mayor);
    } else {
        map.removeLayer(cityLayers.Councillor);
        map.removeLayer(cityLayers.Mayor);
    }

    if (map.getZoom() >= 4) {
        map.addLayer(cityLayers.Unranked);
    } else {
        map.removeLayer(cityLayers.Unranked);
    }
};

function mapTowns(res) {
    towns = JSON.parse(res);
    for (const town of towns) {
        town.Name = town["Town Name"]
        //parse Coords
        let rawCoords = [];
        rawCoords.push(town.X.toString().trim())
        rawCoords.push(town.Y.toString().trim())
        rawCoords.push(town.Z.toString().trim())

        //convert all numbers to int
        for (let i in rawCoords) {
            rawCoords[i] = parseInt(rawCoords[i])
        }
        //do not map if invalid coords
        if (isNaN(rawCoords[0]) || isNaN(rawCoords[2])) {
            console.warn(`Not displaying town ${town.Name}: invalid or missing coordinates`)
        } else {
            let coords = mapcoord([rawCoords[0], rawCoords[2]]);

            //if town rank array in object is undefined define it
            if (!Array.isArray(cityMarkers[town['Town Rank']])) {
                cityMarkers[town['Town Rank']] = []
            }
            //create marker and add it to array
            cityMarkers[town['Town Rank']].push(
                L.marker(coords)
                    .bindPopup(`Name: ${town.Name}<br>Mayor: ${town.Mayor}<br>Deputy Mayor: ${town['Deputy Mayor']}<br>Rank: ${town['Town Rank']}`)
            )
        }

    }

    let cityTypes = ["Premier", "Governor", "Senator", "Community", "Mayor", "Councillor", "Unranked"]

    //for each type of city
    cityTypes.forEach((type) => {
        //create a new feature group
        cityLayers[type] = new L.FeatureGroup();
        //and add all cities of type
        cityMarkers[type].forEach((city) => {
            cityLayers[type].addLayer(city);
        });
    });

    map.on('zoomend', mapLayers)
}

L.easyButton('fa-city', () => {
  displayTowns = displayTowns ? false : true;
  mapLayers()
}, "Show/Hide towns", {position: 'topright'}).addTo(map);