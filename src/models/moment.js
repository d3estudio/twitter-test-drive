import mongoose from 'mongoose'

const momentSchema = mongoose.Schema({
    handle:     { type: String, required: true },
    url:       { type: String, required: true },
});

export default mongoose.model('Moment', momentSchema);
