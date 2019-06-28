/* Simulates private properties and methods */
const head = Symbol('head');
const tail = Symbol('tail');
const normalize = Symbol('normalize');

class LinkedListNode {
    /**
     * @this {{data: any}}
     * @param {*} data
     */
    constructor(data) {
        this.data = data;
        /** @type { LinkedListNode | null } */
        this._next = null;
        /** @type { LinkedListNode | null } */
        this._previous = null;
    }
}

class LinkedList {
    constructor() {
        this.length = 0;
        /** @type { LinkedListNode | null } */
        this._head = null;
        /** @type { LinkedListNode | null } */
        this._tail = null;
    }

    /**
     * @param {*} item
     * @returns { void }
     */
    addToHead(item) {
        const previousHead = this._head;
        const newNode = new LinkedListNode(item);

        if (previousHead) {
            previousHead._previous = newNode;
            newNode._next = previousHead;
        }

        this._head = newNode;
        this[normalize](head, 1);
    }

    /**
     * @param {*} item
     * @returns { void }
     */
    addToTail(item) {
        const previousTail = this._tail;
        const newNode = new LinkedListNode(item);

        if (previousTail) {
            previousTail._next = newNode;
            newNode._previous = previousTail;
        }

        this._tail = newNode;
        this[normalize](tail, 1);
    }

    /**
     * @returns { LinkedListNode | null }
     */
    removeFromHead() {
        if (!this._head) {
            return null;
        }

        const currentHead = this._head;
        const next = currentHead._next;
        this._head = next;

        if (this._head) {
            this._head._previous = null;
        }

        this[normalize](head, -1);
        return next;
    }

    /**
     * @returns { LinkedListNode | null }
     */
    removeFromTail() {
        if (!this._tail) {
            return null;
        }

        const currentTail = this._tail;
        const previous = currentTail._previous;
        this._tail = previous;

        if (this._tail) {
            this._tail._next = null;
        }

        this[normalize](head, -1);
        return currentTail;
    }

    /**
     * @returns { void }
     */
    reset() {
        this.length = 0;
        this._head = null;
        this._tail = null;
    }

    /**
     * @param {number} index
     * @return { LinkedListNode | null }
     */
    get(index) {
        if (index < 0 || index > this.length) {
            throw new RangeError(
                `index requested: ${index}. List length: ${this.length}`
            );
        }

        let current;

        if (index > this.length / 2) {
            current = this._tail;
            let i = this.length - 1;

            while (current && i > index) {
                current = current._previous;
                i--;
            }
        } else {
            current = this._head;
            let i = 0;

            while (current && i < index) {
                current = current._next;
                i++;
            }
        }

        return current ? current.data : null;
    }

    /**
     * @returns { LinkedListNode | null }
     */
    getHead() {
        return this._head ? this._head.data : null;
    }

    /**
     * @returns { LinkedListNode | null }
     */
    getTail() {
        return this._tail ? this._tail.data : null;
    }

    /**
     * @param { typeof head | typeof tail } position
     * @param {*} value
     * @returns { void }
     */
    [normalize](position, value) {
        this.length += value;

        if (this.length <= 1) {
            switch (position) {
                case head:
                    this._tail = this._head;
                case tail:
                    this._head = this._tail;
            }
        }
    }

    /**
     * The default iterator for the class.
     * @returns {Iterator<LinkedListNode>} An iterator for the class.
     */
    [Symbol.iterator]() {
        return this.values();
    }

    /**
     * Create an iterator that returns each node in the list.
     * @returns {Iterator<LinkedListNode>} An iterator on the list.
     */
    *values() {
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the head and is overwritten inside
         * of the loop below.
         */
        let current = this._head;

        /*
         * As long as `current` is not `null`, there is a piece of data
         * to yield.
         */
        while (current) {
            yield current.data;
            current = current._next;
        }
    }

    /**
     * Create an iterator that returns each node in the list in reverse order.
     * @returns {Iterator<LinkedListNode>} An iterator on the list.
     */
    *reverse() {
        /*
         * The `current` variable is used to iterate over the list nodes.
         * It starts out pointing to the tail and is overwritten inside
         * of the loop below.
         */
        let current = this._tail;

        /*
         * As long as `current` is not `null`, there is a piece of data
         * to yield.
         */
        while (current) {
            yield current.data;
            current = current._previous;
        }
    }

    /**
     * Converts the list into a string representation.
     * @returns {String} A string representation of the list.
     */
    toString() {
        return [...this].toString();
    }
}

module.exports = { LinkedList };
