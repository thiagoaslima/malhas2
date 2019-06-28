const path = require('path');
const { Runner, RunnerEvents, RunnerState } = require('./runner');
const { Task, TaskEvents } = require('../task/task');

describe('Runner', () => {
    const filename = path.join(__dirname, 'runner-worker-test.js');

    test('create runner', () => {
        const runner = new Runner(filename);
        expect(runner.id).toBe(0);
        expect(runner.filename).toBe(filename);
    });

    test('initial state', () => {
        const runner = new Runner(filename);
        expect(runner._state).toBe(RunnerState.off);
    });

    test('create worker on run task', () => {
        const runner = new Runner(filename);
        runner.spawnWorker = jest.fn().mockReturnValueOnce({
            on: jest.fn(),
            once: jest.fn()
        });
        const task = new Task({ id: 9, type: 'test', data: 1 });
        runner.run(task);

        expect(runner.spawnWorker).toHaveBeenCalledTimes(1);
    });

    test('set running state on run task', () => {
        const runner = new Runner(filename);

        runner.spawnWorker = jest.fn().mockReturnValueOnce(
            (() => {
                const worker = {
                    fn: null,
                    on: jest.fn(),
                    /**
                     * @param { string } _type
                     * @param { Function } cb
                     */
                    once: (_type, cb) => {
                        // @ts-ignore
                        worker.fn = cb;
                    },
                    postMessage: jest.fn()
                };

                return worker;
            })()
        );

        const task = new Task({ id: 9, type: 'test', data: 1 });
        runner.run(task);
        // @ts-ignore
        // force callback to run
        runner.worker.fn();

        expect(runner._state).toBe(RunnerState.running);
    });

    test('run task', done => {
        const runner = new Runner(filename);
        const task = new Task({ id: 9, type: 'test', data: 5 });

        runner.on(
            RunnerEvents.message,
            /** @param {any} message */
            message => {
                expect(message).toEqual(task);
                // @ts-ignore
                runner.worker.terminate();
                done();
            }
        );

        runner.run(task);
    });

    test('task end', done => {
        const runner = new Runner(filename);
        const task = new Task({
            id: 9,
            type: 'test',
            data: { response: 'success' }
        });
        runner.on(
            RunnerEvents.end,
            /**
             * @param { Task } _task
             * @param { Error } _err
             * @param { * } data
             */
            (_task, _err, data) => {
                expect(_task).toEqual(task);
                expect(data).toBe('success');
                // @ts-ignore
                runner.worker.terminate();
                done();
            }
        );

        runner.run(task);
    });

    test('task error', done => {
        const runner = new Runner(filename);
        const task = new Task({
            id: 9,
            type: 'test',
            data: { response: 'error' }
        });
        runner.on(
            RunnerEvents.end,
            /**
             * @param { Task } _task
             * @param { Error } _err
             * @param { * } data
             */
            (_task, _err, data) => {
                expect(_task).toEqual(task);
                expect(_err).toEqual(new Error());
                // @ts-ignore
                runner.worker.terminate();
                done();
            }
        );

        runner.run(task);
    });
});
