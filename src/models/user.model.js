import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({

    username: {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email: {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName: {
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar: {
        type:String, //URL THATS WHY
        required:true,
    },
    coverImage: {
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true, "password is required"]
    },
    refreshToken: {
        type:String
    },
},
    {
        timestamps:true
    }
)

//* hooks - special middlewares or methods that help us to hook into a specific stage of our schema
//next time i use this model/document this will run automatically before saving into DB
userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt )
    next()
})

// 
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )    
}

userSchema.methods.generateRefreshToken = function () {
    jwt.sign(
        {
            _id: this._id,
        }
    )
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
}

export const User = mongoose.model("User",userSchema);