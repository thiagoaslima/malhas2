const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const dotenv = require('dotenv');
const app = require('./app');

/** @type { dotenv.DotenvConfigOutput } */
const { parsed: parsedEnv } = dotenv.config({
    path: path.resolve(__dirname, '..', '.env')
});

const folder = {
    original: parsedEnv ? parsedEnv.originais_dir : '',
    matriz: parsedEnv ? parsedEnv.matrizes_dir : '';
    topojson: parsedEnv ? parsedEnv.topojson_dir : '';
    svg: parsedEnv ? parsedEnv.svg_dir : '';
    temp: parsedEnv ? parsedEnv.temp_dir : ''
}

const anos = fs
    .readdirSync(path.resolve(folder.original))
    .filter(dir => dir.charAt(0) !== '.');

if (anos.length === 0) {
    throw new Error('Não há arquivos de base para conversão');
}

/** @type { String[] } */
const simplifications = parsedEnv
    ? parsedEnv.simplifications.split(',').map(str => str.trim())
    : [];

inquirer
    .prompt([
        {
            type: 'checkbox',
            name: 'anos',
            message: 'Selecione o ano desejado?',
            choices: anos,
            default: anos.slice(0, 1)
        },
        {
            type: 'checkbox',
            name: 'territorios',
            message: 'Escolha o nível territorial',
            choices: [
                'pais',
                'regiao',
                'uf',
                'mesorregiao',
                'microrregiao',
                'municipio'
            ],
            default: ['pais']
        },
        {
            type: 'checkbox',
            name: 'divisoes',
            message:
                'Escolha a subdivisão desejada ("escolha a mesma opção do nível territorial caso deseje apenas o desenho da fronteira")',
            choices: [
                'pais',
                'regiao',
                'uf',
                'mesorregiao',
                'microrregiao',
                'municipio'
            ],
            default: ['pais']
        },
        {
            type: 'checkbox',
            name: 'formatos',
            message: 'Formato de saída desejado:',
            choices: ['geojson', 'topojson', 'svg'],
            default: ['geojson']
        }
    ])
    .then(config => {
        app(
            { folder, simplifications, ...config }
        );
    });
