/**
 * @namespace svr
 * @class mpage
 * @protected
 */

var panutil = require('pan-utils'),
    path = require('path'),
    fs = require('fs'),
    template = require('./ptemplate');
    

var page_cache = {};

var page = {
    /**
     * 获取一个页面
     *
     * var p = require('./ppage');
     * p.get('home');// 返回siteroot/app/pages/home/home.js
     * 
     * @method  get
     * @static
     * @param  {String} page_name 页面名称
     * @param  {Object} attrs     页面属性
     * @return {Object} svr.mpage实例
     */
    get: function(page_name, attrs) {
        //TODO 参数为url
        var str_path = path.join(require('./siteroot') , 'pages', page_name),
            controller;
        
        if(!fs.existsSync(str_path + '.js')){
            str_path = path.join(str_path,path.basename(str_path));
        }

        if (page_cache[str_path]) {
            controller = page_cache[str_path];
        } else {
            controller = require(str_path);
            // TODO如果页面不是继承自mpage，则返回异常
            // TODO 在开发环境下，关闭缓存
            page_cache[str_path] = controller;
        }

        attrs = attrs || {};
        panutil.util.extend(attrs, {
            child_tpl: str_path + '.html',
            name: page_name
        });
        // if (!fs.existsSync(str_path)) {
        //     //TODO LOG记录错误，并跳转到错误页
        // }
        return new controller(attrs);
    },
    /**
     * 创建一个页面
     * @method create
     * @static
     * @param  {Object} proto 页面属性
     * @return {[type]}       
     */
    create: function(proto) {
        //TODO 如果设置了attrs，要处理下
        var cfg = panutil.util.extend({
            _init:function(attrs){
                panutil.util.each(attrs, function(v, k){
                    this.set(k, v);
                }, this);
            },
            /**
             * @property {Object} data 渲染准备的数据，渲染模板时可通过$page引用页面
             * @type {Object}
             */
            data: {},
            /**
             * 初始化方法
             * @method  init
             */
            /**
             * 渲染页面, 可通过此方法自动渲染页面
             *
             * 示例：siteroot/app/pages/home/home.js
             * ......
             * process:function(request, response){
             *     //准备渲染数据
             *     this.data.list = [1,2,3,4]
             *     //渲染页面
             *     this.render();
             *     也可在此页面中手动通过template模块渲染
             * }
             *......
             *siteroot/app/pages/home/home.html
             *...
             *<head>
             *<title>$page.f('title')</title>
             * ...
             * {{each list as item index}}
             * {{item}}
             * {{/each}}
             * 
             * @method render
             * @param  {Boolean} [isEnd=true] 是否结束输出
             */
            render: function(isEnd) {
                var response = this.get('response');
                var tpl = '';//template.get(this.get('base_tpl'));
                this.data.$page = this;

                var html = template.render(this.get('child_tpl_code') || this.get('child_tpl'), this.data);
                
                if(html == '{Template Error}'){
                    html += '\n<!-- source: -->\n'+
                    '<!-- ' + JSON.stringify(this.get('child_tpl_code') || this.get('child_tpl'))+' -->';
                }
                response.write(panutil.util.isString(html) ? html : '模板异常<!--' + tpl + '-->');
                if(isEnd !== false){
                    response.end();
                }
            },
            parse:function(tpl, data){
                return require('pan-utils').template.parse(tpl, data);
            }
        }, proto);
        cfg.attrs = cfg.attrs || {};
        panutil.util.extend(cfg.attrs, {
            /**
             * 页面标题
             * @property {String} title
             */
            // type:'html'
            // child_tpl:''
        });
        cfg.attrs.type = cfg.attrs.type || '';
        return panutil.class.create(cfg);
    }
}
module.exports = page;