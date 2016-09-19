import Inquiry from '../models/inquiry';
import Campaign from '../models/campaign';
import Moment from '../models/moment';
import SecretKey from '../models/secret_key';
import SuperUser from '../models/superuser';
import Log from '../models/log';
import * as Promise from 'bluebird';
import json2csv from 'json2csv';
import Utils from '../utils';
import slug from 'slug';

export default class AdminController {
    static listCampaigns(req, res) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }

        let user = req.session.isSuperUser && req.params.handle ? req.params.handle : req.session.handle;
        const viewBag = Utils.generateAdminViewBag(req, { targetHandle: user });

        return Campaign.find({ handle: user })
            .then(camps => {
                viewBag.campaigns = camps.map(c => {
                    const path = [user, c._id.toString(), c.slug];
                    c.url = `${req.protocol}://${req.get('host')}/${path.join('/')}`
                    return c;
                });
                return res.render('admin/detail.html', viewBag);
            });
    }

    static listHandles(req, res) {
        const viewBag = Utils.generateAdminViewBag(req);

        return Campaign
            .find()
            .distinct('handle')
            .then(result => {
                viewBag.handles = result;
                return res.render('admin/superadmin.html', viewBag);
            });
    }

    static downloadAllJson(req, res) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }

        const user = req.session.isSuperUser && req.params.handle ? req.params.handle : req.session.handle;
        return Campaign.find({ handle: user })
            .then(campaigns => {
                const result = {};
                campaigns.forEach(c => { result[c.slug] = c.getAllInquiries(); });
                return Promise.props(result);
            })
            .then(items => {
                Object.keys(items)
                    .forEach(k => { items[k] = items[k].map(i => i.toJsonStructure()); });
                return res.json(items);
            });
    }

    static download(req, res, next) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }

        const user = req.session.isSuperUser && req.params.handle ? req.params.handle : req.session.handle;
        const campaign = req.params.campaign.toLowerCase();
        const format = req.params.format.toLowerCase();

        console.log(user, campaign, format);

        if(campaign === 'all' && format == 'csv') {
            return res.status(400).send('Cannot download "all" using CSV as a format.');
        }

        return Campaign
            .findOne({ handle: user, _id: campaign })
            .then(c => {
                if(!c) {
                    return Promise.reject({ code: 404, message: 'Campaign not found' });
                }

                return c.getAllInquiries();
            })
            .then(c => c.map(i => i.toJsonStructure()))
            .then(structs => {
                const format = req.params.format;
                if(format === 'csv') {
                    res.set('Content-Type', 'text/plain');
                    if(structs.length < 1) {
                        return res.send('');
                    } else {
                        json2csv({
                            data: structs,
                            fields: Object.keys(structs[0])
                        }, (err, csv) => {
                            if(err) {
                                console.log('[Download] CSV Conversion failed:');
                                console.error(err);
                                console.log('');
                                return res.status(500).send('Internal server error.');
                            }
                            return res.send(csv);
                        })
                    }
                } else {
                    return res.json(structs);
                }
            })
            .catch(ex => {
                return res.status(ex.code).send(ex.message);
            });
    }

    static index(req, res) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }

        if (req.session.isSuperUser) {
            return AdminController.listHandles(req, res);
        } else {
            return AdminController.listCampaigns(req, res);
        }
    }

    static listAdmins(req, res) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }
        if (!req.session.isSuperUser) {
            return res.redirect(`/admin`);
        }

        var viewData = {
            handle: req.session.handle,
            secretKey: req.session.secretKey,
            isSuperUser: req.session.isSuperUser,
            users: []
        };

        SuperUser.find({}, {
                parent: 0,
                _id: 0,
                __v: 0
            })
            .then((arr) => {
                viewData.users = arr;
                return res.render('admin/manager.html', viewData);
            })
            .catch(ex => Utils.recordError(ex));
    }

    static addAdmin(req, res) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }
        if (!req.session.isSuperUser) {
            return res.redirect('/admin');
        }

        if (!req.body.handle) {
            return res.json({
                success: false,
                error: 'Missing handle.'
            });
        } else {
            SuperUser.findOne({
                    handle: req.body.handle
                })
                .then((u) => {
                    if (u) {
                        return res.json({
                            success: true,
                            handle: u.handle
                        })
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
                            return res.json({
                                success: true,
                                handle: u.handle
                            });
                        }).catch((ex) => {
                            return res.json({
                                success: false,
                                error: ex.message
                            });
                        });
                    }
                })
                .catch(ex => Utils.recordError(ex));
        }
    }

    static removeAdmin(req, res) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }
        if (!req.session.isSuperUser) {
            return res.redirect('/admin');
        }

        if (!req.body.handle) {
            return res.json({
                success: false,
                error: 'Missing handle.'
            });
        } else {
            SuperUser.findOne({
                    handle: req.body.handle
                })
                .then((u) => {
                    if (!u) {
                        return res.json({
                            success: false,
                            error: 'Handle not found.'
                        });
                    } else {
                        u.remove()
                            .then(() => {
                                Log.create({
                                    targetHandle: req.body.handle,
                                    userHandle: req.session.handle,
                                    operation: Log.REMOVE_SUPERUSER,
                                }).catch(console.error);
                                return res.json({
                                    success: true
                                });
                            })
                            .catch((ex) => {
                                return res.error({
                                    success: false,
                                    error: ex.message
                                });
                            });
                    }
                })
        }
    }

    static newCampaign(req, res) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }

        const user = req.session.isSuperUser && req.params.handle ? req.params.handle : req.session.handle;
        const viewBag = Utils.generateAdminViewBag(req, { targetHandle: user });
        return res.render('admin/create.html', viewBag);
    }

    static newCampaignCommit(req, res) {
        if (!req.session.handle) {
            return res.redirect('/session');
        }

        const user = req.session.isSuperUser && req.params.handle ? req.params.handle : req.session.handle;
        const viewBag = Utils.generateAdminViewBag(req, { targetHandle: user });
        const formData = JSON.parse(req.body.formData);
        Object.assign(viewBag, formData);
        if(formData.fields.length < 1) {
            viewBag.errors = ['You must define at least one field!'];
            console.log(viewBag);
            return res.render('admin/create.html', viewBag);
        }

        return Campaign.findOne({ handle: user, name: formData.name })
            .then(c => {
                if(!!c) {
                    viewBag.errors = ['There is already a campaign with the provided name stored for the given handle.'];
                    res.render('admin/create.html', viewBag);
                    return Promise.reject();
                }
                return true;
            })
            .then(() => {
                formData.fields = formData.fields.map(f => {
                    f.fieldName = slug(f.name);
                    return f;
                });
                formData.handle = user;
                formData.slug = slug(formData.name)
                return Campaign.create(formData);
            })
            .then(c => {
                viewBag.success = true;
                var path = [user, c.id.toString(), c.slug];
                viewBag.campaignUrl = `${req.protocol}://${req.get('host')}/${path.join('/')}`;
                return viewBag;
            })
            .then(bag => res.render('admin/create.html', viewBag))
            .catch(ex => console.log(ex));
    }
}
