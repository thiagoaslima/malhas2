const { Worker } = require('worker_threads');
const { Task, TaskEvents } = require('../task/task');
const { EventEmitter } = require('../event-emitter/event-emitter');

/* Enums */
const RunnerEvents = {
    message: 'message',
    start: 'start',
    running: 'running',
    end: 'end'
};

const RunnerState = {
    off: 'off',
    idol: 'idol',
    running: 'running'
};

let id = 0;

class Runner extends EventEmitter {
    /**
     * @param { string } filename
     * @param { * } [workerData = null]
     */
    constructor(filename, workerData) {
        super();
        this.id = id++;
        this.filename = filename;
        this.workerData = workerData;

        // TODO: Convert to private
        /** @type { Worker | null } worker */
        this.worker = null;
        /** @type {*} */
        this.timeout;

        /** @type { Map.<string, Set<Function>> } */
        this._listeners = new Map();
        this._state = RunnerState.off;
    }

    get state() {
        return this._state;
    }

    /** @return { Worker } */
    spawnWorker() {
        const worker = new Worker(this.filename, {
            // @ts-ignore
            // workerData <any> Any JavaScript value that will be cloned and made available as require('worker_threads').workerData.
            // The cloning will occur as described in the HTML structured clone algorithm, and an error will be thrown if the object cannot be cloned (e.g. because it contains functions).
            workerData: this.workerData
        });

        return worker;
    }

    /** @param { Task } task */
    run(task) {
        if (this._state === RunnerState.off) {
            const worker = this.spawnWorker();

            worker.once('online', () => {
                this._run(task);
            });

            this.worker = worker;
        } else {
            this._run(task);
        }
    }

    /** @param { Task } task */
    _run(task) {
        if (this.worker) {
            const { worker } = this;

            task.start();
            this.setState(RunnerState.running);
            this.emit(RunnerEvents.running, task);

            worker.on(
                'message',
                /**
                 * @param { [string, Task, string|null, any] } args
                 */
                args => {
                    let [event, _task, errMessage, data] = args;

                    const err =
                        errMessage === null
                            ? null
                            : new Error(errMessage || '');

                    if (!data) {
                        data = null;
                    }

                    switch (event) {
                        case TaskEvents.message:
                            this.emit(RunnerEvents.message, task, err, data);
                            break;

                        case TaskEvents.success:
                        case TaskEvents.fail:
                            this._stop(task, err, data);
                    }
                }
            );

            const stop = this._stop.bind(this, task);

            worker.on(
                'error',
                /** @param { Error } err */
                err => stop(err)
            );

            worker.on('exit', value => {
                if (value === 0) {
                    // If value != 0, error event will be emitted.
                    stop();
                }
            });

            worker.postMessage(task);
        }
    }

    /**
     * @param { Task } task
     * @param { Error | null } [err=null]
     * @param { * } [data=null]
     */
    _stop(task, err = null, data = null) {
        if (task.isRunning()) {
            task.end(err, data);
        }

        this.emit(RunnerEvents.end, task, err, data);
        this.setState(RunnerState.idol);
    }

    /** @param { string } state */
    setState(state) {
        this._state = state;

        switch (state) {
            case RunnerState.idol:
                this.worker && this.worker.removeAllListeners();
                this.timeout = setTimeout(
                    () => this.setState(RunnerState.off),
                    5000
                );
                break;

            case RunnerState.running:
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                break;

            case RunnerState.off:
                if (this.worker) {
                    this.worker.terminate(() => {
                        this.worker = null;
                    });
                }
                break;
        }
    }
}

module.exports = {
    Runner,
    RunnerEvents,
    RunnerState
};
