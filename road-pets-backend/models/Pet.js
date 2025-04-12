import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    petbirthday: {
        type: String,
        required: true
    },
    pettype: {
        type: String,
        required: true
    },
   
    images: [{
        type: String,  
        required: true
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Pet', petSchema);