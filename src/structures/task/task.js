const { EventEmitter } = require('../event-emitter/event-emitter');

const TaskStatus = {
    waiting: 'waiting',
    running: 'running',
    finished: 'finished',
    error: 'error'
};

const TaskEvents = {
    start: 'start-task',
    success: 'success-task',
    fail: 'fail-task',
    message: 'message'
};

class Task extends EventEmitter {
    /**
     * @param { object } options
     * @param { number } options.id
     * @param { String } options.type
     * @param { * } [options.data]
     */
    constructor(options) {
        super();

        if (!options || !options.type) {
            throw new Error(`options invalid ${options.toString()}`);
        }

        this.id = options.id;
        this.type = options.type;
        this.data = options.data;

        this._status = TaskStatus.waiting;
    }

    /** @return { string } */
    get status() {
        return this._status;
    }

    /** @return { boolean }*/
    isRunning() {
        return this._status === TaskStatus.running;
    }

    /** @return { boolean }*/
    isIdol() {
        return this._status === TaskStatus.waiting;
    }

    /** @return { boolean }*/
    isSuccess() {
        return this._status === TaskStatus.finished;
    }

    /** @return { boolean }*/
    isFailed() {
        return this._status === TaskStatus.error;
    }

    /** @return { void }*/
    start() {
        this._status = TaskStatus.running;
        this.emit(TaskEvents.start, this);
    }

    /**
     * @param { Error | null } [err]
     * @param { * } [data]
     * @return { void }
     */
    end(err, data) {
        const task = this;
        this._status = err ? TaskStatus.error : TaskStatus.finished;

        if (err) {
            this.emit(TaskEvents.fail, task, err, null);
        } else {
            this.emit(TaskEvents.success, task, null, data);
        }
    }
}

module.exports = {
    Task,
    TaskStatus,
    TaskEvents
};
