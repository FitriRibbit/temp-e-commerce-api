const express = require('express');
const router = express.Router();
const {
    authenticateUser, 
    authorizePermission
} = require('../middleware/authentication');

const {
    createProduct,
    getAllProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
} = require('../controllers/productController');

const {getSingleProductReviews} = require('../controllers/reviewController');

router
.route('/')
.post([authenticateUser, authorizePermission('admin')], createProduct)
.get(getAllProduct);

router.route('/uploadImage')
.post([authenticateUser, authorizePermission('admin')], uploadImage);

router.route('/:id')
.get(getSingleProduct)
.patch([authenticateUser, authorizePermission('admin')], updateProduct)
.delete([authenticateUser, authorizePermission('admin')], deleteProduct);

router.route('/:id/review').get(getSingleProductReviews);


module.exports = router;