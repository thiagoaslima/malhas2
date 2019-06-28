// https://downloads.ibge.gov.br/downloads_geociencias.htm
//     organizacao_do_territorio
//        malhas_territoriais
//            municipio_2018

const path = require('path');
const { flatten } = require('./helpers');
const { Broker } = require('./structures/broker/broker');
const { runnerFactory } = require('./structures/runner/runner-factory');

/**
 * @typedef { {ano: string, territorio: string, divisao: string} } Scenario
 */

/**
 * @param { object } config
 * @param { { original: string; matriz: string; topojson: string; svg: string; temp: string} } config.folder
 * @param { string[] } config.simplifications
 * @param { string[] } config.anos
 * @param { string[] } config.territorios
 * @param { string[] } config.divisoes
 * @param { string[] } config.formatos
 */
const app = config => {
    const {
        folder,
        simplifications,
        anos,
        territorios,
        divisoes,
        formatos
    } = config;

    const _scenarios = anos.map(ano =>
        territorios.map(territorio =>
            divisoes.map(divisao => ({
                ano,
                territorio,
                divisao
            }))
        )
    );
    const scenarios = flatten(_scenarios).filter(
        /**
         * @param { Scenario } obj
         */
        obj => verifyDivision(obj.territorio, obj.divisao)
    );

    const taskTypes = {
        createMatrix: 'create-matrix',
        createFormat: 'create-format'
    };

    const runners = [
        {
            type: taskTypes.createMatrix,
            filename: path.join(__dirname, 'workers', 'matriz.js')
        }
    ];

    const broker = new Broker({ maxTasks: 5 });

    runners.forEach(obj => {
        broker.registerFactory(
            obj.type,
            runnerFactory(obj.filename, { folder, simplifications })
        );
    });

    const createFormatTask =
        /** @param { Scenario } scenario */
        scenario => {
            return () => {};
            // formatos.forEach(formato => {
            //     broker.registerTask({
            //         type: taskTypes.createFormat,
            //         data: { scenario, formato }
            //     });
            // });
        };

    scenarios.forEach(
        /** @param { Scenario } scenario */
        scenario => {
            broker.registerTask({
                type: taskTypes.createMatrix,
                data: scenario,
                success: createFormatTask(scenario)
            });
        }
    );
};

// const createMatrixWorker = (() => {
//     let __id = 0;
//     const getId = () => `matrix-worker-${__id++}`;

//     return (appConfig, scenario, callback) => {
//         const workerId = getId();
//         const cb = callback
//             ? callback
//             : message => console.log(`${workerId}:`, message);
//         const err = err => {
//             throw err;
//         };

//         const worker = new Worker(
//             path.join(__dirname, 'workers', 'matriz-worker.js'),
//             {
//                 workerData: {
//                     id: workerId,
//                     appConfig,
//                     scenario
//                 }
//             }
//         );
//         worker.on('error', err);
//         worker.on('message', cb);
//         worker.on('exit', () => {
//             worker.removeListener('error', err);
//             worker.removeListener('message', cb);
//         });

//         return worker;
//     };
// })();

const verifyDivision = /**
 * @param {string} territorio
 * @param {string} divisao
 */ (territorio, divisao) => {
    /**  @type { {[key: string]: number }} */
    const convert = {
        pais: 1,
        regiao: 2,
        uf: 3,
        mesorregiao: 4,
        microrregiao: 5,
        municipio: 6
    };

    return convert[territorio] <= convert[divisao];
};

module.exports = app;
