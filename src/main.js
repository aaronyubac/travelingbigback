"use strict"
import { Trie } from "/src/trie.js"
import { buildTour } from "/src/tour.js"


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

    // replace form.value's spaces with underscores
    let query = searchBar.value.trim();
    query = query.split(' ').join('_'); 

    const tourQueue = await buildTour(query);
    
    console.log("From main(): " + JSON.stringify(tourQueue.peek().place));
}

