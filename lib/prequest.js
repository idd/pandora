/**
 * 扩展request对象
 * @namespace svr
 * @class mrequest
 */
var http = require('http'),
    panutil = require('pan-utils'),
    req = http.IncomingMessage.prototype,
    querystring = require('querystring');

panutil.util.extend(req, {
    /**
     * 获取cookie
     * @method $getCookie
     * @param  {String} name cookie名称
     * @return {String}
     */
    $getCookie: function(name) {
        return querystring.parse(this.headers.cookie)[name];
    },
    /**
     * 获取客户端IP
     * @method $getClientIp
     * @return {String} 客户端IP
     */
    $getClientIp: function() {
        var ipAddress;
        var forwardedIpsStr = this.connection.remoteAddress;
        if (forwardedIpsStr) {
            var forwardedIps = forwardedIpsStr.split(',');
            ipAddress = forwardedIps[0];
        }
        if (!ipAddress) {
            ipAddress = req.connection.remoteAddress;
        }
        return ipAddress;
    },
    /**
     * 读取请求参数
     * @method  $getParameter
     * @param  {String} name         参数名称
     * @param  {String} [defaultValue] 参数为空时的默认值
     * @return {[type]}
     */
    $getParameter: function(name, defaultValue) {
        return this.$params[name] != undefined ? this.$params[name] : (defaultValue || '');
    },
    /**
     * 获取格式化后的 user-agent 信息
     * @method  $getUAgent
     * @return {Object}
     */
    $getUAgent: function() {
        var o = {},
            ua = this.headers['user-agent'],
            m,
            numberify = function(s) {
                var c = 0;
                return parseFloat(s.replace(/\./g,
                    function() {
                        return (c++ === 1) ? '' : '.';
                    }));
            };
        if ((/windows|win32/i).test(ua)) {
            o.os = 'windows';
        } else if ((/macintosh|mac_powerpc/i).test(ua)) {
            o.os = 'osx';
        } else if ((/android/i).test(ua)) {
            o.os = 'android';
        } else if ((/symbos/i).test(ua)) {
            o.os = 'symbos';
        } else if ((/linux/i).test(ua)) {
            o.os = 'linux';
        } else {
            o.os = 'other';
        }
        // Modern KHTML browsers should qualify as Safari X-Grade
        if ((/KHTML/).test(ua)) {
            o.webkit = 1;
        }
        if ((/IEMobile|XBLWP7/).test(ua)) {
            o.mobile = 'windows';
        }
        if ((/Fennec/).test(ua)) {
            o.mobile = 'gecko';
        }
        // Modern WebKit browsers are at least X-Grade
        m = ua.match(/AppleWebKit\/([^\s]*)/);
        if (m && m[1]) {
            o.webkit = numberify(m[1]);
            o.safari = o.webkit;

            if (/PhantomJS/.test(ua)) {
                m = ua.match(/PhantomJS\/([^\s]*)/);
                if (m && m[1]) {
                    o.phantomjs = numberify(m[1]);
                }
            }

            // Mobile browser check
            if (/ Mobile\//.test(ua) || (/iPad|iPod|iPhone/).test(ua)) {
                o.mobile = 'Apple'; // iPhone or iPod Touch

                m = ua.match(/OS ([^\s]*)/);
                if (m && m[1]) {
                    m = numberify(m[1].replace('_', '.'));
                }
                o.ios = m;
                o.os = 'ios';
                o.ipad = o.ipod = o.iphone = 0;

                m = ua.match(/iPad|iPod|iPhone/);
                if (m && m[0]) {
                    o[m[0].toLowerCase()] = o.ios;
                }
            }

            m = ua.match(/(Chrome|CrMo|CriOS)\/([^\s]*)/);
            if (m && m[1] && m[2]) {
                o.chrome = numberify(m[2]); // Chrome
                o.safari = 0; //Reset safari back to 0
                if (m[1] === 'CrMo') {
                    o.mobile = 'chrome';
                }
            } else {
                m = ua.match(/AdobeAIR\/([^\s]*)/);
                if (m) {
                    o.air = m[0]; // Adobe AIR 1.0 or better
                }
            }
        }

        if (!o.webkit) { // not webkit
            // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
            if (/Opera/.test(ua)) {
                m = ua.match(/Opera[\s\/]([^\s]*)/);
                if (m && m[1]) {
                    o.opera = numberify(m[1]);
                }
                m = ua.match(/Version\/([^\s]*)/);
                if (m && m[1]) {
                    o.opera = numberify(m[1]); // opera 10+
                }

                if (/Opera Mobi/.test(ua)) {
                    o.mobile = 'opera';
                    m = ua.replace('Opera Mobi', '').match(/Opera ([^\s]*)/);
                    if (m && m[1]) {
                        o.opera = numberify(m[1]);
                    }
                }
                m = ua.match(/Opera Mini[^;]*/);

                if (m) {
                    o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                }
            } else { // not opera or webkit
                m = ua.match(/MSIE\s([^;]*)/);
                if (m && m[1]) {
                    o.ie = numberify(m[1]);
                } else { // not opera, webkit, or ie
                    m = ua.match(/Gecko\/([^\s]*)/);
                    if (m) {
                        o.gecko = 1; // Gecko detected, look for revision
                        m = ua.match(/rv:([^\s\)]*)/);
                        if (m && m[1]) {
                            o.gecko = numberify(m[1]);
                            if (/Mobile|Tablet/.test(ua)) {
                                o.mobile = "ffos";
                            }
                        }
                    }
                }
            }
        }
        return o;
    }
});