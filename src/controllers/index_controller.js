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
