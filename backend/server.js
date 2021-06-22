import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from "cookie-parser";
import productRouter from './routers/productRouter.js';
import userRouter from './routers/userRouter.js';
import orderRouter from './routers/orderRouter.js';
import cartRouter from './routers/cartRouter.js';
import shippingAddressRouter from './routers/shippingAddressRouter.js';
import conformation from './routers/conformation.js';

import shortid from 'shortid'
import Razorpay from 'razorpay'
//import axios from 'axios'
import cors from 'cors'
import bodyParser from 'body-parser'
import crypto from 'crypto'
/* const shortid = require('shortid')
const Razorpay = require('razorpay') */

const app = express();

app.use(cors())
app.use(bodyParser.json())

const razorpay = new Razorpay({
	key_id:'rzp_test_8mtVT1x94JsEtr',
	key_secret:'9avhIoqLppJqdAw0zgPG3L0B'
})

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin : ["http://localhost:5000"],
    credentials: true,
}))
app.use(cookieParser())

//database connection

mongoose.connect('mongodb+srv://Spoorthy:Suman@cluster0.p7c36.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}, function(err) {
    if (err) console.log(err)
    else console.log('DB Connected!')
});


app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/carts', cartRouter);
app.use('/api/shippingAddress', shippingAddressRouter);
app.use('/api/confirmation', conformation);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use((err, req, res, next) => {
    res.status(500).send({message: err.message});
});

//logo used in razorpay
app.get('/symbol.png', (req, res) => {
	res.sendFile(path.join(__dirname, 'symbol.png'))
})

app.post('/verification', (req, res) => {
	// do a validation
	const secret = 'ThisisforRazorpay'

	console.log(req.body)

	//const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		//require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
	} else {
		// pass it
	}
	res.json({ status: 'ok' })
})


app.post('/razorpay', async (req, res) => {
	const payment_capture = 1
	const amount = 5
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})


const port = process.env.PORT || 5000;
//server port localhost 5000

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
