module.exports = function() {
    var pan = require('pandorajs'),
        _auth = '',//pan.core.loadModel('auth'),
        authlist = pan.config.get('filter_config');
    var _auths = [];
    return {

        init: function() {
            //模型初始化
            this.read();
            return this;
        },
        /**
         * 权限过滤方法
         * @method filter
         * @param  {Object} request
         * @param  {Object} response
         * @return {null} 无
         */
        filter: function(request, response, callback) {
            /*
            var _reg, _flag = false;
            for (var i in authlist) {
                if (request.url.substr(0, i.length) == i) {
                    _flag = true;
                    break;
                }
            }!_flag && _auths.forEach(function(o) {
                if (request.url.substr(0, o.path.length) == o.path) _flag = true;
            });*/
            // if (_flag) {
            callback.call(this, _auths);
            // TODO  权限过滤
            // }
            // } else {
            //     response.write("no auth");
            //     response.end();
            // }
        },
        /**
         * 权限读取
         * @method filter
         * @param  {Object} request
         * @param  {Object} response
         * @return {null} 无
         */
        read: function() {
            // _auth.find({}, {}, {}, function(flag, user) {
            //     if (flag) {
            //         if (user.length > 0) {
            //             _auths.push(user);
            //         }
            //     }
            // });
        }
    }
}().init();