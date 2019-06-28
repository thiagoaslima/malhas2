const { MessagePort } = require('worker_threads');
const { Task, TaskEvents } = require('../task/task');

class WorkerEmitter {
    /**
     * @param { MessagePort } messagePort
     * @param { Task } task
     */
    constructor(messagePort, task) {
        this.send = /** @param {any} arr */ arr => messagePort.postMessage(arr);
        this.task = task;
    }

    /**
     * @param {any} [data=null]
     */
    message(data = null) {
        this.send([TaskEvents.message, this.task, null, data]);
    }

    /**
     * @param {any} [data=null]
     */
    success(data = null) {
        this.send([TaskEvents.success, this.task, null, data]);
    }

    /**
     * @param {Error | null} [err=null]
     */
    error(err = null) {
        this.send([TaskEvents.fail, this.task, err ? err.message : null, null]);
    }
}

module.exports = { WorkerEmitter };
