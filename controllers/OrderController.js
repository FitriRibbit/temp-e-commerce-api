const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'someRandomValue';
    return { client_secret, amount };
}

const createOrder = async (req, res) => {
    //res.send('create Order');
    const { items: cartItem, tax, shippingFee } = req.body;

    if (!cartItem || cartItem.length < 1) {
        throw new CustomError.BadRequestError('No cart item provided')
    }
    if (!tax || !shippingFee) {
        throw new CustomError.BadRequestError('Please provide tax and shipping fee')
    }
    //res.send('Create order');
    let orderItem = [];
    let subtotal = 0;

    for (const item of cartItem) {
        const dbProduct = await Product.findOne({ _id: item.product });
        if (!dbProduct) {
            throw new CustomError.NotFoundError(`No Product with id ${item.product}`)
        };
        const { name, price, image, _id } = dbProduct;
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        };
        // add item to order
        orderItem = [...orderItem, singleOrderItem];
        //calculate subtotal
        subtotal += item.amount * price;
    }
    // calculate total
    const total = tax + shippingFee + subtotal;

    // get client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd',
    });

    const order = await Order.create({
        orderItem,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId,
    });

    res.status(StatusCodes.CREATED).json({ order, clientSecret: order.client_secret });
};

const getAllOrder = async (req, res) => {
    const order = await Order.find({});

    res.status(StatusCodes.OK).json({ order, count: order.length });
};

const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
        throw new CustomError.NotFoundError(`No order with id ${orderId}`)
    }

    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrder = async (req, res) => {
    const order = await Order.find({ user: req.user.userId });

    res.status(StatusCodes.OK).json({ order, count: order.length });
};

const updateOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const { paymentIntentId } = req.body;

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
        throw new CustomError.NotFoundError(`No order with id ${orderId}`)
    }
    checkPermissions(req.user, order.user);

    order.paymentIntendId = paymentIntentId;
    order.status = 'paid';
    await order.save();

    res.status(StatusCodes.OK).json({ order });
};

module.exports = {
    getAllOrder,
    getSingleOrder,
    getCurrentUserOrder,
    createOrder,
    updateOrder,
};