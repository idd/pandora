/**
 * 扩展SVR中的response对象
 * @namespace svr
 * @class mresponse
 */
var http = require('http'),
    panutil = require('pan-utils'),
    pconfig = require('./pconfig'),
    status_code = pconfig.get('status_code_config'),
    res = http.ServerResponse.prototype;

panutil.util.extend(res, {
    /**
     * 重定向页面
     * @method $redirect
     * @param  {String} str_url 新的页面地址
     */
    $redirect: function(str_url) {
        this.writeHead(302, {
            'Location': str_url
        });
        this.end();
    },
    /**
     * 清除cookie
     * @method $clearCookie
     * @param  {String} name cookie名称
     */
    $clearCookie: function(name) {
        this.setCookie(name, '', -999);
    },
    /**
     * 设置cookie
     * @method  $setCookie
     * @param {String} name    cookie名称
     * @param {String} value   cookie值
     * @param {Int} [expires] 过期时间
     * @param {String} [path]    路径
     * @param {String} [domain]  域名
     */
    $setCookie: function(name, value, expires, path, domain) {
        var cookieArr = [],
            cookieStr = name + '=' + value + ';';
        //cookie有效期时间
        if (expires) {
            expires = parseInt(expires);
            var today = new Date();
            var time = today.getTime() + expires * 1000;
            var new_date = new Date(time);
            var expiresDate = new_date.toGMTString(); //转换成 GMT 格式。
            cookieStr += 'expires=' + expiresDate + ';';
        }
        //目录
        if (path) {
            cookieStr += 'path=' + path + ';';
        }
        //域名
        if (domain) {
            cookieStr += 'domain=' + domain + ';';
        }
        cookieArr.push(cookieStr);
        this.writeHead(200, {
            'Set-Cookie': cookieArr
        });
    },
    /**
     * 返回异步请求
     *
     * response.$ajax({})
     * response.$ajax(10000, {})
     * response.$ajax(10000, {}, '操作成功')
     * response.$ajax(10000, {}, callback)
     * response.$ajax({}, callback)
     *
     * @method $ajax
     * @param  {Int}      code     状态码
     * @param  {Object}   data     返回的数据
     * @param  {String}   msg      描述
     * @param  {String}   [callback] jsonp时的回调函数
     */
    $ajax: function(code, data, msg, callback) {
        var args = arguments;
        if (panutil.util.isObject(code)) {
            //(data, msg, callback) {
            //(data, msg) {
            callback = args[2];
            msg = args[1];
            data = args[0];
            code = status_code.success;
        }
        msg = msg || status_code[code] || '';
        if(callback){
            this.write(callback+'(')
        }
        this.write(JSON.stringify({
            error_code: code,
            msg: msg,
            data: data||{}
        }));
        if(callback){
            this.write(')');
        }
        this.end();
    },
    /**
     * 断言表达式是否为True，为False时跳转到错误页，或返回错误代码
     * @method $assert
     * @param {Any} expression 表达式或方法
     * @param {String} msg [description]
     * @return {Boolean} 断言出错，则返回False
     */
    $assert:function(expression, msg){
        if(panutil.util.isFunction(expression)){
            expression = expression();
        }
        if(expression === true){
            return true
        }
        // TODO 跳转到错误页
        this.end(msg);
        return false;
    },
    $write:function(o,flag){
        this.write(o+"");
        if(flag) this.end();
    }
});