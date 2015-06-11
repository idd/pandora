var mo = require('pan-utils');
/**
 * session对象
 * @namespace svr
 * @class msession
 */
module.exports = function() {
    var sessions = {};
    
    /**
     * 判断是否存在session
     * @method hasSession
     * @param  {String} id cookie名称
     * @return {String}
     */
    this.hasSession = function(id) {
        return sessions[id];
    };
    /**
     * 增加session
     * @method addSession
     * @param  {String} id cookie名称
     * @param  {String} value cookie值
     * @return {String}
     */
    this.addSession = function(id,value) {
        if (!id) {
            return null;
        }
        if (this.hasSession(id)) {
            return id;
        }
        sessions[id]=value;
    };
    /**
     * 获取session
     * @method getSession
     * @param  {String} id cookie名称
     * @return {String}
     */
    this.getSession = function(id) {
        if(id) return sessions[id];
        return sessions;
    };
    /**
     * 删除session
     * @method deleteSession
     * @param  {String} id cookie名称
     * @return {String}
     */
    this.deleteSession = function(id) {
        delete sessions[id];
    };


}