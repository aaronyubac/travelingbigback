import { describe, test, it, expect } from "vitest"
import { Trie } from "/trie.js"

describe("predictWord", () => {

    const trie = new Trie();

    trie.insert("fart");
    trie.insert("fast");
    trie.insert("farted");
    trie.insert("happy");
    trie.insert("fastly");
    trie.insert("flop");
    trie.insert("faster");
    trie.insert("pony");


    
    
    it("should return the list of all words possible given a char", () => {
        
        var result = trie.predictWord("f");
        const expected = ["fart", "farted", "fast", "fastly", "faster", "flop"]

        expect(result).toEqual(expected)
    });

    it("should return the list of all words possible given a string", () => { 
        const result = trie.predictWord("fast");
        const expected = ["fast", "fastly", "faster"]

        expect(result).toEqual(expected)
    });

    it("input doesn't have an associated word and should return an empty list", () =>{
        const result = trie.predictWord("hun");
        const expected = [];

        expect(result).toEqual(expected);
    })
})