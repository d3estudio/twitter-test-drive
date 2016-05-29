import mongoose from 'mongoose'

const momentSchema = mongoose.Schema({
    campaign:       { type: String, required: false, default: null },
    url:            { type: String, required: false },
    handle:         { type: String, required: true },
    extra_fields:   { type: String, required: false }
});

momentSchema.statics.momentForCampaign = function(campaign, handle) {
    return this.findOne({ handle, campaign })
        .then((result) => {
            if(!result) {
                return this.findOne({ handle, campaign: null })
            } else {
                return result;
            }
        })
        .then(r => r ? { url: r.url, extra_fields: r.extra_fields } : '');
}

momentSchema.statics.defaultMomentForHandle = function(handle) {
    return this.findOne({ handle, campaign: null })
        .then(r => r ? { url: r.url, extra_fields: r.extra_fields } : '');
}

export default mongoose.model('Moment', momentSchema);
