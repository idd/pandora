var path = require('path'),
    fs = require('fs');
/**
 * 
 */

function getSiteDir(p){
    // console.log('p', p+','+path.dirname(p)); 
    if(!p || p == path.dirname(p)){
        return '';
    }
    if(fs.existsSync(path.join(p, 'pages')) && fs.existsSync(path.join(p, 'tpls'))){
        return p;
    }
    global.$siteRoot = getSiteDir(path.dirname(p));
    return global.$siteRoot;
}
module.exports = global.$siteRoot || getSiteDir(__dirname);