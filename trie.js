"use strict"

class TrieNode {

    constructor(char) {
        this.char = char;
        this.children = new Map();
        this.isWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode(null);
    }

    insert(word) {
        let current = this.root;

        for (const char of word) {

            if (!current.children.has(char)) {
                const newNode = new TrieNode(char);

                current.children.set(char, newNode);
            }
            current = current.children.get(char);

        }

        current.isWord = true; // last letter of word

    }

    predictWord(string) {

        // returns the root of a sub-tree
        const getRemainingTree = function(string, root) {

            let current = root;

            // traverse up to last letter of string
            for (const char of string) {
                if (current.children.has(char)) {
                    current = current.children.get(char);
                }
            }

            return current;
        };

        var res = [];

        // get all words from a given sub-tree
        const getWords = function(string, root) {
            
            for (const child of root.children.values()) {
                
                const newString = string + child.char;
                if (child.isWord) {
                    res.push(newString);
                }
                
                if(root.children.size === 0) {
                    return
                }

                getWords(newString, child);
            }

        }


        const start = getRemainingTree(string, this.root);
        getWords(string, start);
        console.log(res);


    }

}