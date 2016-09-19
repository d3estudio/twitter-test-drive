import Utils from '../utils';
import Inquiry from '../models/inquiry';
import Campaign from '../models/campaign';
import Moment from '../models/moment';
import https from 'https';
import cheerio from 'cheerio';
import slug from 'slug';

var realNames = {};

export default class IndexController {
    static preview(req, res) {
        const viewBag = JSON.parse(req.body.previewForm);
        return IndexController.nameOf(viewBag.handle)
            .then(n => {
                viewBag.action = "/admin/preview";
                viewBag.handleName = n;
                viewBag.fields = viewBag.fields.map(f => {
                    f.fieldName = slug(f.name);
                    return f;
                });
                return res.render('form.html', viewBag);
            });
    }

    static campaign(req, res, next) {
        let viewBag;
        return Campaign.findById(req.params.cid)
            .then(c => {
                if(!c) {
                    console.log(`Campaign ${req.params.cid} not found.`);
                    next();
                    return Promise.reject();
                }
                return c;
            })
            .then(campaign => {
                viewBag = campaign;
                return IndexController.nameOf(campaign.handle);
            })
            .then(name => {
                viewBag.handleName = name;
                return viewBag;
            })
            .then(viewBag => res.render('form.html', viewBag));
    }

    static campaignCommit(req, res, next) {
        let viewBag;
        return Campaign.findById(req.params.cid)
            .then(c => {
                if(!c) {
                    console.log(`Campaign ${req.params.cid} not found.`);
                    next();
                    return Promise.reject();
                }
                return c;
            })
            .then(campaign => {
                viewBag = campaign;
                return IndexController.nameOf(campaign.handle);
            })
            .then(name => {
                viewBag.handleName = name;
                return viewBag;
            })
            .then(viewBag => {
                return Inquiry.create({ handle: viewBag.handle, campaign: viewBag.id, data: req.body })
                    .then(i => {
                        viewBag.success = true;
                        return viewBag;
                    })
            })
            .then(viewBag => res.render('form.html', viewBag))
            .catch(ex => console.log(ex));
    }

    static automaker(req, res) {
        if (!req.params.handle || !req.params.campaign) {
            return res.status(400).send('Invalid request.');
        }
        req.params.handle = req.params.handle.replace(/@/g, '').toLowerCase();
        req.params.campaign = req.params.campaign.toLowerCase();
        return IndexController.nameOf(req.params.handle)
            .then((name) => {
                return {
                    handle: req.params.handle,
                    campaign: req.params.campaign,
                    realName: name
                }
            })
            .then((context) => {
                return Moment.findOne({
                        handle: req.params.handle,
                        campaign: req.params.campaign
                    })
                    .then((result) => {
                        if (result) {
                            context['extra_fields'] = result.extra_fields;
                        }
                        return res.render('automaker.html', context);
                    });
            })
            .catch(ex => Utils.recordError(ex));
    }

    static create(req, res) {
        var validators = {
            // we do not need this anymore
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
            },
            zip: {
                validator: (zip) => /.*/.test(zip),
                message: "Insira seu CEP"
            },
            phone: {
                validator: (phone) => /.*/.test(phone),
                message: "Insira seu Telefone"
            },
            location: {
                validator: (location) => /.+/.test(location),
                message: 'Insira sua localizaçãao'
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

        return Moment.findOne({
                handle: req.params.handle,
                campaign: req.params.campaign
            })
            .then((result) => {
                var url;
                if (result) {
                    url = result.url;
                }
                return IndexController.nameOf(req.params.handle)
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
                                        handle: req.params.handle,
                                        momentUrl: url
                                    });
                                })
                                .catch((ex) => {
                                    Utils.recordError(ex);
                                    responseObject.errors.push('Ocorreu um erro ao processar a solicitação.');
                                    return res.render('automaker.html', responseObject);
                                })
                        }
                    });
            })
            .catch(ex => Utils.recordError(ex));
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
                    resolve(handle);
                });
            });
        }
    }
}
