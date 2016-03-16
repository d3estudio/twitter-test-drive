import Settings from '../models/settings';
import SuperUser from '../models/superuser';
import SecretKey from '../models/secret_key';

import Twitter from 'node-twitter-api';

let getTwitterApi = () => {
    let s = Settings.sharedInstance();
    return new Twitter({
        consumerKey: s.twitterConsumerKey,
        consumerSecret: s.twitterConsumerSecret,
        callback: s.twitterCallbackUri
    });
};

export default class SessionController {
    static index(req, res) {
        if(req.session.auth) {
            return res.redirect('/admin');
        } else {
            var twitter = getTwitterApi();
            twitter.getRequestToken((error, requestToken, requestTokenSecret, results) => {
                if(error) {
                    console.log('[Twitter] getRequestToken failed:');
                    console.error(error)
                    console.log('---------------------------------');
                    res.render('error.html', {
                        message: 'Houve um problema ao comunicar-se com o Twitter. Tente novamente.'
                    });
                } else {
                    req.session.requestToken = requestToken;
                    req.session.requestTokenSecret = requestTokenSecret;
                    return res.redirect(`https://twitter.com/oauth/authenticate?oauth_token=${requestToken}`);
                }
            });
        }
    }

    static callback(req, res) {
        var twitter = getTwitterApi();
        if(!req.query['oauth_token'] || !req.query['oauth_verifier']) {
            return res.render('error.html', {
                message: 'O servidor do Twitter respondeu de uma forma inesperada. Tente novamente.'
            });
        }

        var oauthToken = req.query['oauth_token'],
            oauthVerifier = req.query['oauth_verifier'],
            requestToken = req.session.requestToken,
            requestTokenSecret = req.session.requestTokenSecret;

        if(!requestToken || !requestTokenSecret) {
            return res.redirect('/session');
        }

        twitter.getAccessToken(requestToken, requestTokenSecret, oauthVerifier, (error, accessToken, accessTokenSecret, results) => {
            if (error) {
                console.log('[Twitter] getAccessToken failed:');
                console.error(error);
                console.log('---------------------------------');
                res.render('error.html', {
                    message: 'Houve um problema ao comunicar-se com o Twitter. Tente novamente.'
                });
            } else {
                twitter.verifyCredentials(accessToken, accessTokenSecret, null, function(error, data, response) {
                    if (error) {
                        console.log('[Twitter] verifyCredentials failed:');
                        console.error(error);
                        console.log('---------------------------------');
                        res.render('error.html', {
                            message: 'Houve um problema ao comunicar-se com o Twitter. Tente novamente.'
                        });
                    } else {
                        req.session.handle = data['screen_name'];
                        SuperUser.isSuperUser(req.session.handle)
                            .then(isSuperUser => {
                                req.session.isSuperUser = isSuperUser;
                                if(!isSuperUser) {
                                    return SecretKey.getOrCreateForHandle(req.session.handle);
                                }
                            })
                            .then((key) => {
                                if(key) {
                                    req.session.secretKey = key.secretKey;
                                }
                                return res.redirect('/admin');
                            });
                    }
                });
            }
        });
    }
}
