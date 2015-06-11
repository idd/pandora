var panutil = require('pan-utils'),
    mutil = panutil.util,
    mfile = panutil.file,
    mpage = require('./ppage'),
    pconfig = require('./pconfig'),
    svr_cfg = pconfig.get('svr_config'),
    app_cfg = pconfig.get('app_config'),
    status_code = pconfig.get('status_code_config'),
    querystring = require('querystring'),
    url = require('url'),

    $auth,
    $session,
    access_log;

//开多work
//var cluster = require('cluster');
//var numCPUs = require('os').cpus().length;
require('./prequest');
require('./presponse');

/**
 * 初始化方法
 * @class svr
 */
var svr = panutil.class.create({
    /**
     * @constructs
     */
    init: function(cfg) {
        /*
        在页面中，通过request.app获取全局参数，包括用户,cookie等
        */
        this.set(cfg);
        //初始化log文件
        var logConfig = pconfig.get('log_config').dir;
        //同步创建文件
        for (var i in logConfig) {
            mfile.createFileSync(require("./siteroot") + logConfig[i]);
        }
        if (pconfig.get('log_config').access_id) {
            access_log.initWithLevel('access_log', 'info', 'info');
        }
        //结束初始化log
        var r = require('./prouter');
        this.router = new r;
        this.app = {};
    },
    _createServer: function() {
        var self = this;
        if (self.server) return;
        $auth = require('./pcore').loadService("auth");
        $session = new(require('./psession'))();

        //是否开启ip访问记录
        if (pconfig.get('log_config').access_id) {
            access_log = new panutil.log();
        }
        self.server = require('http').createServer(function(request, response) {
            var _postData = '';
            request.session = $session;
            //写入访问记录
            if (pconfig.get('log_config').access_id) {
                var id = request.$getClientIp();
                access_log.mlog(id + " " + request.url);
            }
            //权限过滤
            var defaultPostHeader = request.headers['content-type'];
            $auth.filter(request, response, function(o) {
                if (request.method == "POST") {
                    request.on('data', function(chunk) {
                        _postData += chunk;
                    }).on('end', function() {

                        if (defaultPostHeader && defaultPostHeader.indexOf('application/json') > -1) {
                            request.$params = _postData;
                        } else {
                            request.$params = querystring.parse(_postData);
                        }
                        self.requestHandler(request, response);
                    });
                } else {
                    request.$params = querystring.parse(url.parse(request.url).query);
                    self.requestHandler(request, response);
                }
            });

            //console.log('worker'+cluster.worker.id);

            //[ { handle: 'home', keys: [], path: '/', regex: /^/$/ } ]
            // response.end();
        });
    },
    /**
     * 开始监听服务
     * @method listen
     * @return {[type]} [description]
     */
    start: function() {
        var self = this;
        // TODO
        /*if (cluster.isMaster) {
            // Fork workers.
            for (var i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('listening',function(worker,address){
                console.log('listening: worker ' + worker.process.pid +', Address: '+address.address+":"+address.port);
            });

            cluster.on('exit', function(worker, code, signal) {
                console.log('worker ' + worker.process.pid + ' died');
                cluster.fork();
            });
        }else{*/
        self._createServer();
        port = this.get('port') || 3000;
        self.server.listen(port, this.get('ip'));
        console.log('*****');
        console.log('***** server is running now    ****');
        console.log('****');
        console.log('server is listening on ' + (!this.get('ip') ? 'localhost' : this.get('ip')) + ' width port ' + port);
        console.log('You can configure the port in "siteroot/app/config/svr.config".');
        console.log('****\n****');
        //}
        // 创建
        // 设置
        // 开始监控
    },
    restart: function() {
        this.server.close();
        this.start();
    },
    /**
     * 统一的请求处理
     * @method  requestHandler
     * @private
     * @param  {[type]} request  原生的request对象
     * @param  {[type]} response 原生的response对象
     */
    requestHandler: function(request, response) {
        var self = this;
        //渲染首页                
        var routers = self.router.getMatchs(request.url);
        if (routers.length > 0) {
            var page = routers[0];

            //POST和GET方法过滤
            if (page.method && (page.method.toUpperCase() != request.method)) {
                response.write("*********");
                response.end();
                return;
            }

            //Cookie与needlogin判断的登录
            if (page.needlogin && !request.$getCookie("pandora_uid")) {
                response.$redirect('/user/login');
            }
            page = mpage.get(page.handle, {
                $version: app_cfg.res_version,
                $cdn: app_cfg.res_cdn,
                request: request,
                response: response,
                params: page.params || {}
            });
            if (page.get('type') != null) {
                response.writeHead(200, {
                    'Cache-control': 'no-cache',
                    'Content-Type': svr_cfg['mime'][page.get('type')] || svr_cfg['mime']['default']
                });
            }
            page.process(request, response);
        }
        //TODO else
    }
});

function fn(cfg) {
    return new svr(cfg);
};
module.exports = fn;