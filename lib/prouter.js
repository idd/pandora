/**
 * 路由
 * @namespace svr
 * @class router
 * @type {[type]}
 */
var panutil = require('pan-utils'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    pconfig = require('./pconfig'),
    _regexPathParam =   /([:*])([\w\-]+)?/g,
    router_cfg = pconfig.get('router_config');

var router = function(){
    var self = this;
    panutil.util.each(router_cfg.pages, function(r,v) {
        var keys = [];
        //TODO 处理静态等其他。。。。。。
        self.map.push({
            handle  : r.handle,
            method:r.method,
            needlogin:r.needlogin,
            keys    : keys,     //prodcutid
            path    : v,        //product/:productid
            regex   : self.getRegex(v, keys)
        });
    });
}
function getParam(url, route) {
    var ks = route.keys,
        m = url.match(route.regex),
        params = {};

    panutil.util.each(m.slice(1),function(v, i) {
        params[ks[i]] = v;
    });
    return params;
}
panutil.util.extend(router,{
    /**
     * 已配置的映射列表
     * @prorotype @map
     * @type {Array}
     */
    map:[],
    /**
     * 获取
     * @method getMatchs
     * @param  {[type]} str_url [description]
     * @return {[type]}         [description]
     */
    getMatchs:function(str_url) {
        var r = panutil.util.arr_filter(this.map, function (route) {
            return str_url.search(route.regex) > -1;
        });
        if(r.length == 0){
            r = url.parse(str_url)
            var page_name = r.pathname,
                page_path = path.join(require('./siteroot'),'pages', page_name.replace(/([^\/]+)\/?$/,function (a, b) {
                    return b+'/'+b;
                }));
            if(fs.existsSync(page_path+'.js')){
                return [{
                            handle:page_name
                        }];
            }else{
                if(fs.existsSync(path.join(require('./siteroot'),'pages', page_name)+'.js')){
                return [{
                            handle:page_name
                        }];
            }
                return [{
                    handle:'error/404'
                }];
            }
            return [];
        }
        r[0].params = getParam(str_url, r[0]);
        return r;
    },
    getRegex: function (path, keys) {
        var s =path;
        if (path instanceof RegExp) {
            return path;
        }
        // Special case for catchall paths.
        if (path === '*') {
            return (/.*/i);
        }
        path = path.replace(_regexPathParam, function (match, operator, key) {
            // Only `*` operators are supported for key-less matches to allowing
            // in-path wildcards like: '/foo/*'.
            if (!key) {
                return operator === '*' ? '.*' : match;
            }

            keys.push(key);
            return operator === '*' ? '(.*?)' : '([^/#?]*)';
        });           
        return new RegExp('^' + path + '(\\?.*?)?$','i');

    }
});

module.exports = router;