const mongoose = require ('mongoose')

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&‘*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const orderSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "in process"]
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }
  }],
  street: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: [EMAIL_PATTERN, 'not valid email pattern']
  },
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true
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


const Order = mongoose.model('Order', orderSchema)
module.exports = Order