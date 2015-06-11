var pan = require('pandorajs');

module.exports = pan.page({
    attrs:{
        type:'ajax'
    },
    init:function(a){
        // this.get('response').write(this.get('request').url);
    },
    process:function(){
        var response = this.get('response');
        response.end(JSON.stringify({hello:"json"}));
    }
});