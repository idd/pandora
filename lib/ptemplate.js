/**
 * @class mtemplate
 */
var template = require('./template_engin'),
    util = require('pan-utils').util,
    path = require('path'),
    fs = require('fs'),
    cfg = null,
    // per_reg_block = /\<\?()(.*?)\?\>/ig,
    __cache = {},
    $isDebug = global.$isDebug || false;

function class_tpl_obj(attr) {
    this.path = attr.path || null;
    this.code = attr.code || '';
}

var mtemplate = {
    /**
     * 处理继承
     * @param  {class_tpl_object} tpl_obj 模板渲染内部变量
     * @private
     * @return {Boolean}         有继承则返回True
     */
    _processExtends: function(tpl_obj) {
        var reg = /\<\?extend +([a-z,A-Z,0-9,-,_,\,/]+)\?\>/ig,
            parent_code = null,
            // 子模板代码
            tpl_code = tpl_obj.code,
            // 父模板路径
            parent_path = reg.exec(tpl_code);

        if(parent_path) {
            parent_path = parent_path[1];
            parent_code = mtemplate.get(parent_path);
            if (parent_code === null) {
                console.error('template', '_processExtends:' + parent_path + '未找到');
                return tpl_code;
            }
            if (parent_code.indexOf('<?child_tpl?>') === -1) {
                console.error('template', '未找到子模板字段：<?child_tpl?> in ' + parent_path);
                return tpl_code.replace(reg, 'extend ' + parent_path);
            }
            //把父模板中的<?child_tpl?>替换成子模板
            tpl_code = tpl_code.replace(reg, '');
            tpl_obj.code = parent_code.replace('<?child_tpl?>', '<!--子模板开始-->' + tpl_code + '<!--子模板结束-->');
            return true;
        } else {
            return false;
        }
    },
    /**
     * 处理include标签，有则返回True，头则返回FALSE
     * @param  {class_tpl_object} tpl_obj 模板渲染内部变量
     * @private
     * @return {Boolean}         有include则返回True
     */
    _processInclude: function(tpl_obj) {
        var tpl_code = tpl_obj.code,
            //<?include base/global-header?> <!--子模板开始--> hello 首页，哈哈哈
            reg = /\<\?include +([a-z,A-Z,0-9,\-,_,\\,\/]+)\?\>/ig,
            flag = false;
        tpl_code = tpl_code.replace(reg, function(a, path){
            flag = true;
            return mtemplate.get(path);
        });
        tpl_obj.code = tpl_code;
        return flag;
    },
    /**
     * 处理Block
     * @param  {class_tpl_object} tpl_obj 模板渲染内部变量
     * @private
     * @return {Boolean}         有include则返回True
     */
    _processBlock:function(tpl_obj){
        // Block以最后找到的为准
        var block_cache = {};
        var tpl_code = tpl_obj.code,
            reg_block = /\<\?block +([a-z,A-Z,0-9,\-,_,\\,\/]+)\?\>/ig,
            reg_def_block = /\<\?defBlock +([a-z,A-Z,0-9,\-,_,\\,\/]+)\?\>([\s\S]*?)\<\?\/defBlock\?\>/ig;

        tpl_code = tpl_code.replace(reg_def_block, function(a, block_name, block_content){
            if(block_cache[block_name]){
                console.error('mtemplate.js', block_name+' 重复定义 in' + (tpl_obj.path || ''));
            }
            block_cache[block_name] = block_content
            return '';
        });
        tpl_code = tpl_code.replace(reg_block, function(a, block_name){
            if(block_cache[block_name]){
                return block_cache[block_name];
            }else{
                console.error('mtemplate.js', '未实现 block('+block_name + ') in:'+ tpl_obj.path);
                return $isDebug?'{ { '+block_name+' } }':'';
            }
        });
        tpl_obj.code = tpl_code;
        // if(blocks){
        //     if(!defBlock){
        //         console.log('error', 'templage._processBlock 为找到block定义\t\t path'+tpl_obj.path);
        //     }
        // }else{
        //     if(defBlock){
        //         console.log('error', 'templage._processBlock 有未实现的block定义\t\t path'+tpl_obj.path);
        //     }
        // }
    },

    /**
     * 预处理模板中的block和include
     * @param  {String} tpl_code
     * @return {String}
     */
    _perProcess: function(tpl_obj) {
        //处理继承
        //一个页面只能继承一个母模板
        var flag = true;
        var i  = 0;
        // 处理继承和Include
        while(flag && i++ <100){                
            flag = !(!mtemplate._processExtends(tpl_obj) &&
                            !mtemplate._processInclude(tpl_obj));
        }
        mtemplate._processBlock(tpl_obj);
    },
    /**
     * 渲染模板
     * @method render
     * @param  {String} tpl_path 模板路径
     * @param  {Object} data     数据
     * @return {String}          渲染后的文本
     */
    render: function(tpl_path, data) {
        var code = '';
        if (!util.isString(tpl_path)) { // || util.isObject(tpl_path) && !(tpl_path instanceof tpl_obj)){
            // TODO 
            // 错误
            return '';
        }
        code = mtemplate.get(tpl_path);
        if (code === null) {
            return '<!--未找到 ' + tpl_path + ' -->';
        }
        var tpl_obj = new class_tpl_obj({
            path: tpl_path,
            code: code
        });

        return mtemplate.parse(tpl_obj, data);
    },
    /**
     * 解析模板
     * @method parse
     * @param  {String} tpl_code 模板
     * @param  {Object} data     数据
     * @return {String}          解析后的文本
     */
    parse: function(tpl_obj, data) {
        cfg = cfg || require('../../mconfig').get('template_config')
        var code = null;
        if (util.isString(tpl_obj)) {
            tpl_obj = new class_tpl_obj({
                path: null,
                code: tpl_obj
            });
            // code = template(tpl_obj, data);;
            // return code;
        } else if (util.isObject(tpl_obj) && tpl_obj instanceof class_tpl_obj) {
            if (!$isDebug && __cache[tpl_obj.path]) {
                return template(__cache[tpl_obj.path].code)(data);
            }else if (!tpl_obj.code || !tpl_obj.path) {
                console.error('template', 'parse:参数不全');
            }
        } else {
            // TODO ERROR
            console.error('template', 'parse:类型不符');
            return '';
        }

        // 预处理
        mtemplate._perProcess(tpl_obj);
        // tpl_obj.code = 
        if(tpl_obj.path && cfg.enableCache){
            __cache[tpl_obj.path] = tpl_obj;
        }
        return template(tpl_obj.code)(data);
    },
    /**
     * 获取模板
     * @method get
     * @static
     * @param {String} str_path 模板路径
     * @param {Boolean} str_path 模板路径
     * @return {String} 模板文件
     */
    get: function(k) {

        cfg = cfg || require('../../../lib/pconfig').get('template_config');
        if (!k) {
            // TODO
            console.error('template.get:k is undefined');
            return null;
        }
        var tpath = k.charAt(0) == '/' ||(/^\w\:.*/i).test(k)  ? k : path.join(cfg.baseDir, k) + '.html';
        if (!fs.existsSync(tpath)) {
            //TODO 警告模板不存在                
            console.error('template.get', tpath + ' is not exists');
            return null; //'<!-- ' + tpath + ' is not exists -->';
        }
        // 预处理block和include
        return fs.readFileSync(tpath, 'utf-8');
    }
};

module.exports = mtemplate;