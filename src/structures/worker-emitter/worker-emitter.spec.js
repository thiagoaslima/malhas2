const { Task, TaskEvents } = require('../task/task');
const { WorkerEmitter } = require('./worker-emitter');

describe('WorkerEmitter', () => {
    /** @type { WorkerEmitter } */
    let emitter;

    /** @type { jest.SpyInstance } */
    let spy;

    const mock = {
        postMessage: jest.fn()
    };
    const task = new Task({
        id: 1,
        type: 'test-task',
        data: { property: 'value' }
    });

    beforeEach(() => {
        // @ts-ignore
        emitter = new WorkerEmitter(mock, task);
        spy = jest.spyOn(emitter, 'send');
    });

    afterEach(() => {
        spy.mockClear();
    });

    test('instatiate', () => {
        expect(emitter).toBeDefined();
    });

    test('message', () => {
        emitter.message('message-test');
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith([
            TaskEvents.message,
            task,
            null,
            'message-test'
        ]);
    });

    test('success', () => {
        const data = 'success-test';
        emitter.success(data);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith([
            TaskEvents.success,
            task,
            null,
            data
        ]);
    });

    test('error', () => {
        const error = new Error('error-test');
        emitter.error(error);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith([
            TaskEvents.fail,
            task,
            error.message,
            null
        ]);
    });
});
