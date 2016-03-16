import * as fs from 'fs';
import * as Path from 'path';

var loadedSettings = null;

export default class Settings {
    static sharedInstance() {
        return loadedSettings || (loadedSettings = this.load());
    }

    static load() {
        var defaultSettings = {
            port: 3000,
            databaseUri: 'mongodb://localhost/twitter-tdd',
            twitterConsumerKey: null,
            twitterConsumerSecret: null,
            twitterCallbackUri: null,
            secret: null,
            secretKeyLength: 15
        };

        let path = Path.resolve(Path.join(__dirname, '..', '..', 'settings.json'));

        var json = {},
            settings = {};

        try {
            if(fs.existsSync(path)) {
                json = JSON.parse(fs.readFileSync(path));
            } else {
                console.log(`Warning: Configuration file not found at ${path}. Assuming default settings and reading from env.`);
            }
        } catch(ex) {
            console.log(`Error: Cannot load configuration file at ${path}: ${ex.message}. Assuming default settings and reading from env.`);
        }

        Object.keys(defaultSettings)
            .forEach(k => {
                if(json.hasOwnProperty(k)) {
                    settings[k] = json[k];
                } else {
                    settings[k] = defaultSettings[k]
                }
            });

        // Override from env.

        Object.keys(defaultSettings)
            .forEach(k => {
                var envKey = `tdd-${k}`;
                if(process.env[envKey]) {
                    settings[k] = process.env[envKey];
                }
            });

        return settings;
    }
}
