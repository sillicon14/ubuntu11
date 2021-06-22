import express from "express";

import User from '../models/userModel.js';

import jwt from "jsonwebtoken";

const conformation = express.Router();

conformation.get("/:token", async (req, res) => {

    try {
        const token = req.params.token

        const verify = jwt.verify(token, process.env.JWT_SECRET || 'somethingsecret')

        const db = await User.updateOne({_id: verify.userId}, {verified: true})
        console.log(db)
     res.redirect('http://localhost:3000/thankYou')
    } catch (err) {
        res.status(401).send("error")

    }

})


export default conformation