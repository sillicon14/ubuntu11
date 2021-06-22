import bcrypt from 'bcryptjs';

const data = {
//users information
    users: [
        {
            name: 'Spoorthy',
            email: 'Spoo@example.com',
            password: bcrypt.hashSync('1234', 8)
        },
        {
            name: 'Suman',
            email: 'sumann@example.com',
            password: bcrypt.hashSync('1235', 8)
        },
    ],
    products: [
        {
            //Product details
            name: 'Membrane-keypad',
            category: 'Sensor Kits',
            image: '/images/membrane-keypad.jpg',
            price: 70,
            brand: ' Flipkart',
            rating: 4.5,
            numReviews: 8,
            countInStock:6
        },

        {
            name: 'Raspberry Pi',
            category: 'Sensor Kits',
            image: '/images/RPI4-MODBP-1GB_DSL.jpg',
            price: 70,
            brand: ' Flipkart',
            rating: 4.5,
            numReviews: 8,
            countInStock:6
        },

        {
            name: '8051 Microcontroller Trainer',
            category: 'Sensor Kits',
            image: '/images/8051-microcontroller-trainer.jpg',
            price: 70,
            brand: ' Flipkart',
            rating: 4.5,
            numReviews: 8,
            countInStock:6
        },

        {
            name: 'Ultra sonic sensor',
            category: 'Sensor Kits',
            image: '/images/ultra-sonic-sensor.jpg',
            price: 50,
            brand: ' Flipkart',
            rating: 4.2,
            numReviews: 5,
            countInStock:6
        },

        {
            name: 'LCD Controller Board',
            category: 'Sensor Kits',
            image: '/images/LCD_Controller_Board.jpg',
            price: 60,
            brand: ' Flipkart',
            rating: 4.5,
            numReviews: 10,
            countInStock:6
        },

        {
            name: 'Breadboard',
            category: 'Sensor Kits',
            image: '/images/Breadboard.jpg',
            price: 70,
            brand: ' Flipkart',
            rating: 4.5,
            numReviews: 8,
            countInStock:6
        }, {
            name: 'Arduino Uno',
            category: 'Sensor Kits',
            image: '/images/d1.jpg',
            price: 70,
            brand: ' Flipkart',
            rating: 4.5,
            numReviews: 8,
            countInStock:6
        },

        {
            name: 'Grond humidity sensor',
            category: 'Sensor Kits',
            image: '/images/Ground-humidity-sensor-module.jpg',
            price: 70,
            brand: ' Flipkart',
            rating: 4.5,
            numReviews: 8,
            countInStock:6
        },
    ]
};
export default data;
