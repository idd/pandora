/**
 * log封装
 * @class log
 */
var config = require('./pconfig'),
	Log = require('log'),
	fs = require('fs')

var mlog = function(){
	this.log = null;
	this.bug_type = null;
}
mlog.prototype = {
	/**
	 * 普通初始化
	 * @method init
	 * @param  {string} type       log类型
	 * @param  {string} bug_type   bug类型
	 * 
	 */
	
	init : function(type,bug_type){
		var stream = fs.createWriteStream(config.get('log_config').dir[type], {flags: 'a'});
    	//设定写入level等级
    	this.log = new Log(config.get('log_config').debug_level, stream);
    	this.bug_type = level_type;
	},
	/**
	 * 自定义等级初始化
	 * @method initWithLevel
	 * @param  {string} type     log类型
	 * @param  {string} bug_type bug类型
	 * @param  {string} level    level等级
	 * 
	 */
	initWithLevel : function(type,bug_type,level){
		if(!config.get('log_config').dir[type]){
			console.log("不存在文件");
			return 
		}
		var stream = fs.createWriteStream(config.get('log_config').dir[type], {flags: 'a'});
    	this.log = new Log(level, stream);
    	this.bug_type = bug_type;
	},
	/**
	 * 重新设定debug类型
	 * @method setBugType
	 * @param {string} bug_type debug类型
	 */
	setBugType : function(bug_type){
		this.bug_type = bug_type;
	},
	/**
	 * 写入log
	 * @method mlog
	 * @param {string} msg 写入信息
	 */
	mlog : function(msg){
		this.log[this.bug_type](msg);
	}

}


module.exports = mlog;