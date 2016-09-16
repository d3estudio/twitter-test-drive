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

    static validateDocumentNumber(cpf) {
        var j = -1,
            i, add, rev;

        cpf = cpf.replace(/[^\d]+/g, '');

        if(cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        while(++j < 2) {
            add = 0;
            i = -1;
            while(++i < (9 + j)) {
                add += (cpf[i] >>> 0) * ((10 + j) - i);
            }

            rev = 11 - (add % 11);

            if(rev === 10 || rev === 11) {
                rev = 0;
            }

            if(rev !== cpf[9 + j] >>> 0) {
                return false;
            }
        }

        return true;
    }
    static validateEmail(email) {
        var r = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return r.test(email);
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
