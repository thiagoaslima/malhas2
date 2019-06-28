/// <references path="../mapshaper.d.ts">
/**
 * useful links
 *
 * MAPSHAPER
 * https://www.npmjs.com/package/mapshaper
 * https://github.com/mbloch/mapshaper/wiki/Using-mapshaper-programmatically
 */

const { parentPort, workerData, isMainThread } = require('worker_threads');
const util = require('util');
const mapshaper = require('mapshaper');
const fs = require('fs');
const path = require('path');
const { getLocal } = require('../locais/locais-by-id');

const runMapShaper = util.promisify(mapshaper.runCommands);

if (!isMainThread && parentPort) {
    (async () => {
        await run(workerData);
        parentPort.postMessage(workerData.scenario);
    })();
}

async function run(data) {
    const { id, scenario, appConfig } = data;

    await createMatrizes(appConfig, scenario);

    console.log(`[${id}] matriz pronta.`);
}

function createFolders(path) {
    try {
        fs.mkdirSync(path, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
}

async function createMatrizes(appConfig, scenario) {
    const originalPath = path.resolve(appConfig.ORIGINAIS_DIR, scenario.ano);

    const matrizPath = path.resolve(
        appConfig.MATRIZES_DIR,
        scenario.ano,
        scenario.territorio,
        scenario.divisao
    );

    createFolders(matrizPath);

    appConfig.SIMPLIFICATIONS.forEach(async (simplificationValue, idx) => {
        const matrizFilename = path.join(matrizPath, `br-${idx + 1}.json`);
        await mapShaper(originalPath, matrizFilename, simplificationValue);
        await updateFeatures(matrizFilename, scenario);
    });

    return {
        matrixFilename,
        appConfig,
        scenario
    };
}

async function mapShaper(originalPath, matrizFilename, simplificationValue) {
    return runMapShaper(`
        -i snap ${originalPath}/*.shp 
        -verbose
        -clean
        -each "
            codigo=CD_GEOCMU, 
            nome=NM_MUNICIP,
            centroidX=this.centroidX, 
            centroidY=this.centroidY, 
            innerPositionX=this.innerX, 
            innerPositionY=this.innerY,
            bounds=this.bounds,
            delete CD_GEOCMU, 
            delete NM_MUNICIP
        " 
        -simplify ${simplificationValue}% keep-shapes
        -o ${matrizFilename} presimplify precision=${Math.pow(
        10,
        -4
    )} format=geojson
    `);
}

async function updateFeatures(matrizFilename, scenario) {
    const content = JSON.parse(
        fs.readFileSync(matrizFilename, { encoding: 'utf8' })
    );
    const geojson = { type: content.type, features: [] };

    content.features.forEach(obj => {
        const codigo = obj.properties.codigo;
        const props = getLocal(codigo);

        const bounds = obj.properties.bounds.map(val => val.toFixed(4));
        const centroidX = parseFloat(obj.properties.centroidX.toFixed(4));
        const centroidY = parseFloat(obj.properties.centroidY.toFixed(4));
        const innerPositionX = parseFloat(
            obj.properties.innerPositionX.toFixed(4)
        );
        const innerPositionY = parseFloat(
            obj.properties.innerPositionY.toFixed(4)
        );

        try {
            obj.properties = {
                ...props,
                id:
                    scenario.territorio == 'pais'
                        ? 0
                        : props[scenario.territorio].id,
                sub:
                    scenario.divisao == 'pais' ? 0 : props[scenario.divisao].id,
                originalId: props.municipio.id,
                bounds,
                centroide: { x: centroidX, y: centroidY },
                inner: { x: innerPositionX, y: innerPositionY }
            };
        } catch (err) {
            if (!['4300001', '4300002'].includes(codigo)) {
                console.log(codigo, err);
            }
        }

        geojson.features.push(Object.assign({}, obj));
    });

    fs.writeFileSync(matrizFilename, JSON.stringify(geojson, null, 2), 'utf8');
}
