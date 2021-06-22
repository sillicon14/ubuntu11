import express from 'express';
import Cart from '../models/cartModel.js';
import {isAuth} from "../middleWare/auth.js";
import User from "../models/userModel.js";

const cartRouter = express.Router();

/**
 * API: localhost:3000/api/carts/:cartId
 * To search cart by cart_Id
 * params: cartID
 */

cartRouter.get('/:cartId',isAuth, (req, res) => {
        Cart.find({_id: req.params.cartId}, function (err, cart) {
            if (cart) {
                res.send(cart);
            } else {
                res.send('Cannot find the cart!')
            }
        });
    }
);

/**
 * API: localhost:3000/api/carts/:cartId
 * To get cart for a user
 */

cartRouter.get('/myCart/:userId', isAuth,(req, res) => {
    Cart.find({userId: req.params.userId}, function (err, cart) {
        if (cart) {
            res.send(cart);
        } else {
            res.send('Cannot find the cart!')
        }
    });
}
);

/**
 * API: localhost:3000/api/carts/
 * To get the list of carts created by all the users
 */

cartRouter.get('/', (req, res) => {
        Cart.find({}, function (err, cart) {
            if (cart) {
                res.send(cart);
            } else {
                res.send('Error while fetching the carts!')
            }
        });
    }
);

/**
 * API: localhost:3000/api/carts/:userId/createCart
 * Add cart 
 * Params: name, qty, price, productinfo
 */

cartRouter.post('/:userId/createCart', isAuth,(req, res) => {
    User.findById(req.params.userId, {}, function (err, user) {
        if (user) {
            const cart = new Cart({
                cartItems: req.body.cartItems,
                user: req.params.userId
            })
            cart.save({}, function (err, Cart) {
                if (err) {
                    res.send('Unable to create cart!')
                } else {
                    user.cartId = Cart._id;
                    user.save(function(err){
                        res.send({
                            _id: Cart._id,
                            cartItems: cart.cartItems
                        });
                    })
                }
            });
        } else {
            res.send('Unable to find the user!');
        }
    });
});

/**
 * API: localhost:3000/api/carts/:cartId/addToCart
 * Add new item to the existing cart
 * Params: cartId
 */
cartRouter.post('/:cartId/addToCart',isAuth, (req, res) => {
        Cart.findById(req.params.cartId, {}, {}, function (err, cart) {
            if (cart) {
                const updatedCart = cart.cartItems.concat(req.body.cartItems);
                 cart.cartItems = updatedCart;
                 cart.save().then((updatedCart) => res.send({message: 'Cart Updated', cart: updatedCart}));
            } else {
                res.status(404).send({message: 'Cart Not Found'});
            }
        });
    }
);

/**
 * API: localhost:3000/api/carts/:cartId
 * To update the cartitems
 * Params: cartId
 */

cartRouter.put('/:cartId',isAuth, (req, res) => {
    const cartId = req.params.cartId;
    Cart.findById(cartId, {}, {}, function (err, cart) {
        if (cart) {
            cart.cartItems = req.body.cartItems;
            cart.save().then((updatedCart) => res.send({message: 'Cart Updated', cart: updatedCart}));
        } else {
            res.status(404).send({message: 'Cart Not Found'});
        }
    });
})


/**
 * API: localhost:3000/api/carts/:cartID/:itemID
 * To delete items from cart
 * Params: cartId, itemID
 */

cartRouter.delete('/:cartId/:itemId', isAuth,(req, res) => {
    Cart.findById(req.params.cartId, {}, {}, function (err, cart) {
      if(err){
          res.send('Cart not found!');
      } else {
          let newCartItems = [];
          cart.cartItems.forEach(item=>{
              if(!item._id.equals(req.params.itemId)){
                  newCartItems.push(item);
              }
          });
          cart.cartItems = newCartItems;
          cart.save().then((updatedCart) => res.send({message: 'Item removed from the cart!', cart: updatedCart}));
          /*cart.save({},function (err,cart){
              if(err){
                  res.send('Error deleting the item!');
              } else {
                  res.send('Item removed from the cart!');
              }
          })*/
      }
    })
})

/**
 * API: localhost:3000/carts/:cart
 * To delete cart
 * Params: cartId
 */

cartRouter.delete('/:cartId', isAuth, (req, res) => {
        Cart.deleteOne({_id: req.params.cartId}, function (err) {
            if (err) {
                res.send('Error while deleting the cart!');
            } else {
                res.send('Cart deleted!');
            }
        });
    }
);

export default cartRouter;