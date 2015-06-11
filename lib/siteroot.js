var path = require('path'),
    fs = require('fs');
/**
 * 
 */

function getSiteDir(p){
    if(!p){
        return null;
    }
    if(fs.existsSync(path.join(p, 'pages')) && fs.existsSync(path.join(p, 'tpls'))){
        return p;
    }
    return getSiteDir(path.dirname(p));
}
console.log('hello',getSiteDir(__dirname));
module.exports = getSiteDir(__dirname);