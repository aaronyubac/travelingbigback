"use strict"
import { Trie } from "/src/trie.js"


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

searchBar.addEventListener("input", function() {

    searchOptions.innerHTML = "";

    const words = trie.predictWord(this.value);

    for (const word of words) {
        const newLi = document.createElement("li");
        newLi.append(word);


        searchOptions.append(newLi);
    }
});

// front-end validation

// handle tour submission
const tourForm = document.querySelector(".tour-form");
tourForm.addEventListener("submit", function(e) {
    submitTour(e, this);
})

function submitTour(e, form) {
    // Prevent form submission
    e.preventDefault();

    // replace form.value's spaces with underscores

    // send api request
}