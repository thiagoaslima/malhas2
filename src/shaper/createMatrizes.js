/**
 * useful links
 * https://www.npmjs.com/package/mapshaper
 * https://github.com/mbloch/mapshaper/wiki/Using-mapshaper-programmatically
 */

const util = require('util');
const mapshaper = require('mapshaper');
const runMapShaper = util.promisify(mapshaper.runCommands);

// code
const createMatrizes = async (simplification, simplificationId) => {
    const originalPath = getOriginalPath();
    const matrizFilename = getMatrizFilename(simplificationId);

    return runMapShaper(`
            -i snap ${originalPath}/*.shp ${originalPath}/*.dbf ${originalPath}/*.prj 
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
            -simplify ${simplification}% keep-shapes
            -o ${matrizFilename} presimplify precision=${Math.pow(
        10,
        -4
    )} format=geojson
        `)
        .then(() => readFile(matrizFilename, 'utf8'))
        .then(contents => {
            const json = JSON.parse(contents);
            const geojson = { type: json.type, features: [] };
            const regioesEscritas = new Set();

            json.features.forEach(obj => {
                const codigo = obj.properties.codigo;
                const localData = getLocal(codigo);

                const bounds = obj.properties.bounds.map(val => val.toFixed(4));
                const centroidX = parseFloat(
                    obj.properties.centroidX.toFixed(4)
                );
                const centroidY = parseFloat(
                    obj.properties.centroidY.toFixed(4)
                );
                const innerPositionX = parseFloat(
                    obj.properties.innerPositionX.toFixed(4)
                );
                const innerPositionY = parseFloat(
                    obj.properties.innerPositionY.toFixed(4)
                );

                const { filterBy, dissolveBy } = getParams();

                try {
                    obj.properties = {
                        ...localData,
                        id: filterBy == 'pais' ? 0 : localData[filterBy].id,
                        sub:
                            dissolveBy == 'pais' ? 0 : localData[dissolveBy].id,
                        originalId: localData.hasOwnProperty('municipio')
                            ? localData.municipio.id
                            : undefined,
                        bounds,
                        centroide: { x: centroidX, y: centroidY },
                        inner: { x: innerPositionX, y: innerPositionY }
                    };

                    regioesEscritas.add(
                        filterBy == 'pais' ? 0 : localData[filterBy].id
                    );
                } catch (err) {
                    // console.log(codigo, err);
                }

                geojson.features.push(Object.assign({}, obj));
            });

            return { regioesEscritas, geojson };
        })
        .then(obj =>
            writeFile(
                matrizFilename,
                JSON.stringify(obj.geojson),
                'utf-8'
            ).then(() => ({
                filename: matrizFilename,
                regioes: obj.regioesEscritas
            }))
        );
};

module.exports = { createMatrizes };
