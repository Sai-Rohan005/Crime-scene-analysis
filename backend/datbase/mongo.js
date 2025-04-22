let mongoose=require('mongoose');

mongoose.connect("mongodb://localhost:27017/differentcases",{useNewUrlParser:true,useUnifiedTopology:true});

const authourised=new mongoose.Schema({
    username:{
        type:String,
    },
    createdon:{
        type:Date
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String
    },
    reports:[]

})
const structure=mongoose.model('user',authourised);

module.exports=structure;