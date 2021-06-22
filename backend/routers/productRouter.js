import express from 'express';
import data from '../data.js';
import Product from '../models/productModel.js';
import {isAuth,isAdmin} from "../middleWare/auth.js";

const productRouter = express.Router();



productRouter.get(
    '/', (req, res) => {
        const name = req.query.name || '';
        const category = req.query.category || '';
        const brand = req.query.brand || '';
        const rating = req.query.rating && Number(req.query.rating) !== 0 ? Number(req.query.rating) : 0;
        const nameFilter = name ? {name: {$regex: name, $options: 'i'}} : {};
        const brandFilter = brand ? {brand} : {};
        const categoryFilter = category ? {category} : {};
        const ratingFilter = rating ? {rating: {$gte: rating}} : {};
        Product.find({
            ...brandFilter,
            ...nameFilter,
            ...categoryFilter,
            ...ratingFilter
        }).then((products)=> res.send(products));
    }
);


/**
 * API: localhost:3000/api/products/categories
 * To get the diffrent categories of the products added
 * params: categories, ID
 */

productRouter.get(
    '/categories', (req, res) => {
        Product.find().distinct('category').then((categories)=>res.send(categories));
    }
);


/**
 * API: localhost:3000/api/products/populateProducts
 * To get the list of all the populated products
 
 */

productRouter.get(
    '/populateProducts', (req, res) => {
        const products = data.products.map((product) => ({
            ...product
        }));
        Product.insertMany(products).then((createdProducts)=>res.send(createdProducts));
    }
);


/**
 * API: localhost:3000/api/products/:id
 * To get the product by its product_ID
 * params:productID
 */

productRouter.get(
    '/:id', (req, res) => {
        Product.findById(req.params.id,{},{},function (err,product){
            if (product) {
                res.send(product);
            } else {
                res.status(404).send({message: 'Product Not Found'});
            }
        });
    }
);


/**
 * API: localhost:3000/api/products/
 * Admin To Add new product
 * Params: name, image, price,category,brand,countInStock,rating,numReviews,description
 */

 productRouter.post(
    '/', isAuth, isAdmin, (req, res) => {
        const product = new Product({
            name: req.body.name,
            image: req.body.image,
            price: req.body.price,
            category: req.body.category,
            brand: req.body.brand,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            description: req.body.description,
        });
        product.save().then((createdProduct)=> res.send({message: 'Product Created', product: createdProduct}));
    }
);


/**
 * API: localhost:3000/api/products/:id
 * Admin To update product information
 * Params: name, image, price,category,brand,countInStock,rating,numReviews,description
 */

 productRouter.put(
    '/:id', isAuth, isAdmin, (req, res) => {
        const productId = req.params.id;
        Product.findById(productId,{},{},function(err,product){
            if (product) {
                product.name = req.body.name;
                product.price = req.body.price;
                product.image = req.body.image;
                product.category = req.body.category;
                product.brand = req.body.brand;
                product.countInStock = req.body.countInStock;
                product.description = req.body.description;
                product.save().then((updatedProduct)=>res.send({message: 'Product Updated', product: updatedProduct}));
            } else {
                res.status(404).send({message: 'Product Not Found'});
            }
        });
    }
);

/**
 * API: localhost:3000/api/products/:id
 * Admin To delete product 
 */

 productRouter.delete(
    '/:id', isAuth, isAdmin, (req, res) => {
        const product = Product.findById(req.params.id,{},{},function(err,product){
            if (product) {
                product.remove().then((deleteProduct)=>res.send({message: 'Product Deleted', product: deleteProduct}));
            } else {
                res.status(404).send({message: 'Product Not Found'});
            }
        });
    }
);

/**
 * API: localhost:3000/api/products/:id/reviews
 * To add review to the products
 * Params: name, rating,comment
 */

 productRouter.post(
    '/:id/reviews', isAuth, (req, res) => {
        const productId = req.params.id;
        Product.findById(productId,{},{},function(err,product){
            if (product) {
                if (product.reviews.find((x) => x.name === req.user.name)) {
                    return res
                        .status(400)
                        .send({message: 'You already submitted a review'});
                }
                const review = {
                    name: req.user.name,
                    rating: Number(req.body.rating),
                    comment: req.body.comment,
                };
                product.reviews.push(review);
                product.numReviews = product.reviews.length;
                product.rating =
                    product.reviews.reduce((a, c) => c.rating + a, 0) /
                    product.reviews.length;
                product.save().then((updatedProduct)=>{
                    res.status(201).send({
                        message: 'Review Created',
                        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
                    });
                });
            } else {
                res.status(404).send({message: 'Product Not Found'});
            }
        });
    }
);

export default productRouter;
