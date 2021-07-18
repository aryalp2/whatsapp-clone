import mongoose from "mongoose";

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: {type: Date, default: Date.now},
    received: Boolean
})

export default mongoose.model('messagecontents', whatsappSchema);