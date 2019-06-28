const run = regioes => {
    let simplificationIdx = 0;
    let regiaoIdx = 0;
    const regioes = Array.from(subFilter);

    processGeoJson(simplificationIdx, regiaoIdx);
};

function processGeoJson(simplificationIdx, regiaoIdx) {
    const regiao = regioes[regiaoIdx];
    const dest = getTopojsonFilename(regiao, simplificationIdx);
    const temp = `${filterBy}/${dissolveBy}/temp-${regiao}-${simplificationIdx +
        1}.json`;
    const matriz = getMatrizFilename(simplificationIdx);

    return runMapShaper(`
            -i snap ${matriz} 
            -verbose
            -clean
            -filter "id == '${regiao}'"
            -dissolve sub copy-fields=sub,id,centroide,inner 
            -o ${temp} format=geojson
        `)
        .then(() => readFile(temp, 'utf-8'))
        .then(contents => {
            const json = JSON.parse(contents);
            const update = { type: json.type, features: [] };

            json.features.forEach(obj => {
                const codigo = obj.properties.sub;
                const props = locais[codigo];

                const centroide = obj.properties.centroide;
                const inner = obj.properties.inner;

                try {
                    obj.properties = {
                        tipo: dissolveBy,
                        ...props,
                        id: props[dissolveBy].id,
                        nome: props[dissolveBy].nome,
                        // bounds,
                        centroide,
                        inner
                    };
                } catch (err) {
                    // console.log(props.municipio.id, err);
                }

                update.features.push(Object.assign({}, obj));
            });

            return update;
        })
        .then(contents => writeFile(temp, JSON.stringify(contents), 'utf-8'))
        .then(() =>
            runMapShaper(`
                -i snap ${temp} 
                -verbose
                -clean
                -each "
                    bounds=this.bounds
                " 
                -o ${dest} format=geojson
            `)
        )
        .then(promises => {
            console.log(`SAVED ${dest}`);
        })
        .then(() => {
            simplificationIdx++;

            if (simplificationIdx >= simplifications.length) {
                simplificationIdx = 0;
                regiaoIdx++;
            }

            if (regiaoIdx >= regioes.length) {
                console.log('ók');
            } else {
                return process(simplificationIdx, regiaoIdx);
            }
        });
}
