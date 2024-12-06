"use strict"
export { buildTour }

async function buildTour(query) {

    try {
        const userCoords = await getUserLocation();
        
        
        // Get nearby locations(nodes)
        const places = await nearbySearch(userCoords.latitude, userCoords.longitude, query);

        // Get durations(edges - { destination, duration })
        const durations = await getDurations(userCoords.latitude, userCoords.longitude, places);
        const durationAdjacencyList = createAdjacencyList(durations);

        const tourQueue = buildRoute(places, durationAdjacencyList);

        return tourQueue;
        
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

        const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary(
            "places",
      );

      // BUILD GOOGLE PLACES REQUEST
      const buildRequest = function (lat, long, query) {
          let center = new google.maps.LatLng(lat, long);
          
          const fields = ["displayName", "location", "formattedAddress", "id"];
          const radius =  50 * 1000; // units: km
          const maxResultCount = 5;
          
          const request = {
              fields: fields,
              locationRestriction: {
                  center: center,
                  radius: radius,
                },
                includedPrimaryTypes: [query],
                maxResultCount: maxResultCount,
                rankPreference: SearchNearbyRankPreference.DISTANCE,
        };
        
        return request;
    }
    
    const request = buildRequest(lat, long, query);
    const { places } = await Place.searchNearby(request);
    
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

function buildRoute(places, durationAdjacencyList) {
        const visited = new Set();
        const tourQueue = new TourQueue();

        const placeMap = new Map();
        for (const place of places) {
            placeMap.set(place.formattedAddress, place);
        }

        let currentNode = Object.keys(durationAdjacencyList)[0];

        while(true) {
            visited.add(currentNode);

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

            // no more nodes left
            if(minimum === undefined) {
                break;
            } else {
                
                // go to nearest place
                currentNode = minimum.destination;

                // address discrepency due to api
                if(placeMap.get(minimum.destination) === undefined) {
                    continue; // skip undefined place
                } else {
                    // add place to tourQueue
                    const place = placeMap.get(minimum.destination);
                    tourQueue.enqueue(place);

                }


            }
        }
        
        return tourQueue;
}

class TourQueueNode {
    constructor(place) {
        this.place = place;
        this.next = null;
        this.prev = null;
    }
}

class TourQueue {
    constructor() {
        this.front = null;
        this.back = null;
    }

    enqueue(place) {
        const newNode = new TourQueueNode(place);

        // case: queue is empty
        if(this.front === null) {
            this.front = newNode;
            this.back = newNode;
        }

        // regular case
        newNode.prev = this.back
        this.back.next = newNode;

        this.back = newNode;
    }

    dequeue() {

        const dequeued = this.front.place;

        // case: one item in queue
        if(this.front === this.back) {
            this.front = null;
            this.back = null;

            return dequeued;
        }

        // regular case
        const next = this.front.next;

        // remove pointers
        this.front.next = null;
        next.prev = null;

        // change front
        this.front = next;

        return dequeued;

    }

    peek() {
        return this.front;
    }

    print() {
        let current = this.front;

        while(current !== null) {
            console.log(current.place);
            current = current.next;
        }
    }
}