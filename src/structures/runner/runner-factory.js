const { Runner } = require('./runner');

/**
 * @param { string } filename
 * @param { * } [workerData = null]
 */
const runnerFactory = (filename, workerData) => () =>
    new Runner(filename, workerData);

module.exports = { runnerFactory };
