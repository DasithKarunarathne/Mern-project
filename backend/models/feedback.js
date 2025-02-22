const mongoose = require ("mongoose");

const feedbackSchema = new mongoose.Schema({

firstname:{
    type:String,
    required:true,
}, 
lastname:{
    type:String,
     required:true,
},
email: { type: String, required: true, match: /.+\@.+\..+/ },
message:{
    type:String,
    required:true,
},
}
);

module.exports = Feedback = mongoose.model("feedback", feedbackSchema);