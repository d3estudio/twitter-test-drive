import mongoose from 'mongoose'

const superUserSchema = mongoose.Schema({
    handle:     { type: String, required: true, index: { unique: true } },
    parent:     { type: String, required: true }
});

superUserSchema.statics.isSuperUser = function(handle) {
    return this.count({ handle: handle })
        .then(c => c == 1);
}

export default mongoose.model('SuperUser', superUserSchema);
