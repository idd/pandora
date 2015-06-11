var pan = {
    server: require('./svr'),
    config: require('./pconfig'),
    root : require('./siteroot'),
    core: require('./pcore')
},
    page = require('./ppage'),
    status_code = require('./status_code');


var static_method = {
    getModel: function() {},
    getService: function() {},
    /**
     * 创建页面
     * @method page
     * @static
     * @param  {Object} protos 页面属性
     * @return {pandorajs.page}
     */
    page: function(protos) {
        return page.create(protos);
    },
    /**
     * 状态编码
     * @prorotype
     * @static
     * @type {Object}
     */
    status_code: status_code
}
require('pan-utils').util.mix(pan, static_method);

module.exports = pan;