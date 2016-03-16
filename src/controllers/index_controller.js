import Utils from '../utils';
import Inquiry from '../models/inquiry';

export default class IndexController {
    static automaker(req, res) {
        if(!req.params.automaker) {
            return res.status(400).send('Invalid request.');
        }
        res.render('automaker.html', {
            automaker: req.params.automaker
        });
    }

    static create(req, res) {
        var validators = {
            handle: {
                validator: (handle) => /^@?(\w){1,15}$/.test(handle),
                message: 'Insira um nome de usuário válido'
            },
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

        var errors = [],
            responseObject = {
                errors: errors,
                automaker: req.params.automaker
            };
        Object.keys(validators)
            .forEach(k => {
                responseObject[k] = req.body[k];
                if(!validators[k].validator(req.body[k])) {
                    errors.push(validators[k].message);
                }
            });

        if(errors.length) {
            return res.render('automaker.html', responseObject);
        } else {
            return Inquiry.create(responseObject)
                .then(() => {
                    return res.render('automaker.html', { success: true });
                })
                .catch((ex) => {
                    console.log(ex);
                    responseObject.errors.push('Ocorreu um erro ao processar a solicitação.');
                    return res.render('automaker.html', responseObject);
                })
        }
    }
}
