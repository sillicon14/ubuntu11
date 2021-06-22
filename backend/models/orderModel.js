import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
      orderItems: [
          {
              name: { type: String, required: true },
              qty: { type: Number, required: true },
              price: { type: Number, required: true },
              product: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'Cart',
                  required: true,
              },
          },
      ],
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingAddress', required: false},
    itemsPrice: { type: Number},
    totalPrice: { type: Number},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model('Order', orderSchema);
export default Order;

