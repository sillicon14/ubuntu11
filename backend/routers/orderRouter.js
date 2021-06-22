import express from "express";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import { mailgun, orderEmailTemplate } from "../utils.js";
import { isAuth } from "../middleWare/auth.js";
import easyinvoice from "easyinvoice";
import fs from "fs";
import nodemailer from "nodemailer";

const orderRouter = express.Router();

orderRouter.get("/orders/:status", async (req, res) => {
  /*Order.find(
    { orderStatus: req.params.status },
    { sort: [["updatedAt", "asc"]] },
    function (err, doc) {
      console.log(doc);
      res.send(doc);
    }
  );*/

  const orders = await Order.find({ orderStatus: req.params.status }).sort({
    updatedAt: -1,
  });
  res.send(orders);
});
orderRouter.get("/rohith/1223/:id", (req, res) => {
  Order.findById({ _id: req.params.id })
    .populate("shippingAddress user")
    .then(async (order) => {
      order.newStatus = "seen";
      await order.save();
      order.user.password = "hidden";
      res.send(order);
    });
});

orderRouter.put("/changeOrderStatus/:id/:status", async (req, res) => {
  var order = await Order.findById({ _id: req.params.id });
  order.orderStatus = req.params.status;
  order.newStatus = "new";
  await Order.findByIdAndUpdate(order._id, order);
  res.send("status updated");
});

orderRouter.put("/trackingLink/:id/:link", async (req, res) => {
  var order = await Order.findById({ _id: req.params.id });
  order.trackingLink = req.params.link;
  await Order.findByIdAndUpdate(order._id, order);
  res.send("Link updated");
});

/**
 * API: localhost:3000/api/orders/:userId/myorders
 * To view placed order
 * params:userId
 */

orderRouter.get("/:userId/myOrders", (req, res) => {
  Order.find({ user: req.params.userId }, function (err, orders) {
    res.send(orders);
  });
});

/**
 * API: localhost:3000/api/orders/:cartId
 * To create new order
 * Params: cart_id,itemsPrice, shippingPrice,taxPrice,totalPrice
 */

orderRouter.post("/:cartId/", (req, res) => {
  try {
    Cart.findById(req.params.cartId, async function (err, cart) {
      if (cart) {
        console.log(req.body.user);
        const order = new Order({
          orderItems: cart.cartItems,
          itemsPrice: req.body.itemsPrice,
          totalPrice: req.body.totalPrice,
          shippingAddress: req.body.shippingAddress,
          user: req.body.user,
        });
        await order.populate("shippingAddress");
        const createdOrder = await order.save();
        cart.cartItems = [];
        cart.save(async function (err) {
          try {
            if (err) {
              res.send("Error while emptying the cart!");
            } else {
              var transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                  user: "support@sillicon14.com",
                  pass: "Thisisforsupport7474$",
                },
              });

              var mailOptions = {
                from: "support@sillicon14.com",
                to: createdOrder.user.email,
                subject: "Order_Invoice",
                text: "this is a invoice",
                attachments: [
                  {
                    filename: "invoice.pdf",
                    path: "./invoice.pdf",
                  },
                ],
              };
              var products = createdOrder.orderItems.map((items) => {
                return {
                  quantity: items.qty,
                  description: items.name,
                  tax: 18,
                  price: items.price,
                };
              });
              var data = {
                //"documentTitle": "RECEIPT", //Defaults to INVOICE
                //"locale": "de-DE", //Defaults to en-US, used for number formatting (see docs)
                currency: "INR", //See documentation 'Locales and Currency' for more info
                taxNotation: "GST", //or gst
                marginTop: 25,
                marginRight: 25,
                marginLeft: 25,
                marginBottom: 25,
                logo: "https://www.dropbox.com/s/v46qx5tf3xwj8gy/S14.jpeg?dl=1", //or base64
                //background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg", //or base64 //img or pdf
                sender: {
                  company: "Silicon14",
                  address:
                    "1st FLOOR, STARTUP STREET, R H KULKARNI LECTURE HALL COMPLEX, BVB CAMPUS, VIDYANAGAR",
                  zip: "580031",
                  city: "HUbli",
                  country: "India",
                  //"custom1": "custom value 1",
                  //"custom2": "custom value 2",
                  //"custom3": "custom value 3"
                },
                client: {
                  address: createdOrder.shippingAddress.address,
                  zip: createdOrder.shippingAddress.postalCode,
                  city: createdOrder.shippingAddress.city,
                  country: "India",
                  //"custom1": "custom value 1",
                  //"custom2": "custom value 2",
                  //"custom3": "custom value 3"
                },
                invoiceNumber: createdOrder._id,
                invoiceDate: "1.1.2021",
                products: products,
                bottomNotice: "Thank you for shopping with US",
                //Used for translating the headers to your preferred language
                //Defaults to English. Below example is translated to Dutch
                // "translate": {
                //     "invoiceNumber": "Factuurnummer",
                //     "invoiceDate": "Factuurdatum",
                //     "products": "Producten",
                //     "quantity": "Aantal",
                //     "price": "Prijs",
                //     "subtotal": "Subtotaal",
                //     "total": "Totaal"
                // }
              };
              const result = await easyinvoice.createInvoice(data);
              await fs.writeFileSync("invoice.pdf", result.pdf, "base64");
              await transporter.sendMail(mailOptions);

              res.status(201).send({
                message: "New Order Created",
                order: createdOrder,
              });
            }
          } catch (err) {
            res.status(err).end();
          }
        });

        /*order.save().then((createdOrder) => {
                     cart.cartItems = []
                    cart.save(function (err) {
                        if (err) {
                            res.send('Error while emptying the cart!');
                        } else {
                            res.status(201).send({
                                message: 'New Order Created',
                                order: createdOrder
                            })
                        }
                    }
                ) });*/
      } else {
        res.status(400).send({ message: "Cart is empty" });
      }
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

/**
 * API: localhost:3000/api/orders/:id
 * To get particular users order
 * params:orderID
 */

orderRouter.get("/:id", isAuth, (req, res) => {
  Order.findById(req.params.id).then((err, order) => {
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  });
});

/**
 * API: localhost:3000/api/orders/:id/pay
 * Order Payment
 * Params: order_Id,email
 */

orderRouter.put("/:id/pay", isAuth, (req, res) => {
  Order.findById(req.params.id, {}, {}, function (err, order) {
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      order
        .save()
        .then((updatedOrder) =>
          res.send({ message: "Order Paid", order: updatedOrder })
        );
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  }).populate("user", "email name");
});

/**
 * API: localhost:3000/api/orders/:id/addShippingAdress
 * To add Shipping address information
 * Params: fullName, address, city, postal code, country
 */

/* orderRouter.put('/:id/addShippingAddress', (req, res) => {
    Order.findById(req.params.id, {}, {}, function (err, order) {
        if (order) {
            order.shippingAddress = req.body.shippingAddress;
            const updatedOrder = order.save();
            res.send({message: 'Added Shipping Address', order: updatedOrder});
        } else {
            res.status(404).send({message: 'Order Not Found!'});
        }
    });
}); */

/**
 * API: localhost:3000/api/orders/:id/addPaymentMethod
 * To add Payment information
 * Params: fullName, address, city, postal code, country
 */

orderRouter.put("/:id/addPaymentMethod", isAuth, (req, res) => {
  Order.findById(req.params.id, {}, {}, function (err, order) {
    if (order) {
      order.paymentMethod = req.body.paymentMethod;
      const updatedOrder = order.save();
      res.send({ message: "Added Payment Method", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Order Not Found!" });
    }
  });
});

/**
 * API: localhost:3000/api/orders/:id
 * To delete order placed
 * Params: order parameters
 */

orderRouter.delete("/:id", isAuth, (req, res) => {
  Order.findById(req.params.id, {}, {}, function (err, order) {
    if (order) {
      const deleteOrder = order.remove().then((deleteOrder) =>
        res.send({
          message: "Order Deleted",
          order: deleteOrder._id,
        })
      );
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  });
});

/**
 * API: localhost:3000/api/orders/:id/deliver
 * To update delivery information
 * Params:orderID
 *
 */

orderRouter.put("/:id/deliver", isAuth, (req, res) => {
  Order.findById(req.params.id, {}, {}, function (err, order) {
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order
        .save()
        .then((updatedOrder) =>
          res.send({ message: "Order Delivered", order: updatedOrder })
        );
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  });
});

/**
 * API: localhost:3000/api/orders/:id/sendEmail
 * To send email for the customers
 * Params: from, to, subject
 */

orderRouter.get("/:id/sendEmail", isAuth, (req, res) => {
  Order.findById(req.params.id, {}, {}, function (err, order) {
    if (order) {
      mailgun().sendMail(
        {
          from: "SiliconLabs <no-reply@siliconlabs.com>",
          to: `${order.user.name} <${order.user.email}>`,
          subject: `New order ${order._id}`,
          html: orderEmailTemplate(order),
        },
        (error, info) => {
          if (error) {
            console.log(error);
            res.status(500).send({ message: "Order Not Found" });
          } else {
            console.log("Email sent: " + info.response);
            res.send({ message: "Email Sent!" });
          }
        }
      );
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  }).populate("cart");
});

export default orderRouter;
