module.exports = {
    // log目录
    //暂时只支持相对目录 
    //TODO支持自定义目录
    "debug_level":'debug',
    "access_id":false,
    "dir":{
		"system_log":'app/log/system.log',
	    "access_log":'app/log/access.log',
	    "user_log":'app/log/user.log'
    }
}