import mongoose from 'mongoose';

//Schema for Users
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified : {type : Boolean},
    cartId : {type : String, required: false},
    isAdmin: { type: Boolean, default: false},
  }
);
const User = mongoose.model('User', userSchema);
export default User;
