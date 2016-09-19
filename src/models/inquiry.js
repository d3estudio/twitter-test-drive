import mongoose from 'mongoose'

const inquirySchema = mongoose.Schema({
    campaign: String,
    handle: String,
    data: Object
});

inquirySchema.methods.toJsonStructure = function() {
    // By not this method does nothing, but we will keep it here
    // in case we need to apply any transform in it.
    return this.data;
}

export default mongoose.model('Inquiry', inquirySchema);
