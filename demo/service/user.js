module.exports = function() {
  var md5 = require('crypto'),
    usermodule,
    _user = require('pandorajs').core.loadModel('user');

  return {

    init: function() {
      //模型初始化
      return this;
    },

    /**
     *@desc 用户增加
     */
    addUser: function($user, callback) {
      var self = this;
      _user.save($user,callback);
    },

    /**
     *@desc 用户登录检查
     */
    check: function($username, $password, callback) {
      // var self=this;
        _user.find({
          username: $username,
          userpwd: md5.createHash("md5").update($password).digest('hex'),
          canopen:1
        },{},{}, function(flag, user) {
          if (flag) {
            if (user.length>0) {
              callback(true, user);
            } else {
              callback(false, null);
            }
          } else {
            callback(false, err);
          }
        });
    },
    /**
     *@desc 用户增加
     */
    queryAllUser: function(callback) {
      // var self=this;
      // self.dao.queryAll(function(flag,user) {

      //   if(flag) callback(user);

      // });

    },
    getUsersByPage: function(q, page, epage, callback) {
      // var self=this;
      // this.dao.getPaginate(q, page||1, epage, function(error,pagecount,totalcount,result){

      //   if(callback) callback.call(this,error,pagecount,totalcount,result);
      // });
    }
  }
}().init();