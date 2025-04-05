import mongoose from "mongoose";


export async function submitForm(request , response)
{
    let {name , email , mobile , issue} = request.body;

    mobile = Number(mobile)

    console.log(request.body)
    

    try 
    {
        const form = new ContactUsModel({
            name,email,mobile,issue
        });

        // Save the survey to the database
        await form.save();

        return response.json({
            message: "response added successfully",
            success: true,
            error: false,
        })
    }
    catch(err)
    {
        return response.json({
            message: "response not added",
            success: false,
            error: true,
            reson:err.message
        })
    }
}

export async function getAllForms(request , response)
{
    try
    {
        const data = await ContactUsModel.find();
        // console.log(data)

        return response.json({
            message: "data retrived successfully",
            data,
            success: true,
            error: false,
        })
    }
    catch(err)
    {
        return response.json({
            message: "failure at server",
            success: false,
            error: true,
            reason:err.message
        })
    }
}

export async function deleteTicket(request , response)
{
    const _id = request.body.id
    try
    {
        const deleteTicket = await ContactUsModel.deleteOne({_id : _id });

        response.json({
            message:deleteTicket,
            success:true,
            error:false
        })
    }
    catch(err)
    {
        response.status(500).json({
            message:"failed to delete product.",
            success:false,
            error:true,
            reason:err.message
        })
    }
}


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
export default ContactUsModel;