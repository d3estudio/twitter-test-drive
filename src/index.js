import './controllers/index_controller';
import Express from 'express';
import ExpressSession from 'express-session';
import bodyParser from 'body-parser';
import consolidate from 'consolidate';
import * as Path from 'path';
import mongoose from 'mongoose';

import Settings from './models/settings';
import IndexController from './controllers/index_controller';
import SessionController from './controllers/session_controller';
import AdminController from './controllers/admin_controller';

var s = Settings.sharedInstance();

if(!s.twitterConsumerKey || !s.twitterConsumerSecret || !s.twitterCallbackUri) {
    console.log('ERROR: You must define twitterConsumerSecret, twitterConsumerKey, and twitterCallbackUri. Please refer to the settings section on the documentation.');
    process.exit(1);
}

if(!s.secret) {
    console.log('WARNING: Secret key is not defined.');
    s.secret = 'secret';
}

var app = Express(),
    sessionConfig = {
        secret: s.secret,
        saveUninitialized: false,
        resave: true,
        cookie: {
            secure: app.get('env') === 'production'
        }
    };

app
    .set('views', Path.join(__dirname, '..', 'views'))
    .set('trust proxy', 1)
    .set('view engine', 'ejs')
    .set('env', process.env.production ? 'production' : 'development')
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(bodyParser.json())
    .use(Express.static(Path.join(__dirname, '..', 'public')))
    .use(ExpressSession(sessionConfig))
    .engine('html', consolidate.swig);

app
    .get('/admin', AdminController.index)
    .get('/admin/download/:handle/:campaign/:type', AdminController.download)
    // this sessions needs to be coded on the controllers
    .get('/admin/detail', AdminController.detail)
    .get('/admin/manager', AdminController.manager)
    .get('/session', SessionController.index)
    .get('/session/twitter', SessionController.callback)
    .post('/session/delete', SessionController.destroy)
    .get('/:handle/:campaign', IndexController.automaker)
    .post('/:handle/:campaign', IndexController.create);


mongoose.connect(s.databaseUri);

console.log(`Connecting to mongo on ${s.databaseUri}`);
mongoose.connection
    .on('open', () => {
        console.log(`Listening on port ${s.port}`);
        app.listen(s.port);
    })
    .on('error', (ex) => {
        console.error(ex);
        process.exit(1);
    });
