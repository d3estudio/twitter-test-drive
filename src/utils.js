import {Client} from 'raven'
import Settings from './models/settings';

var sentryClient = null;

export default class Utils {
    static generateAdminViewBag(req, extra=null) {
        let result = {
            handle: req.session.handle,
            secretKey: req.session.secretKey,
            isSuperUser: req.session.isSuperUser,
        };

        if(!!extra) {
            Object.assign(result, extra);
        }

        return result;
    }

    static setupSentry() {
        let sUri = Settings.sharedInstance().sentryUri;
        if(sUri && !sentryClient) {
            sentryClient = new Client(sUri);
            sentryClient.patchGlobal();
        }
    }

    static recordError(ex) {
        console.log('[Sentry] Exception caught:');
        console.error(ex);
        let sUri = Settings.sharedInstance().sentryUri;
        if(sUri && !sentryClient) {
            sentryClient = new Client(sUri);
        }
        if(sentryClient) {
            sentryClient.captureException(ex);
        }
    }
}
