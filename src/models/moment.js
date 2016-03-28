import mongoose from 'mongoose'

const momentSchema = mongoose.Schema({
    campaign:     { type: String, required: false },
    url:       { type: String, required: true },
    handle:       { type: String, required: true },
});

export default mongoose.model('Moment', momentSchema);
