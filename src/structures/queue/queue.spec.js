const { Queue } = require('./queue.js');

describe('Queue', () => {
    /** @type { Queue } */
    let queue;

    beforeEach(() => {
        queue = new Queue();
    });

    describe('empty queue', () => {
        test('starts with length zero', () => {
            expect(queue.length).toBe(0);
        });

        test('returns null on first', () => {
            expect(queue.first()).toBeNull();
        });

        test('returns null on last', () => {
            expect(queue.last()).toBeNull();
        });
    });
});
