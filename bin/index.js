#!/usr/bin/env node

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var spawn = require('child_process').spawn;
var async = require('async');

var args = process.argv.slice(2);

var program = require('commander');

if (!process.argv.slice(2).length) {
    console.error('你没有输入任何命令，是否想输入`pandorajs init`?\n你可以通过 pandorajs -h 获得更信息');
    process.exit(1);
}

program
    .command('init')
    .description('初始化项目')
    .option('-s, --start [value]', '是否提示开启服务', function(val) {
        return val != 'no' && val != 'false';
    }, true)
    .action(function(cmd) {
        var ipt = 'copy';
        try {
            process.stdin.on('readable', function() {
                var chunk = process.stdin.read();
                if (!chunk) {
                    return
                }
                chunk = chunk.toString('utf8', 0, chunk.length).replace('\n', '');
                if (!chunk || chunk.toLowerCase() == 'y' || chunk.toLowerCase() == 'yes') {
                    switch (ipt) {
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
                    var fpath = path.dirname(__dirname);
                    var flist = fs.readdirSync(path.join(fpath, 'demo'));
                    console.log('pandora->正在初始化...'+ (Date.now()));
                    flist.forEach(function(f) {
                        fse.copySync(path.join(fpath, 'demo', f), path.join(process.cwd(), f));
                    });
                    run('npm install', null, function() {
                        cmd.start && startServer();
                        console.log('pandora->完成...'+ (Date.now()));
                        process.exit(1);
                    });
                }

            } catch (error) {
                console.error(error);
                return;
            }
        }
    });

program
    .command('start')
    .description('启动服务')
    .action(function(opt) {
        startServer(1);
    });

program.parse(process.argv);

function startServer(force) {
    ipt = 'start';
    try {
        if (!force) {
            process.stdout.write('现在就要运行网站服务吗?(yes):');
        } else {

            run('node start.js', null, function() {
                // code
            });
        }
    } catch (error) {
        console.error(error);
        return;
    }
}

function run(command, opt, cb) {
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