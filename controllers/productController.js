const Product = require('../models/Product');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');

const createProduct = async (req, res) => { 
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({ product });
    //res.send('Product created');
};

const getAllProduct = async (req, res) => {
    const product = await Product.find({});
    res.status(StatusCodes.OK).json({ product, count: product.length });
    //res.send('get All Products');
};

const getSingleProduct = async (req, res) => {
    const { id:productId } = req.params;
    const product = await Product.findOne({ _id:productId }).populate('review');

    if(!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(StatusCodes.OK).json({ product });
    //res.send('get single product');
};

const updateProduct = async (req, res) => {
    const {id:productId} = req.params;
    const product = await Product.findOneAndUpdate({ _id:productId }, req.body, {
        new:true, 
        runValidators:true, 
    });

    if(!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(StatusCodes.OK).json({ product });
    //res.send('update product');
};

const deleteProduct = async (req, res) => {
    const {id:productId} = req.params;
    const product = await Product.findOne({ _id:productId });

    if(!product) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    await product.remove();
    res.status(StatusCodes.OK).json({ msg: 'Success! Product Removed' });
    //res.send('delete product');
};

const uploadImage = async (req, res) => {
    if(!req.files){
        throw new CustomError.BadRequestError('No File Uploaded'); 
    }
    const productImage = req.files.image;

    if(!productImage.mimetype.startsWith('image')){
        throw new CustomError.BadRequestError('Please Upload Image');
    }
    const maxSize = 1024 * 1024;

    if(productImage.size > maxSize){
        throw new CustomError.BadRequestError('Please Upload Image smaller than 1 MB');
    }
    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`);
    await productImage.mv(imagePath);
    //console.log(req.files);
    res.status(StatusCodes.OK).json({image:`/uploads/${productImage.name}`})
};

module.exports = {
    createProduct,
    getAllProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
};