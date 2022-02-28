const {BigNumber} = require('bignumber.js')
exports.scale = function (input, decimalPlaces) {
    const scalePow = new BigNumber(decimalPlaces.toString())
    const scaleMul = new BigNumber(10).pow(scalePow)
    return input.times(scaleMul)
}