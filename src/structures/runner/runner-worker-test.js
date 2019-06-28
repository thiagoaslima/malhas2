const { parentPort, isMainThread } = require('worker_threads');
const { Task } = require('../task/task');
const { WorkerEmitter } = require('../worker-emitter/worker-emitter');

if (!isMainThread && parentPort) {
    parentPort.on(
        'message',
        /**
         * @param { Task } task
         */
        task => {
            const emitter = new WorkerEmitter(parentPort, task);
            run(emitter);
        }
    );
}

/**
 * @param { WorkerEmitter } emitter
 */
function run(emitter) {
    const { data } = emitter.task;

    if (data.response === 'success') {
        emitter.success('success');
    } else if (data.response === 'error') {
        emitter.error(new Error());
    } else if (data.response === 'throw') {
        throw new Error();
    } else {
        emitter.message('hi');
    }
}
