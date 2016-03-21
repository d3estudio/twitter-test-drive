import mongoose from 'mongoose';

const logSchema = mongoose.Schema({
    targetHandle: { type: String, required: true },
    userHandle: { type: String, required: false },
    impersonated: { type: Boolean, required: true, default: false },
    operation: { type: String, required: true },
    extra: { type: Object, required: false, default: null }
});

logSchema.statics.ofType = function(operation) {
    return this.find({ operation });
}

logSchema.statics.DOWNLOAD = 'download';
logSchema.statics.CHANGE_SECRET_KEY = 'changeSecretKey';
logSchema.statics.ADD_SUPERUSER = 'addSuperuser';

export default mongoose.model('Log', logSchema);
