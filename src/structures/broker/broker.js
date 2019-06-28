const { Task } = require('../task/task');
const { Runner, RunnerState, RunnerEvents } = require('../runner/runner');
const { EventEmitter } = require('../event-emitter/event-emitter');
const { Queue } = require('../queue/queue');

/**
 * @typedef { () => Runner } Factory
 */

/** Simulate private */
const run = Symbol('run');
const enqueue = Symbol('enqueue');
const dequeue = Symbol('dequeue');

const noop = () => {};

const generateId = (() => {
    let id = 0;
    return () => {
        return id++;
    };
})();

class Broker extends EventEmitter {
    /**
     * @param { Function } [genFn]
     * @param { object } [options]
     * @param { number } [options.maxTasks = 6]
     */
    constructor(options, genFn) {
        super();
        this._genId = genFn ? genFn : generateId;
        this.maxTasks = (options && options.maxTasks) || 10;

        // TODO: Simulate private
        /** @type { Queue } */
        this._queue = new Queue();

        /** @type { Map<String, Factory> } */
        this._factories = new Map();

        /** @type { Map<String, Set<Runner>> } */
        this._runners = new Map();

        /** @type { Set<Task> } */
        this._runningTasks = new Set();

        /** @type { Set<Task> } */
        this._failedTasks = new Set();

        /** @type { Map<Task, { success: Function, error: Function }>} */
        this._callbacks = new Map();

        this[run]();
    }

    get factories() {
        return Array.from(this._factories.entries());
    }

    get tasks() {
        return this._queue._list;
    }

    /**
     * @param { object } data
     * @param { String } data.type
     * @param { * } data.data
     * @param { Function } [data.success]
     * @param { Function } [data.error]
     */
    registerTask(data) {
        let { success, error } = data;
        if (!success) success = noop;
        if (!error) error = noop;

        const newTask = new Task({ id: this._genId(), ...data });
        this[enqueue](newTask);
        this._callbacks.set(newTask, {
            success,
            error
        });
    }

    /**
     * @param { string } type
     * @param { Factory } factory
     */
    registerFactory(type, factory) {
        if (!this._factories.has(type)) {
            this._factories.set(type, factory);
        }
    }

    /**
     * @param { string } type
     */
    deregisterFactory(type) {
        if (this._factories.has(type)) {
            this._factories.delete(type);
        }
    }

    /**
     * @param { Task } task
     * @returns { void }
     */
    [enqueue](task) {
        this._queue.add(task);
    }

    /**
     * @returns { Task }
     */
    [dequeue]() {
        return this._queue.remove();
    }

    [run]() {
        requestAnimationFrame(() => {
            // checkRunningTasks
            while (this._runningTasks.size < this.maxTasks) {
                const task = this[dequeue]();
                const runner = this.getRunner(task);

                this.runTask(runner, task);
            }
        });
    }

    /**
     * @param { Task } task
     * @returns { Runner }
     */
    getRunner(task) {
        let runners = this._runners.get(task.type);
        /** @type { Runner | undefined } runner */
        let runner;

        if (runners) {
            for (let r of runners.values()) {
                if (r.state !== RunnerState.running) {
                    runner = r;
                    break;
                }
            }
        }

        return runner ? runner : this.createRunner(task.type);
    }

    /**
     * @param { string } type
     * @return { Factory }
     */
    getFactory(type) {
        if (!this._factories.has(type)) {
            throw new Error(`No factory registered for task ${type} type`);
        }
        // @ts-ignore
        return this._factories.get(type);
    }

    /**
     * @param { string } type
     * @returns { Runner }
     */
    createRunner(type) {
        const factory = this.getFactory(type);
        const runner = factory();

        if (!this._runners.has(type)) {
            this._runners.set(type, new Set([runner]));
        } else {
            const set = this._runners.get(type);
            set && set.add(runner);
        }

        return runner;
    }

    /**
     * @param { Task } task
     * @param { Runner } runner
     * */
    runTask(runner, task) {
        runner.run(task);
        this._runningTasks.add(task);

        runner.on(
            RunnerEvents.end,
            /**
             * @param { Error } err
             * @param { Task } task
             */
            (err, task) => {
                err ? this.failedTask(task) : this.endTask(task);
            }
        );
    }

    /**
     * @param { Task } task
     */
    endTask(task) {
        this._runningTasks.delete(task);
        const cb = this._callbacks.get(task);
        cb && cb.success();
        this._callbacks.delete(task);
    }

    /**
     * @param { Task } task
     */
    failedTask(task) {
        this._runningTasks.delete(task);
        this._failedTasks.add(task);
        this._callbacks.delete(task);
    }
}

module.exports = { Broker };
