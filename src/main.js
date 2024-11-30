"use strict"
import { Trie } from "/src/trie.js"
import { buildTour } from "/src/tour.js"


// SEARCHBAR SETUP
const trie = new Trie();

const places = [
    // "mcdonalds",
    "car dealer", "car rental", "car repair", "car wash", "gas station", 
    "farm", "restaurant", 
    "art gallery", "art studio", "cultural landmark", "historical place", "monument", "museum", "sculpture",
    "library", "preschool", "primary school", "university",
    "amusement park", "aquarium", "botanical garden", "casino", "national park", "night club", "park", "skate park", "wedding venue",
    "bakery", "bar", "buffet restaurant", "cafe", "candy store", "cat cafe", "dessert shop", "dog cafe", "donut shop", "ice cream shop",
    "fire station", "beach", "church", "hindu temple", "mosque", "synagogue", "cemetery", "clothing store", "department store"
    ]

for (const place of places) {
    trie.insert(place);
}


const tourSearchContainer = document.querySelector(".tour-search-container");
const tourForm = document.querySelector(".tour-form");
const searchInput = document.querySelector(".search-input");
const searchOptions = document.querySelector(".search-options");
const searchOptionsContainer = document.querySelector(".search-options-container")

searchInput.addEventListener("input", updatePredictionList);
searchInput.addEventListener("focus", openSearchOptions);
document.addEventListener("click", closeSearchOptions);




function updatePredictionList() {

    const setSearchInput = function(e) {
        searchInput.value = e.target.textContent;
        updatePredictionList();
    }

    searchOptions.innerHTML = "";
        
    const words = trie.predictWord(searchInput.value);
        
    for (const word of words) {
        const newLi = document.createElement("li");

        newLi.textContent = word;
        newLi.className = "search-option";

        newLi.addEventListener("click", setSearchInput);
        
        searchOptions.append(newLi);
    }

}

function openSearchOptions(e) {
        searchOptionsContainer.style.display = "block";
        tourForm.classList.add("tour-form-selected")
        updatePredictionList();
}

function closeSearchOptions(e) {
    if(!tourSearchContainer.contains(e.target)) {
        searchOptionsContainer.style.display = "none";
        tourForm.classList.remove("tour-form-selected")
    }
}


// FRONT-END VALIDATION


let tourQueue;

// TOUR SUBMISSION
tourForm.addEventListener("submit", async function(e) {
    tourQueue = await submitTour(e);
    // add <query, tourQueue> to history

    updateNextStop(tourQueue);
})


async function submitTour(e) {
    // Prevent form submission
    e.preventDefault();

    // replace form.value's spaces with underscores
    let query = searchInput.value.trim();
    query = query.split(' ').join('_'); 

    const tourQueue = await buildTour(query);
    
    return tourQueue;
}

const nextStopContainer = document.querySelector(".next-stop-container");
const tourComplete = document.querySelector(".tour-complete");

function updateNextStop(tourQueue) {

    nextStopContainer.style.display = "block";
    tourComplete.style.display = "none";
    
    if(tourQueue.peek() === null) {
        nextStopContainer.style.display = "none";
        tourComplete.style.display = "block";

        return;
    }

    const nextStop = tourQueue.peek().place;

    // display name
    const nextStopDisplayName = document.querySelector(".next-stop-container .display-name");
    nextStopDisplayName.textContent = nextStop.displayName;

    // address
    const nextStopAddress = document.querySelector(".next-stop-container .address");
    nextStopAddress.textContent = nextStop.formattedAddress;

    // overview link
    const url = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${nextStop.id}`;

    const nextStopOverviewLink = document.querySelector(".next-stop-container .overview-link");
    nextStopOverviewLink.href = url;

}

const arrivalBtn = document.querySelector(".arrival-btn");

arrivalBtn.addEventListener("click", dequeueStop);

function dequeueStop() {
    const dequeued = tourQueue.dequeue();

    // dequeue to list

    updateNextStop(tourQueue);
}