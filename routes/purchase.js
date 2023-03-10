const { request } = require('express');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Purchase = require('../models/purchase');
const Wholesaler = require('../models/wholesaler');
const Product = require('../models/product');
const Stock = require('../models/stock');

// @route   POST api/purchase/addpurchase
// @desc    Add a  to the purchase database
router.post('/addpurchase',[
    body('wholesaler_id', 'Please enter a valid wholesaler id').isString(),
    body('purchase_amount', 'Please enter a valid amount').isNumeric(),
    body('products', 'Please enter a valid product').isArray(),
    body('payment_mode', 'Please enter a valid payment mode').isString()
],  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{ 
        let purchase = await Wholesaler.findOne({wholesaler_id: req.body.wholesaler_id });
    	if (!purchase) {
            let response = {
                "status": "warning",
                "message": "wholesaler does not exist"
            }
    		return res.status(400).json(response);
    	}
        purchase = new Purchase({
            wholesaler_id: req.body.wholesaler_id,
            amount: req.body.purchase_amount,
            cheque_no: req.body.cheque_no,
            cheque_date: req.body.cheque_date,
            payement_mode:req.body.payment_mode
        });
        await purchase.save();
        let response = {
            "status": "success",
            "message": "purchase added successfully",
            "data": purchase
        }
        
         let product = null;
            product = new Product({
            purchase_id: response.data._id,
            products: req.body.products
        });
        await product.save();
        console.log(product);
 
        for(let i=0;i<req.body.products.length;i++){
            let stock = await Stock.findOne({article_no: req.body.products[i].article_no, size: req.body.products[i].size,brand: req.body.products[i].brand});
            if(!stock){
                stock = new Stock({
                    brand: req.body.products[i].brand,
                    article_no: req.body.products[i].article_no,
                    size: req.body.products[i].size,
                    quantity: req.body.products[i].purchase_quantity
                    
                    
                });
                await stock.save();
                
            }
            else{
            
                stock.quantity = stock.quantity + req.body.products[i].purchase_quantity;
                await stock.save();
            }
        }
        let response1 = {
            "status": "success",
            "message": "stock updated successfully",
            
        }
        return res.status(200).json(response1);

    }catch(error){
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route   GET api/purchase/getallpurchase
// @desc    Get all purchase from the database
router.get('/getallpurchase', async (req, res) => {
    try{
        let purchase = await Purchase.find().populate('wholesaler_id');
        let response = {
            "status": "success",
            "message": "All purchase records fetched successfully",
            "data": purchase
        }
        res.send(response);
    }catch(error){
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/todaytotal', async (req, res) => {
    try {
        let purchase = await Purchase.find({date: {$gte: new Date(new Date().setHours(0,0,0,0))}});
        let total = 0;
        for(let i=0;i<purchase.length;i++){
            total = total + purchase[i].amount;
        }
        let response = {
            "status": "success",
            "message": "Total purchase amount fetched successfully",
            "data": total
        }
        res.send(response);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

//get purchase amount by current month
router.get('/getpurchaseamountbymonth', async (req, res) => {
    try {
        let purchase = await Purchase.find({date: {$gte: new Date(new Date().setDate(1))}});
        let total = 0;
        for(let i=0;i<purchase.length;i++){
            total = total + purchase[i].amount;
        }
        let response = {
            "status": "success",
            "message": "Total purchase amount fetched successfully",
            "data": total
        }
        res.send(response);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = router;