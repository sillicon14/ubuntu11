import express from 'express';
import User from '../models/userModel.js';
import {isAuth} from "../middleWare/auth.js";
import ShippingAddress from '../models/shippingAddressModel.js';

const shippingAddressRouter = express.Router();
/** 
 * API: localhost:3000/api/shippingAddress/:userId/
 *To add shipping address for user
 *Params: firstName, lastName, address, city, postalCode, email
 */
shippingAddressRouter.post(
    '/:userId/', isAuth, (req, res) => {
        User.findById(req.params.userId, function (err, user) {
            if (user) {
                const shippingAddress = new ShippingAddress({
                    user: req.params.userId,
                    postalCode: req.body.postalCode,
                   firstName: req.body.firstName,
                   lastName: req.body.lastName ,
                   address: req.body.address ,
                   city: req.body.city ,
                   email: req.body.email ,
                });
                shippingAddress.save().then((createdShippingAddress) => res.status(201).send({
                    message: 'New Address Added!',
                    shippingAddress: createdShippingAddress
                }));
            } else {
                res.status(400).send({message: 'Address is empty'});
            }
        });
    }
);


/**
 * API: localhost:3000/api/orders/:userId/myorders
 * To view added shippingaddress
 */

shippingAddressRouter.get(
    '/:userId/myShippingAddress', isAuth, (req, res) => {
        ShippingAddress.find({user: req.params.userId}, function (err, shippingAddress) {
            res.send(shippingAddress);
        });
    }
);


/**
 * API: localhost:3000/api/shippingaddress/:id
 * To get particular users shipping address 
 */

shippingAddressRouter.get(
    '/:id', isAuth, (req, res) => {
        ShippingAddress.findById(req.params.id).then((err, shippingAddress) => {
            if (shippingAddress) {
                res.send(shippingAddress);
            } else {
                res.status(404).send({message: 'Address Not Found'});
            }
        });
    }
);

/**
 * API: localhost:3000/api/orders/:id/addShippingAdress
 * To edit Shipping address information
 * Params: fullName, address, city, postal code, country
 */

shippingAddressRouter.put('/:id', isAuth, (req, res) => {
    shippingAddress.findById(req.params.id, {}, {}, function (err, shippingAddress) {
        if (shippingAddress) {
            shippingAddress.postalcode = req.body.postalcode;
            shippingAddress.firstName= req.body.firstName,
            shippingAddress.lastName= req.body.lastName ,
            shippingAddress.address= req.body.address ,
            shippingAddress.city= req.body.city ,
            shippingAddress.email= req.body.email 
            const updatedAddress = shippingAddress.save();
            res.send({message: 'Added Shipping Address', order: updatedOrder});
        } else {
            res.status(404).send({message: 'Order Not Found!'});
        }
    });
});

export default shippingAddressRouter;
