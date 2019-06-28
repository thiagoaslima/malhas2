/**
 * @param {*} arr
 */
const flatten = arr =>
    arr.reduce(
        /**
         * @param {{ concat: (arg0: any) => void; }} flat
         * @param {any} toFlatten
         */
        (flat, toFlatten) =>
            flat.concat(
                Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
            ),
        []
    );

module.exports = { flatten };
