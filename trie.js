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

}

const trie = new Trie();

trie.insert('fart');
trie.insert('fact')