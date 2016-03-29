import mongoose from 'mongoose'

const momentSchema = mongoose.Schema({
    campaign:   { type: String, required: false, default: null },
    url:        { type: String, required: true },
    handle:     { type: String, required: true },
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
        .then(r => r ? r.url : '');
}

momentSchema.statics.defaultMomentForHandle = function(handle) {
    return this.findOne({ handle, campaign: null })
        .then(r => r ? r.url : '');
}

export default mongoose.model('Moment', momentSchema);
