#!/usr/bin/env node
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var spawn = require('child_process').spawn;
var async = require('async');
var args = process.argv.slice(2);
if (args.length === 0) {
    console.error(
        'You did not pass any commands, did you mean to run `pandorajs init`?'
    );
    process.exit(1);
}

if (args[0] === 'init') {
    init(args[1]);
} else {
    process.exit(1);
}


var ipt = 'copy';

function init() {
    try {
        process.stdin.on('readable', function() {
            var chunk = process.stdin.read();
            if (!chunk) {
                return
            }
            chunk = chunk.toString('utf8', 0, chunk.length).replace('\n', '');
            if (!chunk || chunk.toLowerCase() == 'y' || chunk.toLowerCase() == 'yes') {
                switch(ipt){
                    case 'copy':
                        copyFiles(1);
                        break;
                    case 'start':
                        startServer(1);
                        break;
                }
            } else {
                process.exit(1);
            }
        });
    } catch (error) {
        console.error(error);
        return;
    }
    copyFiles();
}

function copyFiles(force) {
    ipt = 'copy';
    try {
        var isEmpty = fs.readdirSync(process.cwd()).length === 0;
        if (!isEmpty && !force) {
            process.stdout.write('目录下有文件,继续操作可能覆盖已有文件。是否继续?(yes):');
            process.stdin.on('readable', function() {
                var chunk = process.stdin.read();
                if (!chunk) {
                    return
                }
                chunk = chunk.toString('utf8', 0, chunk.length).replace('\n', '');
                if (!chunk || chunk.toLowerCase() == 'y' || chunk.toLowerCase() == 'yes') {
                    copyFiles(1);
                } else {
                    process.exit(1);
                }
            });
        } else {
            var flist = fs.readdirSync(path.join(__dirname, 'demo'));
            console.log('正在创建文件...');
            flist.forEach(function(f) {
                fse.copySync(path.join(__dirname, 'demo', f), path.join(process.cwd(), f));
            });
            console.log('创建完成！');
            startServer();
        }

    } catch (error) {
        console.error(error);
        return;
    }
}

function startServer(force) {
    ipt = 'start';
    try {
        if (!force) {
            process.stdout.write('现在就要运行网站服务吗?(yes):');
        } else {
            
            run('node start.js', function(){
                // code
            });
        }
    } catch (error) {
        console.error(error);
        return;
    }
}

function run(command, cb) {
    var parts = command.split(/\s+/);
    var cmd = parts[0];
    var args = parts.slice(1);
    var proc = spawn(cmd, args, {
        stdio: 'inherit'
    });
    proc.on('close', function(code) {
        if (code !== 0) {
            cb(new Error('Command exited with a non-zero status'));
        } else {
            cb(null);
        }
    });
}