const mongoose = require ('mongoose')

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&‘*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const orderSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    ref: "Shop"
  },
  status: {
    type: String,
    enum: ["pending", "completed", "in process"],
    default: "pending"
  },
  number: {
    type: String,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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
  },
  price: {
    type: String
  },
  amounts: [{
    type: Number,
  }],
  sizes: [{
    type: String,
  }],
  currency: {
    type: String,
    default: "EUR",
    enum: ["EUR","USD"]
   },
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