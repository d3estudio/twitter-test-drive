import mongoose from 'mongoose'
import Inquiry from './inquiry'

const campaignSchema = mongoose.Schema({
    handle:                 { type: String, required: true },
    name:                   { type: String, required: true },
    slug:                   { type: String, required: true },
    description:            { type: String, required: true },
    fields:                 { type: Array, required: true },
    momentsUrl:             { type: String, required: false },
    confirmationMessage:    { type: String, required: true },
    conversionUrl:          { type: String, required: false }
});

campaignSchema.methods.getAllInquiries = function() {
    return Inquiry.find({ handle: this.handle, campaign: this.id });
}

export default mongoose.model('Campaign', campaignSchema);
