var pan = require('pandorajs'),
    panUtil = require('pan-utils'),
    watch = panUtil.watch;
    fs = require('fs'),
    svr = pan.server,
    astro = require('pan-astro'),
    compiler = astro.compiler,
    app_cfg = pan.config.get('app_config');

global.$isDebug = true;

//是否开启文件变化日志输出
var isLog = false;

panUtil.util.each(panUtil.file.getAllDirsSync(pan.getFilePath('Sites')), function(dir){
    dir = dir.match(/[^\\\/]+$/)[0];
    initProject(dir);
});

svr(app_cfg).start();

function initProject(projectName) {
    if(projectName.charAt(0) == '_'){return;}
    
    compiler.loadPage(projectName);
    watchPages(projectName);

    compiler.loadModule(projectName);
    watchModules(projectName);

    compiler.loadLibJS(projectName);
    watchMoJS(projectName);


    fs.watchFile(astro.help.getSiteFilePath(projectName, 'config.js'), {
        interval: 1000
    //是否开启文件
    },function(filepath, curr, prev){
        isLog && console.log('\n\n站点（'+projectName+'）配置修改\n');
        delete require.cache[astro.help.getSiteFilePath(projectName, 'config.js')];
        delete require.cache[astro.help.getSiteFilePath(projectName, 'config')];
        // svr.restart();
    });
}

//是否开启文件
function watchMoJS(projectName) {
    isLog && console.log('watched on:' + astro.help.getSiteFilePath(projectName, 'jslib'))
    watch.watchTree(astro.help.getSiteFilePath(projectName, 'jslib'), {
            persistent: true,
            ignoreDotFiles: true,
            interval: 1000
        },
        function(filepath, curr, prev) {
            if (typeof filepath == "object" && prev === null && curr === null) {
                //是否开启文件
                // Finished walking the tree
                // isLog && console.log('Finished walking the tree');
                return;
            } else if (prev === null) {
                // f is a new file
            } else if (curr.nlink === 0) {
                // f was removed
            } else {
                // f was changed
            }
            var ext = filepath.match(/([^\\,\/]+)[\/,\\]jslib[\\,\/].*([^\\,\/]+)[\\,\/]\2\.(\w+)$/),
                pname,
                prjname;
            //是否开启文件
            if (!ext) {
                isLog && console.log('compiler-jslibchange4 : ' + filepath + ' is ignored\t\t' + (new Date));
                return;
            }
            prjname = ext[1];
            pname = ext[2];
            ext = ext[3];

            var mojsHash = panUtil.swap('mojsHash') || {};
            var jspath = ext == 'js' ? filepath : filepath.replace(/(\w)+$/, 'js');
            //是否开启文件
            if (!fs.existsSync(jspath)) {
                isLog && console.log('mompiler-jschange :' + jspath + ' is miss');
                return;
            }
            var dir = filepath.replace(/[^\\,\/]+\.(\w)+$/, '');
            mojsHash[projectName][pname] = compiler._getModuleObject(dir, 'jslib', projectName).obj;
            panUtil.swap('mojsHash', mojsHash)
        }
    );
}

//是否开启文件
function watchPages(projectName) {
    isLog && console.log('watched on:' + astro.help.getSiteFilePath(projectName, 'pages'))
    watch.watchTree(astro.help.getSiteFilePath(projectName, 'pages'), {
            persistent: true,
            ignoreDotFiles: true,
            interval: 1000
        },
        // watch(astro.help.getSiteFilePath(projectName, 'pages'),
        function(filepath, curr, prev) {
            if (typeof filepath == "object" && prev === null && curr === null) {
                //是否开启文件
                // Finished walking the tree
                // isLog && console.log('Finished walking the tree');
                return;
            }
            var ext = filepath.match(/([^\\,\/]+)[\/,\\]pages[\\,\/].*([^\\,\/]+)[\\,\/]\2\.(\w+)$/),
                pname,
                prjname;
            //是否开启文件
            if (!ext) {
                isLog && console.log('compiler-pagechange3-ignore' + filepath + ' is miss' + (new Date));
                return;
            }
            prjname = ext[1];
            pname = ext[2];
            ext = ext[3];

            var pagesHash = panUtil.swap('pagesHash') || {};
            var htmlpath = ext == 'html' ? filepath : filepath.replace(/(\w)+$/, 'html');
            //是否开启文件
            if (!fs.existsSync(htmlpath)) {
                isLog && console.log('compiler-pagechange1 :' + htmlpath + ' is miss');
                return;
            //是否开启文件
            } else {
                isLog && console.log('compiler-pagechange2 :' + filepath + '\t' + (new Date));
            }
            var dir = filepath.replace(/[^\\,\/]+\.(\w)+$/, '');
            try{
                pagesHash[projectName][pname] = compiler._getModuleObject(dir, 'pages', projectName).obj;
            //是否开启文件
            }catch(error){  
                console.log('dir:'+dir+'\t\t\tprojectName:'+  projectName);
                throw error;
            }
            panUtil.swap('pagesHash', pagesHash);
        });
}

//是否开启文件
function watchModules(projectName) {
    isLog && console.log('watched on:' + astro.help.getSiteFilePath(projectName, 'modules'));
    watch.watchTree(astro.help.getSiteFilePath(projectName, 'modules'), {
            persistent: true,
            ignoreDotFiles: true,
            interval: 1000
        },
        function(filepath, curr, prev) {
            if (typeof filepath == "object" && prev === null && curr === null) {
                return;
            }
            var ext = filepath.match(/([^\\,\/]+)[\\,\/]modules[\\,\/].*([^\\,\/]+)[\\,\/]\2\.(\w+)$/),
                pname,
                prjname;
            //是否开启文件
            if (!ext) {
                isLog && console.log('compiler-pagechange-ignore:' + filepath + ' is miss' + (new Date));
                return;
            }
            prjname = ext[1];
            modName = ext[2];
            ext = ext[3];

            var modulesHash = panUtil.swap('modulesHash') || {};
            var htmlpath = ext == 'html' ? filepath : filepath.replace(/(\w)+$/, 'html');
            //是否开启文件
            if (!fs.existsSync(htmlpath)) {
                isLog && console.log('compiler-moduleChange :' + htmlpath + ' is miss');
                return;
            //是否开启文件
            } else {
                isLog && console.log('compiler-moduleChange :' + htmlpath + (new Date));
            }
            var dir = filepath.replace(/[^\\,\/]+\.(\w)+$/, '');

            modulesHash[projectName][modName] = compiler._getModuleObject(dir, 'modules', projectName).obj
            panUtil.swap('modulesHash', modulesHash);
        });
}