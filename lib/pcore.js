var config = require('./pconfig'),
    path = require('path'),
    _path = require('./siteroot');
module.exports = {
    loadService: function(value) {
        //TODO 判断文件是否存在，不存在则Log，显示错误，并放回空对象
        return require(path.join(_path, 'service', value));
    },
    loadModel: function(mname) {
        return require(path.join(_path, 'models', mname));
    },
    loadDbModel: function(db_config_name) {
        db_config_name = db_config_name || 'default';
        var dbConfig = config.get('db_config')[db_config_name];
        return require('./dbDriver/' + dbConfig['name'] + '/modelClass').init(dbConfig);
    }
}