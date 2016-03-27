import Utils from '../utils';
import Inquiry from '../models/inquiry';
import Moment from '../models/moment';
import https from 'https';
import cheerio from 'cheerio';

var realNames = {};

export default class IndexController {
    static automaker(req, res) {
        if (!req.params.handle || !req.params.campaign) {
            return res.status(400).send('Invalid request.');
        }
        req.params.handle = req.params.handle.replace(/@/g, '').toLowerCase();
        req.params.campaign = req.params.campaign.toLowerCase();
        return Moment.findOne({
                handle: req.params.handle
            })
            .then((result) => {
                var url;
                if (result) {
                    url = result.url;
                }
                return IndexController.nameOf(req.params.handle)
                    .then((name) => {
                        return res.render('automaker.html', {
                            handle: req.params.handle,
                            campaign: req.params.campaign,
                            realName: name,
                            momentUrl: url
                        });
                    });
            })
            .catch(ex => Utils.recordError(ex));
    }

    static create(req, res) {
        var validators = {
            // we do not need this anymore
            // userHandle: {
            //     validator: (handle) => /^@?(\w){1,15}$/.test(handle),
            //     message: 'Insira um nome de usuário válido'
            // },
            name: {
                validator: (name) => /(\w)\s(\w+)/.test(name),
                message: 'Insira seu nome completo'
            },
            document: {
                validator: (document) => Utils.validateDocumentNumber(document),
                message: 'Insira um CPF válido'
            },
            email: {
                validator: (email) => Utils.validateEmail(email),
                message: 'Insira um email válido'
            }
        };

        req.params.handle = req.params.handle.replace(/@/g, '').toLowerCase();
        req.params.campaign = req.params.campaign.toLowerCase();

        var errors = [],
            responseObject = {
                errors: errors,
                handle: req.params.handle,
                campaign: req.params.campaign
            };
        IndexController.nameOf(req.params.handle)
            .then((name) => {
                responseObject.realName = name;
                Object.keys(validators)
                    .forEach(k => {
                        responseObject[k] = req.body[k];
                        if (!validators[k].validator(req.body[k])) {
                            errors.push(validators[k].message);
                        }
                    });

                if (errors.length) {
                    return res.render('automaker.html', responseObject);
                } else {
                    return Inquiry.create(responseObject)
                        .then(() => {
                            return res.render('automaker.html', {
                                success: true,
                                handle: req.params.handle
                            });
                        })
                        .catch((ex) => {
                            Utils.recordError(ex);
                            responseObject.errors.push('Ocorreu um erro ao processar a solicitação.');
                            return res.render('automaker.html', responseObject);
                        })
                }
            });
    }

    static nameOf(handle) {
        if (realNames[handle]) {
            return Promise.resolve(realNames[handle]);
        } else {
            return new Promise((resolve, reject) => {
                https.get(`https://twitter.com/${handle}`, (res) => {
                    var result = '';
                    res.on('data', (d) => {
                        result += d;
                    });
                    res.on('end', () => {
                        var $ = cheerio.load(result);
                        realNames[handle] = $('strong.fullname').first().text();
                        resolve(realNames[handle]);
                    });
                }).on('error', () => {
                    resolve('');
                });
            });
        }
    }
}
