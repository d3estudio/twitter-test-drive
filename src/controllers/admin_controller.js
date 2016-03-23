import Inquiry from '../models/inquiry';
import SecretKey from '../models/secret_key';
import SuperUser from '../models/superuser';
import Log from '../models/log';
import * as Promise from 'bluebird';
import json2csv from 'json2csv';
import Utils from '../utils';

export default class AdminController {
    static index(req, res) {
        if(!req.session.handle) {
            return res.redirect('/session');
        }
        var viewData = {
            handle: req.session.handle,
            secretKey: req.session.secretKey,
            isSuperUser: req.session.isSuperUser,
            handles: []
        };

        var filter = { handle: req.session.handle },
            next = 'admin/index.html';

        if(req.session.isSuperUser) {
            filter = {};
            next = 'admin/superadmin.html';
        }

        var handles = {},
            otherProms = {};

        Inquiry.find(filter)
            .distinct('handle')
            .then((handles) => {
                handles.forEach(h => {
                    handles[h] = {
                        handle: h,
                        secretKey: null,
                        campaigns: []
                    };
                    otherProms[`${h}_campaigns`] = Inquiry.find({ handle: h }).distinct('campaign');
                    otherProms[`${h}_secretKey`] = SecretKey.findOne({ handle: h });
                })
                .catch(ex => Utils.recordError(ex));

                Promise.props(otherProms)
                    .then(result => {
                        handles.forEach(h => {
                            var sk = result[`${h}_secretKey`];
                            handles[h].secretKey = sk ? sk.secretKey : null;
                            handles[h].campaigns = result[`${h}_campaigns`];
                        });
                        viewData.handles = handles.map(k => handles[k]);
                        console.log(viewData);
                        return res.render(next, viewData);
                    })
                    .catch(ex => Utils.recordError(ex));
            });
    }

    static detail(req, res) {
        if(!req.session.handle) {
            return res.redirect('/session');
        }
        var viewData = {
            handle: req.session.handle,
            secretKey: req.session.secretKey,
            isSuperUser: req.session.isSuperUser,
            targetHandle: {
                handle: req.params.handle,
                secretKey: SecretKey.findOne({ handle: req.params.handle }),
                campaigns: Inquiry.find({ handle: req.params.handle }).distinct('campaign')
            }
        };

        Promise.props(viewData.targetHandle)
            .then(r => {
                viewData.targetHandle = r;
                return res.render('admin/detail.html', viewData);
            })
            .catch(ex => Utils.recordError(ex));
    }

    static download(req, res) {
        if(!req.session.handle && !req.query.key) {
            return res.redirect('/admin');
        }

        if(['json', 'csv'].indexOf(req.params.type) < 0) {
            return res.status(400).send('Invalid type. Please specify either json or csv.');
        }

        var filter = { handle: req.session.handle, campaign: req.params.campaign };

        var prom;
        if(!req.session.handle && req.query.key) {
            prom = SecretKey.findOne({ secretKey: req.query.key })
                .then((k) => {
                    if(!k) {
                        return Promise.reject('Missing secret key.');
                    } else {
                        return k.handle;
                    }
                });
        } else {
            prom = Promise.resolve(req.session.handle);
        }

        return prom.then((handle) => {
            if(req.session.isSuperUser) {
                handle = req.params.handle;
            }
            return handle;
        })
        .then((handle) => {
            filter.handle = handle;
            if(req.params.campaign.toLowerCase() === 'all') {
                delete filter['campaign'];
            }
            return filter;
        })
        .then((filter) => {
            return Inquiry.find(filter, { handle: 0, _id: 0, __v: 0 })
        })
        .then((docs) => {
            Log.create({
                targetHandle: filter.handle,
                impersonated: !!req.query.key,
                targetHandle: req.session.handle || null,
                operation: Log.DOWNLOAD,
                extra: {
                    campaign: req.params.campaign.toLowerCase()
                }
            });
            if(req.params.type === 'json') {
                return res.json(docs);
            } else {
                var fields = ['name', 'document', 'email'];
                if(req.params.campaign.toLowerCase() === 'all') {
                    fields.push('campaign');
                };
                json2csv({ data: docs, fields: fields }, function(err, csv) {
                    if (err) {
                        console.log('[Download] CSV Conversion failed:');
                        console.error(err);
                        console.log('');
                        return res.status(500).send('Internal server error.');
                    }
                    res.set('Content-Type', 'text/plain');
                    return res.send(csv);
                });
            }
        })
        .catch(ex => {
            Utils.recordError(ex);
            console.error(ex);
            return res.status(500).send('Internal server error.');
        });
    }

    static listAdmins(req, res) {
        if(!req.session.handle) {
            return res.redirect('/session');
        }
        if(!req.session.isSuperUser) {
            return res.redirect(`/admin`);
        }

        var viewData = {
            handle: req.session.handle,
            secretKey: req.session.secretKey,
            isSuperUser: req.session.isSuperUser,
            users: []
        };

        SuperUser.find({}, {parent: 0, _id: 0, __v: 0})
            .then((arr) => {
                viewData.users = arr;
                return res.render('admin/manager.html', viewData);
            })
            .catch(ex => Utils.recordError(ex));
    }

    static addAdmin(req, res) {
        if(!req.session.handle) {
            return res.redirect('/session');
        }
        if(!req.session.isSuperUser) {
            return res.redirect('/admin');
        }

        if(!req.body.handle) {
            return res.json({ success: false, error: 'Missing handle.' });
        } else {
            SuperUser.findOne({ handle: req.body.handle })
                .then((u) => {
                    if(u) {
                        return res.json({ success: true, handle: u.handle })
                    } else {
                        SuperUser.create({
                            handle: req.body.handle,
                            parent: req.session.handle
                        }).then((u) => {
                            Log.create({
                                targetHandle: req.body.handle,
                                userHandle: req.session.handle,
                                operation: Log.ADD_SUPERUSER,
                            }).catch(console.error);
                            return res.json({ success: true, handle: u.handle });
                        }).catch((ex) => {
                            return res.json({ success: false, error: ex.message });
                        });
                    }
                })
                .catch(ex => Utils.recordError(ex));
        }
    }

    static removeAdmin(req, res) {
        if(!req.session.handle) {
            return res.redirect('/session');
        }
        if(!req.session.isSuperUser) {
            return res.redirect('/admin');
        }

        if(!req.body.handle) {
            return res.json({ success: false, error: 'Missing handle.' });
        } else {
            SuperUser.findOne({ handle: req.body.handle })
                .then((u) => {
                    if(!u) {
                        return res.json({ success: false, error: 'Handle not found.' });
                    } else {
                        u.remove()
                            .then(() => {
                                Log.create({
                                    targetHandle: req.body.handle,
                                    userHandle: req.session.handle,
                                    operation: Log.REMOVE_SUPERUSER,
                                }).catch(console.error);
                                return res.json({ success: true });
                            })
                            .catch((ex) => {
                                return res.error({ success: false, error: ex.message });
                            });
                    }
                })
                .catch(ex => Utils.recordError(ex));
        }
    }
}
