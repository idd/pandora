### 安装

> npm instal -g pandorajs

### 初始化应用

> pandorajs init

安装完成后，会自动创建app目录。

可在siteroot/config/app_config.js中修改端口号。`siteroot指站点根目录`


### 启动

在站点根目录，运行

>node app/start.js

或者在根目录下，运行

>pandorajs start.js

成功后可通过127.0.0.1:3005或网内ip加端口号访问

### pandorajs命令
pandorajs cmd  [arguments]

>pandora init

可通过init命令初始化一个站点


### 目录结构

* config	站点配置文件 
* log		日志
* models	数据模型
* modules	
* pages	页面
* service	服务
* tpls		模板
* start.js	启动文件