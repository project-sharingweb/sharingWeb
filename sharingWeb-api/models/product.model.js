const mongoose = require ('mongoose')

const URL_PATTERN   = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;


const productSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    lowercase: true,
    required: true,
  }, 
  name: {
     type: String,
     required: true,
   },
   description: {
     type: String,
     required: true,
   },
   price: {
     type: Number,
     min: 0,
     required: true,
   },
   image: {
     type: String,
     match: [URL_PATTERN, 'Not valid url pattern'],
     default: "https://webstore.iea.org/content/images/thumbs/default-image_450.png"
   }
   }, {timestamps: true, toJSON:{
       virtuals: true,
       transform: (doc, ret ) => {
           ret.id = ret._id;
           delete ret._id;
           delete ret.__v
           return ret;
       }
   }
})


const Product = mongoose.model('Product', productSchema)
module.exports = Product