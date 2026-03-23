import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";// generate and handle token
import bcrypt from "bcrypt" 


const userSchema = new Schema({ 
  username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
  avatar: {
      type: String, //cloudinary url
      required: true,
    },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
      'Please enter a valid email address'
    ]
  },

  phone: {
    type: String,
    trim: true,
    required: [true, 'Phone number is required'],
    match: [
      /^(?:\+977|01|9[78]\d{8})$|^$/,
      'Please enter a valid Nepali phone number'
    ]
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },

  role: {
    type: String,
    enum: ['customer', 'admin', 'owner'],
    default: 'customer',
    required: true
  },

address: {
    province: {
      type: String,
      enum: [
        'Province No. 1', 'Province No. 2', 'Bagmati', 'Gandaki',
        'Lumbini', 'Karnali', 'Sudurpashchim'
      ],
      default: 'Lumbini'   
    },

    district: {
      type: String,
      trim: true,
      default: 'Rupandehi'   // Butwal-specific default
    },

    municipality: {
      type: String,
      trim: true,
    },

    wardNumber: {
      type: Number,
      min: 1,
      max: 35  
    },

    tole: {
      type: String,
      trim: true,
    },
  },


  license_number: {
    type: String,
    trim: true,
    sparse: true,          // allows multiple null values (important for uniqueness)
    unique: true,          // only one user can have the same license number
    // required only for drivers / certain customers → handle in business logic
  },
  refreshToken: {
      type: String,
    },

  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,          // automatically adds updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// `pre` is a Mongoose middleware function that runs before a certain action (like saving) is performed on the document.
// We use `async` because encryption is an asynchronous operation that may take some time to complete.

// Arrow functions do not have their own this context; 
// they inherit this from the surrounding lexical context. In Mongoose middleware, the this keyword needs to refer to the document being saved or processed. 
// Therefore, a regular function (not an arrow function) should be used to correctly bind this to the Mongoose document.


//this below code is to check whether the password is modified or not if modified then password is hashed before saving 
userSchema.pre("save", async function () {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }    
} )


// userSchema.methods.isPasswordCorrect = async function (password) {
//   // here this in this.password refers to the instance of the User model on which the method is called.
//     return await bcrypt.compare(password, this.password) // it return either true or false
// }

userSchema.methods.isPasswordCorrect = async function(password) {
  console.log("hash in DB:", this.password);
  // if (!password || !this.password) return false; // prevent bcrypt error
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (){
   return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this.id,      
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema); // in mongodb, User is saved as 'users'
