import Inquiry from '../models/inquiry';
import SecretKey from '../models/secret_key';
import * as Promise from 'bluebird';
import json2csv from 'json2csv';

export default class AdminController {
    static index(req, res) {
        if(!req.session.handle) {
            return res.redirect('/session');
        }
        var viewData = {
            handle: req.session.handle,
            secretKey: req.session.secretKey,
            isSuperUser: req.session.isSuperUser,
            handles: { },
            handleKeys: []
        };

        var filter = { handle: req.session.handle },
            next = 'admin/index.html';

        if(req.session.isSuperUser) {
            filter = {};
            next = 'admin/superadmin.html';
        }

        Inquiry.find(filter)
            .distinct('handle')
            .then((handles) => {
                handles.forEach(h => {
                    viewData.handles[h] = Inquiry.find({ handle: h }).distinct('campaign');
                });
                Promise.props(viewData.handles)
                    .then(handles => {
                        viewData.handles = handles;
                        viewData.handleKeys = Object.keys(viewData.handles);
                        return res.render(next, viewData);
                    });
            });
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
            prom =
        }





        if(req.session.isSuperUser) {
            filter.handle = req.params.handle;
        }

        if(req.params.campaign.toLowerCase() === 'all') {
            delete filter['campaign'];
        }

        Inquiry.find(filter, { handle: 0, _id: 0, __v: 0 })
            .then((docs) => {
                if(req.params.type === 'json') {
                    return res.json(docs);
                } else {
                    var fields = ['name', 'document', 'email', 'handle'];
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
            });
    }
}
