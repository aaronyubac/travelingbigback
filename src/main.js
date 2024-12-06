"use strict"
import { Trie } from "/src/trie.js"
import { buildTour } from "/src/tour.js"
import { List } from "/src/list.js"

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


const tourNameDisplay = document.querySelector(".tour-name-display");
const tourSearchContainer = document.querySelector(".tour-search-container");
const tourForm = document.querySelector(".tour-form");
const searchInput = document.querySelector(".search-input");
const searchOptions = document.querySelector(".search-options");
const searchOptionsContainer = document.querySelector(".search-options-container")

searchInput.addEventListener("input", updatePredictionList);
searchInput.addEventListener("focus", openSearchOptions);
document.addEventListener("click", closeSearchOptions);



// SEARCH BAR WORD PREDICTION
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
let visited;
const history = new Map();

// TOUR SUBMISSION
tourForm.addEventListener("submit", async function(e) {
    tourQueue = await submitTour(e);
    visited = new List();

    updateNextStop(tourQueue);
    updateVisited(null);
    updateHistory();
})


async function submitTour(e) {
    // Prevent form submission
    e.preventDefault();
    
    // replace form.value's spaces with underscores
    const query = searchInput.value.trim();
    const queryFormatted = query.split(' ').join('_'); 
    
    const tourQueue = await buildTour(queryFormatted);
    const historyQueue = _.cloneDeep(tourQueue);

    const formattedTourDisplay = query.charAt(0).toUpperCase() + query.slice(1);

    history.set(formattedTourDisplay, historyQueue);
    
    tourNameDisplay.textContent = `${formattedTourDisplay} Tour`;

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


// VISITED
const arrivalBtn = document.querySelector(".arrival-btn");
const visitedNav = document.querySelector(".visited-nav");

arrivalBtn.addEventListener("click", dequeueStop);

function dequeueStop() {
    const dequeued = tourQueue.dequeue();
    visited.append(dequeued);
    
    updateVisited(visited.tail);
    updateNextStop(tourQueue);
}

function updateVisited(node) {
    
    if (visited.isEmpty()) {
        visitedNav.style.display = "none";
    } else {
        visitedNav.style.display = "flex";
        
        visited.current = node;
        
        const current = visited.current.place;
        
        // display name
        const visitedDisplayName = document.querySelector(".visited-info .display-name");
        visitedDisplayName.textContent = current.displayName;
        
        // review link
        const url = `https://search.google.com/local/writereview?placeid=${current.id}`;
        const nextStopOverviewLink = document.querySelector(".visited-info .review-link");
        nextStopOverviewLink.href = url;
    }
}

// visited arrow functions
const visitedPrev = document.querySelector(".visited-prev");
const visitedNext = document.querySelector(".visited-next");

visitedPrev.addEventListener("click", () => {
    if (visited.current.prev !== null) {
        updateVisited(visited.current.prev);
    }
});

visitedNext.addEventListener("click", () => {
    if (visited.current.next !== null) {
        updateVisited(visited.current.next)
    }
});

const dropdownBtn = document.querySelector(".dropdown-btn");
const historyContent = document.querySelector(".history-content");

dropdownBtn.addEventListener("click", toggleDropdown);

function toggleDropdown() {
    if (historyContent.style.display === "block") {
        historyContent.style.display = "none";
    } else {
        historyContent.style.display = "block";
    }
}

function updateHistory() {

    historyContent.innerHTML = "";

    history.forEach((historyQueue, query) => {
        
        const historyItem = document.createElement("p");
        historyItem.textContent = query;
        historyItem.className = "history-item";
        
        historyItem.addEventListener("click", () => {
            const copy = _.cloneDeep(historyQueue);

            tourQueue = copy;
            visited = new List();

            tourNameDisplay.textContent = `${query} Tour`;

            updateNextStop(copy);
            updateVisited(null);
            updateHistory();

            historyContent.style.display = "none";
        }
    );
    
    historyContent.append(historyItem);
});

}
