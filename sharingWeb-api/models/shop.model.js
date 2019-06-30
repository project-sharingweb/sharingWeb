const mongoose = require ('mongoose')
const bcrypt = require ('bcrypt')
const SALT_FACTOR = 10;

const URL_PATTERN   = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&‘*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PASS_PATTERN  = /^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])))/;

const modifyName = (name) => {
    name = name.split("")
    name = name.map(item => {
        if(item === " ") return "-"
        else return item
    })
    name = name.join("")
    console.log(name)
    return name;
}

const shopSchema = new mongoose.Schema({
    email: {
        type: String,
        match: [EMAIL_PATTERN, 'Invalid name pattern'],
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        match: [PASS_PATTERN, 'Invalid name pattern']
    },
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    aboutUs: {
        type: String,
    },
    moto: {
        type: String,
        maxlength: 144,
    },
    contact: {
        type: String,
    },
    locations: {
        type: {
            type: String
        },
        coordinates: [Number]
    },
    styles: {
        logo: {
            type: String,
            match: [URL_PATTERN, 'Invalid URl pattern']
        },
        bgImage: {
            type: String,
            match: [URL_PATTERN, 'Invalid URl pattern'],
            default: "https://outven.net/wp-content/uploads/2018/09/outven-background-landing-usa.jpg"
        },
        nav: {
            type: String,
            default: {
                backgroundcolor: "White",
            } 
        }
    }
    }, {timestamps: true, toJSON:{
       virtuals: true,
       transform: (doc, ret ) => {
           ret.id = ret._id;
           delete ret._id;
           delete ret.password;
           delete ret.__v
           return ret;
       }
    }

})

shopSchema.pre('save', function(next){
    const shop = this
    shop.name = modifyName(shop.name)
    if(shop.isModified("password")){
        bcrypt.genSalt(SALT_FACTOR)
            .then (salt => {
                return bcrypt.hash(shop.password, salt)
                    .then(hash => {
                        shop.password=hash
                        next()
                    })
            })
            .catch(next)
    }
    else{
        next()
    }
})

shopSchema.methods.checkPassword = function(password){
   return bcrypt.compare(password, this.password);
}

const Shop = mongoose.model('Shop', shopSchema)
module.exports = Shop