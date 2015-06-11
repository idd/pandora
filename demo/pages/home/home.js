var pan = require('pandorajs');
// var user = require('../../models/user_model.js');


module.exports = pan.page({
    attrs:{
        title:'项目首页',
        css:'css'
    },
    init:function(a){
        // console.log('home has been inited');
    },
    process:function(require, response){
       // console.log(this);
        this.render();

    }
});