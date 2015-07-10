var path = require('path'),
    fs = require('fs');
/**
 * 
 */

function getSiteDir(p){
    if(!p || path.dirname(p)== p){
        return null;
    }
    if(fs.existsSync(path.join(p, 'pages')) && fs.existsSync(path.join(p, 'tpls'))){
        return p;
    }
    global.$siteRoot = getSiteDir(path.dirname(p));
    return global.$siteRoot;
}
module.exports = global.$siteRoot || getSiteDir(__dirname);