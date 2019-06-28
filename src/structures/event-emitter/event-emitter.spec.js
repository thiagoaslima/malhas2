const { EventEmitter } = require('./event-emitter');

describe('Event Emitter', () => {
    test('register listener with on', () => {
        const eventEmitter = new EventEmitter();
        const fn = jest.fn();
        eventEmitter.on('type', fn);
        expect(eventEmitter._listeners.get('type')).toEqual(new Set([fn]));
    });

    test('deregister listener with off', () => {
        const eventEmitter = new EventEmitter();
        const fn = jest.fn();
        eventEmitter.on('type', fn);
        eventEmitter.off('type', fn);
        expect(eventEmitter._listeners.get('type')).toEqual(new Set());
    });

    test('run functions with emit', () => {
        const eventEmitter = new EventEmitter();
        const fn = jest.fn();
        eventEmitter.on('type', fn);
        eventEmitter.emit('type', 'test');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('test');
    });

    test('remove listener', () => {
        const eventEmitter = new EventEmitter();
        const fn = jest.fn();
        eventEmitter.on('type', fn);
        eventEmitter.removeListeners('type');
        expect(eventEmitter._listeners.get('type')).toBeUndefined();
    });

    test('remove all listeners', () => {
        const eventEmitter = new EventEmitter();
        const fn = jest.fn();
        eventEmitter.on('type1', fn);
        eventEmitter.on('type2', fn);
        eventEmitter.removeAllListeners();
        expect(eventEmitter._listeners).toEqual(new Map());
    });
});
