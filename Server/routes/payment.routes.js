import { Router } from "express";

const router = Router();


// import mercadopago from 'mercadopago';
import {MercadoPagoConfig, Payment} from 'mercadopago';



router.get('/create_order', async (req, res) => {
  
    const client = new MercadoPagoConfig({
        accessToken: "TEST-732109574447100-030512-31cdc85ebab07e88290d0c5c0c31e367-1711814955"
    })
    
    const payment = new Payment(client);
    
    const body = {
        transaction_amount: 500,
        description: 'Recarga de $500',
        payment_method_id: 1,
        payer: {
            email: 'agus.gurvich@gmail.com'
        },
    }
    payment.create({body}).then(console.log).catch(console.log);
   
    res.send('Creando orden');
});

router.get('/success', (req, res) => {
    res.send('Success');
});

router.get('/webhook', (req, res) => {
    res.send('Creando orden');
});


export default router;