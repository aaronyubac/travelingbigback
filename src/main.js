"use strict"
import { Trie } from "/src/trie.js"


// SEARCHBAR SETUP
const trie = new Trie();

const places = [
    "mcdonalds",
    "car dealer", "car rental", "car repair", "car wash", "gas station", 
    "farm", 
    "art gallery", "art studio", "cultural landmark", "historical place", "monument", "museum", "sculpture",
    "library", "preschool", "primary school", "university",
    "amusement park", "aquarium", "botanical garden", "casino", "national park", "night club", "park", "skate park", "wedding venue",
    "bakery", "bar", "buffet restaurant", "cafe", "candy store", "cat cafe", "dessert shop", "dog cafe", "donut shop", "ice cream shop",
    "fire station", "beach", "church", "hindu temple", "mosque", "synagogue", "cemetery", "clothing store", "department store"
    ]

for (const place of places) {
    trie.insert(place);
}


const searchBar = document.querySelector(".search-input");
const searchOptions = document.querySelector(".search-options");

searchBar.addEventListener("input", updatePredictionList);

function updatePredictionList() {

    searchOptions.innerHTML = "";
        
    const words = trie.predictWord(this.value);
        
    for (const word of words) {
        const newLi = document.createElement("li");
        newLi.append(word);
            
        searchOptions.append(newLi);
    }
}


// front-end validation




// TOUR SUBMISSION
const tourForm = document.querySelector(".tour-form");
tourForm.addEventListener("submit", function(e) {
    submitTour(e);
})

async function submitTour(e) {
    // Prevent form submission
    e.preventDefault();
    
    try {
        const userCoords = await getUserLocation();

        // replace form.value's spaces with underscores
        let query = searchBar.value.trim();
        query = query.split(' ').join('_'); 

        // Get nearby locations(nodes)
        const places = await nearbySearch(userCoords.latitude, userCoords.longitude, query);

        // Get durations(edges - { destination, duration })
        // const durations = await getDurations(userCoords.latitude, userCoords.longitude, places);
        // const durationAdjacencyList = createAdjacencyList(durations);

        
       
        buildRoute(durationAdjacencyList);
        
    } catch(err) {
        console.log(err);
    }
    
    
}

function getUserLocation() {
    const showError = function(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.")
                break;
        }
    }
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position.coords);
            }, showError);
        } else {
            console.log("Geolocation is not supported by this browser")
            reject();
        }

    })

}

async function nearbySearch(lat, long, query) {

        const { Place } = await google.maps.importLibrary(
            "places",
      );

      // BUILD GOOGLE PLACES REQUEST
      const buildRequest = function (lat, long, query) {
          let center = new google.maps.LatLng(lat, long);
          
          const fields = ["displayName", "location", "formattedAddress", "id"];
          const maxResultCount = 5;
          
          const request = {
              fields: fields,
              locationRestriction: {
                  center: center,
                  radius: 1000,
                },
                includedPrimaryTypes: [query],
                maxResultCount: maxResultCount,
        };
        
        return request;
    }
    
    const request = buildRequest(lat, long, query);
    // const { places } = await Place.searchNearby(request);
    
    const places = JSON.parse(`[{"id":"ChIJmRajZBNR2YAR5jQqf0-jQvM","displayName":"La Sinaloense Bar & Grill","formattedAddress":"954 Cardiff St, San Diego, CA 92114, USA"},{"id":"ChIJ8Z2zveRQ2YARSP82jljLOMU","displayName":"California Mexican Food","formattedAddress":"940 Cardiff St, San Diego, CA 92114, USA"},{"id":"ChIJgX-eqeZQ2YARMpx0bu-pk1I","displayName":"Pizzero Grill","formattedAddress":"1501 Skyline Dr, Lemon Grove, CA 91945, USA"}]`);

    return places;
}

function getDurations(lat, long, places) {
    
    return new Promise(resolve => {

        let center = new google.maps.LatLng(lat, long);
        
        const addresses = [center];
        
        for (const place of places) {
            addresses.push(place.formattedAddress);
        }

        const travelMode = 'DRIVING';
        const unitSystem = google.maps.UnitSystem.IMPERIAL;
        const avoidTolls = true;
    
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: addresses,
            destinations: addresses,
            travelMode: travelMode,
            unitSystem: unitSystem,
            avoidTolls: avoidTolls,
        }, (response, status) => {
            resolve({ response, status })
        });
    })
        
}

function createAdjacencyList({ response, status }) {
    
    class Edge {
        constructor(destination, duration) {
            this.destination = destination;
            this.duration = duration;
        }
    }

    if (status == 'OK') {
        const origins = response.originAddresses;
        const destinations = response.destinationAddresses;

        const durationAdjacencyList = {};
    
        for (let i = 0; i < origins.length; i++) { 
            const results = response.rows[i].elements;
        
            durationAdjacencyList[origins[i]] = [];

            for (let j = 0; j < results.length; j++) { 
                const duration = results[j].duration;

                const edge = new Edge(destinations[j], duration);
                durationAdjacencyList[origins[i]].push(edge);

            }
        }
        return durationAdjacencyList;
    } else {
        // handle failed received response
        console.log(status);
    }

} 

function buildRoute(durationAdjacencyList) {
        const visited = new Set();

        let currentNode = Object.keys(durationAdjacencyList)[0];
        console.log("currentNode: " + currentNode);

        while(true) {
            visited.add(currentNode);
            console.log("visited: " + [...visited]);

            const edges = durationAdjacencyList[currentNode];

            let minimum;

            for (const edge of edges) {

                if(visited.has(edge.destination)) {
                    continue;
                }

                // case: minimum has not been assigned yet
                if(minimum === undefined) {
                    minimum = edge;
                    continue;
                }

                if(edge.duration.value < minimum.duration.value) {
                    minimum = edge;
                }
            }

            console.log("minimum: " + JSON.stringify(minimum));

            // no more nodes left
            if(minimum === undefined) {
                break;
            } else {
                // add minimum to queue
                currentNode = minimum.destination;
            }

        }

        // return queue;
}