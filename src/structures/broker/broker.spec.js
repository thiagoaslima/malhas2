const path = require('path');
const { Broker } = require('./broker');
const { Task } = require('../task/task');
const { Queue } = require('../queue/queue');

describe('Broker', () => {
    const workerFile = path.join(__dirname, 'runner', 'runner-worker-test.js');
    const taskType = 'test';

    test('init', () => {
        const broker = new Broker({ maxTasks: 2 });
        expect(broker).toBeDefined();
    });

    test('register runner factory', () => {
        const factory = jest.fn();
        const broker = new Broker({ maxTasks: 2 });
        broker.registerFactory('test', factory);

        expect(broker.factories).toEqual([['test', factory]]);
    });

    test('deregister runner factory', () => {
        const factory = jest.fn();
        const broker = new Broker({ maxTasks: 2 });
        broker.registerFactory('test', factory);
        broker.registerFactory('test1', factory);
        broker.deregisterFactory('test1');
        expect(broker.factories).toEqual([['test', factory]]);
    });
});
