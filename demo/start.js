var pandorajs = require('pandorajs'),
    svr = pandorajs.server,
    app_cfg = pandorajs.config.get('app_config');

// global.$isDebug = app_cfg.environment == 'development';

svr(app_cfg).start();