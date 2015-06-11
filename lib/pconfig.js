/**
 * 提供配置相关操作
 * @namespace mo
 * @class config
 */
var mo = require('pan-utils'),
    fs = require('fs');
module.exports = {
    /**
     * @method get
     * @param  {String} cfg_path 配置文件（相对 站点根目录/config 的）路径
     * @return {Object}
     */
    get: function(cfg_path) {
        var cfg = {
            port: 3000
        };
        if (fs.existsSync(cfg_path)) {
            console.error('pconfig.get', cfg_path + 'is not exists!')
                // return
        } else {
            cfg = require(require('path').join(require('./siteroot') ,'config', cfg_path));
            cfg.port = cfg.port || 3000;
        }
        return cfg;
    }
}