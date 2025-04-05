import mongoose from "mongoose";

const ContactUsSchema = new mongoose.Schema({
    name : {
        type : String,
        default : ""
    },
    email : {
        type : String,
        default : ""
    },
    issue : {
        type : String,
        default : ""
    }, 
    mobile : {
        type : Number,
        default : null
    }
},{
    timestamps : true
})

const ContactUsModel = mongoose.model('contactus',ContactUsSchema)

export default ContactUsModel