import mongoose from 'mongoose';
import Settings from './settings';

const secretKeySchema = mongoose.Schema({
    handle:     { type: String, required: true, index: { unique: true } },
    secretKey:  { type: String, required: true, index: { unique: true } }
});

secretKeySchema.pre('validate', function(next) {
    if(!this.secretKey || !this.secretKey.length) {
        var dict = 'abcdefghjkmnpqrstuvwyxzABCDEFGHJKMNPRSTUVWYXZ23456789!@#$%^&*()'.split('');
        var sec = [];
        for(var i = 0; i < Settings.sharedInstance().secretKeyLength; i++) {
            sec.push(dict[Math.floor(Math.random() * dict.length)]);
        }
        this.secretKey = sec.join('');
        console.log('secretKey set: ', this.secretKey);
    }
    next();
});

secretKeySchema.statics.getOrCreateForHandle = function(handle) {
    return this.findOne({ handle })
        .then(doc => {
            if(!doc) {
                return this.create({ handle })
            } else {
                return doc;
            }
        });
};

export default mongoose.model('SecretKey', secretKeySchema);
