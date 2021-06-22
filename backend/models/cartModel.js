import mongoose from 'mongoose';

// cart schema

const cartSchema = new mongoose.Schema({
    cartItems: [
        {
            //product parameters are considered
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
            image : {type : String, required: false},
            countInStock: { type: Number,required: false},
            rating: { type: Number,required: false},
            numReviews:{ type: Number,required: false},
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cart',
                required: true,
            },
        },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;