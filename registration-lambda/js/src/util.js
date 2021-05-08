const util = require('util')

exports.log = (obj) => console.log(util.inspect(obj, { showHidden: false, depth: null }));