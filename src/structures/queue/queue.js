const { LinkedList } = require('../linked-list/linked-list');

class Queue {
    constructor() {
        this._list = new LinkedList();
    }

    /**
     * @returns { number }
     */
    get length() {
        return this._list.length;
    }

    /**
     * @param { any | any[] } item
     * @returns { void }
     */
    add(item) {
        const arr = Array.isArray(item) ? item : [item];
        arr.forEach(val => this._list.addToTail(val));
    }

    /**
     * @returns { * }
     */
    remove() {
        return this._list.removeFromHead();
    }

    /**
     * @returns { * | null }
     */
    first() {
        return this._list.getHead();
    }

    /**
     * @returns { * | null }
     */
    last() {
        return this._list.getTail();
    }
}

module.exports = { Queue };
