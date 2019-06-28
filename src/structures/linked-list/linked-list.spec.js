const { LinkedList } = require('./linked-list');

describe('linked list', () => {
    /** @type { LinkedList } */
    let list;

    beforeEach(() => {
        list = new LinkedList();
    });

    describe('empty list', () => {
        test('starts with length 0', () => {
            expect(list.length).toBe(0);
        });

        test('return null on head', () => {
            expect(list.getHead()).toBeNull();
        });

        test('return null on tail', () => {
            expect(list.getTail()).toBeNull();
        });
    });

    describe('length behaviour', () => {
        test('increases on #add*', () => {
            list.addToHead(1);
            expect(list.length).toBe(1);
            list.addToTail(1);
            expect(list.length).toBe(2);
        });

        test('decreases on #remove*', () => {
            list.addToHead(1);
            expect(list.length).toBe(1);
            list.addToHead(1);
            expect(list.length).toBe(2);
            list.removeFromHead();
            expect(list.length).toBe(1);
            list.removeFromTail();
            expect(list.length).toBe(0);
        });
    });

    describe('add to head', () => {
        test('insert element into list', () => {
            const one = 1;
            const two = 2;
            list.addToHead(one);
            list.addToHead(two);
            expect(list.getHead()).toBe(two);
            expect(list.length).toBe(2);
        });

        test('set the first insertion as head and tail', () => {
            const one = 1;
            list.addToHead(one);
            expect(list.getHead()).toBe(list.getTail());
            expect(list.length).toBe(1);
        });
    });

    describe('add to tail', () => {
        test('insert element into list', () => {
            const one = 1;
            const two = 2;
            list.addToTail(one);
            list.addToTail(two);
            expect(list.getTail()).toBe(two);
            expect(list.length).toBe(2);
        });

        test('set the first insertion as head and tail', () => {
            const one = 1;
            list.addToHead(one);
            expect(list.getHead()).toBe(list.getTail());
            expect(list.length).toBe(1);
        });
    });

    describe('reset', () => {
        test('makes list empty again', () => {
            list.addToHead(1);
            list.addToHead(1);
            list.addToHead(1);
            list.reset();

            expect(list.length).toBe(0);
            expect(list.getHead()).toBeNull();
            expect(list.getTail()).toBeNull();
        });
    });

    describe('toString', () => {
        test('prints the list', () => {
            list.addToHead(2);
            list.addToHead(1);
            list.addToTail(3);
            list.addToTail(4);
            list.addToHead(0);

            expect(list.toString()).toBe('0,1,2,3,4');
        });
    });
});
