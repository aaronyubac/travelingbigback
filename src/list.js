"use strict"
export { List }

class ListNode {
    constructor(place) {
        this.place = place;
        this.next = null;
        this.prev = null;
    }
}

class List {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
    }

    append(place) {
        const newNode = new ListNode(place) 

        // case: empty list
        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        } else { 
            // regular case
            newNode.prev = this.tail;
            this.tail.next = newNode;

            this.tail = newNode;
        }
    }

    isEmpty() {
        return this.head === null;
    }

    print() {
        let current = this.head;

        while(current !== null) {
            console.log(current);

            current = current.next;
        }
    }
}