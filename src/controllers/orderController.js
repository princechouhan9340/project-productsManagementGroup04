const orderModel = require("../models/orderModel")
const userModel = require("../models/userModel")
const OrderModel = require("../models/orderModel");
const CartModel = require("../models/cartModel");
const ProductModel = require("../models/productModel");
const {isValidInputBody,isValidObjectId,isValidInputValue,isValidOnlyCharacters} = require('../validaton/allValidation')
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require("crypto")
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_KEY,
  });



//*******************************************CREATE ORDER*************************************************** */

const createOrder = async function (req, res) {
    try {
        const requestBody = req.body;
        const queryParams = req.query;
        const userId = req.params.userId;
        const decodedToken = req.userId;

        // query params must be empty
        if (isValidInputBody(queryParams)) {
            return res.status(404).send({ status: false, message: " page not found" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "invalid userId " });
        }

        // using destructuring
        let { cancellable } = req.body;
       
        // getting user's cart details
        const userCartDetail = await CartModel.findOne({ userId: userId }).select({
            items: 1,
            userId: 1,
            totalItems: 1,
            totalPrice: 1,
        });
        console.log(userCartDetail)
        if (!userCartDetail) {
            return res.status(404).send({ status: false, message: "cart detail not found" });
        }

        // authorization
        if (decodedToken != userId) {
            console.log(decodedToken, userId)
            return res.status(403).send({ status: false, message: "Authorization failed" })
        }

        if (userCartDetail.items.length === 0) {
            return res.status(400).send({ status: false, message: "Cart is empty" });
        }


        //total product quantity in cart
        // const totalQuantity = userCartDetail.items.reduce((a, b) => a.quantity + b.quantity);

        /*****prince bro if above doesn't work try below code some syntex difference*********/

        const totalQuantity = userCartDetail.items.reduce(
            (a, b) => a + b.quantity, 0
        );
        //console.log(totalQuantity, "222")
        // All products are available or not
        const allProductsInCart = userCartDetail.items;

        for (let i = 0; i < allProductsInCart.length; i++) {
            const isProductInStock = await ProductModel.findById(allProductsInCart[i].productId);
            if (isProductInStock.installments < allProductsInCart[i].quantity) {
                //console.log(isProductInStock.installments, "kjhjkgkjgkjgkjgbkj", allProductsInCart[i].quantity)
                return res.status(400).send({ status: false, message: `${allProductsInCart[i].productId} is out of stock`, });
            }
        }

        if (requestBody.hasOwnProperty("cancellable")) {
            if (typeof cancellable !== "boolean") { return res.status(400).send({ status: false, message: "cancellable should be a boolean" }); }
            cancellable = cancellable;
        } else {
            cancellable = true;
        }

        const orderData = {
            userId: userId,
            items: userCartDetail.items,
            totalItems: userCartDetail.totalItems,
            totalPrice: userCartDetail.totalPrice,
            totalQuantity: totalQuantity,
            cancellable: cancellable,
            status: "pending",
            isDeleted: false,
            deletedAt: null,
        };

        const orderPlaced = await OrderModel.create(orderData);
        let Id = orderPlaced._id
        let findOrder = await orderModel.findOne({ _id: Id }).select({ items: { _id: 0 } })

        //updating product stock
        // const itemsInCart = userCartDetail.items;
        // for (let i = 0; i < itemsInCart.length; i++) {
        //     const updateProductInstallments = await ProductModel.findOneAndUpdate({ _id: itemsInCart[i].productId }, { $inc: { installments: -itemsInCart[i].quantity } }, { new: true });
        //     console.log(updateProductInstallments)
        // }

        //making cart empty again
        const makeCartEmpty = await CartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true });
        console.log(makeCartEmpty)

        res.status(201).send({ status: true, message: "order placed", data: findOrder });

    } catch (error) {
        res.status(500).send({ error: error.message });
        console.log(error)
    }
};

let createPaymentorder = async function (req,res){
    try{

        const orderId = req.params.orderId;
        const result = await orderModel.findOne({_id:orderId});
        console.log({ key_id: process.env.RAZORPAY_ID,
            key_secret: process.env.RAZORPAY_KEY,
            orderId:orderId
        })
        let options = {
            amount: result.totalPrice,
            currency: "INR",
            receipt: result._id,
        }
        console.log(options)

        instance.orders.create(options, function(err, order){
            if(order){
               return res.status(200).send({order_Details:order,key:process.env.RAZORPAY_ID})
            }else{
               return res.send({error:err})
            }
        })

        // payment url = https://pages.razorpay.com/pl_NEIrOwsU7usqU4/view
        
        

    }catch(error){
        console.log(err)
    }
}


let paymentverification = async function (req,res){
    try{
	// STEP 7: Receive Payment Data 
	const {order_id, payment_id,razorpay_signature} = req.body;	 

	// Pass yours key_secret here 
	const key_secret = process.env.RAZORPAY_KEY;	 

	// STEP 8: Verification & Send Response to User 
	
	// Creating hmac object 
	let hmac = crypto.createHmac('sha256', key_secret); 

	// Passing the data to be hashed 
	hmac.update(order_id + "|" + payment_id); 
	
	// Creating the hmac in the required format 
	const generated_signature = hmac.digest('hex'); 
	
	
	if(razorpay_signature===generated_signature){ 
        console.log(true)
		res.status(201).send({success:true, message:"Payment has been verified"}) 
	} 
	else
	res.status(400).send({success:false, message:"Payment verification failed"}) 
}catch(err){
        console.log(err)
    }
}

let getOrder = async function (req,res){
    try{

        const userId = req.params.userId;

        if(userId){
            const result = await orderModel.find({userId:userId})
            if(result){
                res.send({order_Details:result})
            }else{
                res.send("doc not found")
            }
        }
        res.send("userid not found")

    }catch(error){
        console.log(error)
    }
}


//*******************************************UPDATE ORDER*************************************************** */

let changeStatus = async function (req, res) {
    try {
        let { status } = req.body
        let paramUserId = req.params.userId;
        let tokenUserId = req.userId;

        if (!isValidInputValue(status) || !isValidOnlyCharacters(status)) {
            return res.status(400).send({ status: false, message: "provide status for update" });
        }

        if (!isValidObjectId(paramUserId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }

        let userInDb = await userModel.findOne({ _id: paramUserId })

        if (!userInDb) {
            return res.status(400).send({ status: false, message: `user not present with is id: ${paramUserId}` })
        }

        if (paramUserId != tokenUserId) {
            return res.status(403).send({ status: false, message: "you are not authorised" })
        }

        let orderDetails = await orderModel.findOne({ userId: paramUserId, status: "pending" })
        //console.log(orderDetails)
        if (!orderDetails) {
            return res.status(400).send({ status: false, message: "no order details found" })
        }
        if (status == "pending") {
            return res.status(400).send({ status: false, message: "alrady in pending" })
        }
        if (status == "pending") {
            return res.status(400).send({ status: false, message: "alrady in pending" })
        }

        if (status == "cancled") {

            if (orderDetails.cancellable == false) {
                return res.status(400).send({ status: false, message: "Your order is not cancellable" })
            }
            if (orderDetails.status == "cancled") {
                return res.status(400).send({ status: false, message: "alrady cancled" })
            }
            let updateStatus = status

            let updateOrder = await orderModel.findOneAndUpdate({ userId: paramUserId, status: "pending" }, { $set: { status: updateStatus } }, { new: true }).select({ items: { _id: 0 } })

            return res.status(200).send({ status: true, message: "Order cancled succesfully", data: updateOrder })
        }

        if (status == "completed") {
            if (orderDetails.status == "completed") {
                return res.status(400).send({ status: false, message: "alrady completed" })
            }
            let updateStatus = status

            let updateOrder = await orderModel.findOneAndUpdate({ userId: paramUserId, status: "pending" }, { $set: { status: updateStatus } }, { new: true }).select({ items: { _id: 0 } })

            return res.status(200).send({ status: true, message: "Order cancled succesfully", data: updateOrder })
        }
        // const userCartDetail = await CartModel.findOne({ userId: paramUserId })
        // const itemsInCart = userCartDetail.items;
        // for (let i = 0; i < itemsInCart.length; i++) {
        //     const updateProductInstallments = await ProductModel.findOneAndUpdate({ _id: itemsInCart[i].productId }, { $inc: { installments: +itemsInCart[i].quantity } }, { new: true });
        //     console.log(updateProductInstallments)
        // }

    }
    catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }
}

module.exports = { changeStatus, createOrder, createPaymentorder, getOrder, paymentverification }