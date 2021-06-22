import mongoose from 'mongoose';

const shippingAddressSchema = new mongoose.Schema(
  {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      firstName: { type: String},
      lastName: { type: String},
      address: { type: String},
      city: { type: String},
      postalCode: { type: Number},
      email: { type: String},
  },
  {
    timestamps: true,
  }
);
const ShippingAddress = mongoose.model('ShippingAddress', shippingAddressSchema);
export default ShippingAddress;
