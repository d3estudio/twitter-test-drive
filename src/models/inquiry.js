import mongoose from 'mongoose'

const inquirySchema = mongoose.Schema({
    handle:     { type: String, required: true },
    name:       { type: String, required: true },
    document:   { type: String, required: true },
    email:      { type: String, required: true },
    campaign:   { type: String, required: true },
    location:   { type: String, required: true }
});

export default mongoose.model('Inquiry', inquirySchema);
