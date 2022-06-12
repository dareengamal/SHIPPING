require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const { mongoClient } = require('./mongo');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())




app.get('/api/shipments/:order_id', async (req, res) => {
  try{
    const db = await mongoClient();
    if (!db) res.status(500).send('Systems Unavailable');
    
     console.log('[getShipment]', req.params.order_id)
    const { order_id} = req.params.order_id;
    //const {shipment_status}= req.params.shipmentStatus;

  
  const shipment = await db.collection('shippment').findOne({ order_id: req.params.order_id });
  //res.status(200).send({ body:req.params.order_id , message: 'Success :${}'});
   return res.status(200).send(shipment);
  //res.status(200).send(shippment);
  }

  catch (e) {
    console.log('[getShipment] e', e)
  }

});

app.post('/api/shipments', async (req, res) => {
  try {
    const db = await mongoClient();
    if (!db) res.status(500).send('Systems Unavailable');
    
    console.log('[createShipment body]', req.body)
    const { order_id ,shipment_status} = req.body;
    
    if (!order_id) return res.status(403).send('order_id is required');

    const shipment = await db.collection('shippment').findOne({ order_id });
    if (shipment) return res.status(403).send('Document already exists, cannot create');

    const shipmentStatus = 'CREATED';

    const newShipmentDocument = await db.collection('shippment').insertOne({ order_id, shipment_status: shipmentStatus });
    return res.status(200).send({ body: {order_id,shipment_status}, message: 'Successfully created shipment' });
  }
  catch (e) {
    console.log('[createShipment] e', e)
  }
});

app.patch('/api/shipments', async (req, res) => {
  try {
    const db = await mongoClient();
    if (!db) res.status(500).send('Systems Unavailable');
     // const { order_id } = createShipment.order_id;
     const { order_id,shipment_status } = req.body;
   console.log('order_id', order_id);
 if (!order_id) return res.status(403).send('order_id is required');

      const shipment = await db.collection('shippment').findOne({ order_id:order_id });
      if (!shipment) return res.status(403).send('could not find order_id');
 
//     // fetch shipment from db for this order_id
//     // determine what the current status is
//     // determine what the next status should be
//     // update the database with new
       //const x = {$set:{order_id:order_id}};
     const currentShipmentStatus = shipment.shipment_status;
    const nextShipmentStatus = {
       "CREATED": "SHIPPED", 
       "SHIPPED": "DELIVERED"
    }
     [currentShipmentStatus];
     

 const updatedDocument = await db.collection('shippment').updateOne( {order_id:order_id} ,{$set:{ shipment_status: nextShipmentStatus} },{ returnDocument: true });
     return res.status(200).send({ body:await db.collection('shippment').findOne({order_id:order_id}) , message: 'Successfully updated order status' });

  } catch (e) {
     console.log('[updateShipment] e', e)
   }
 });

 app.delete('/api/shipments', async (req, res) => {
   try {
    const db = await mongoClient();
    if (!db) res.status(500).send('Systems Unavailable');
     console.log('[cancelShipment body]', req.body)
     const { order_id } = req.body;
     if (!order_id) return res.status(403).send('order_id is required');

     const shipment = await db.collection('shippment').findOne({ order_id: order_id });
     if (!shipment) return res.status(403).send('Shipment does not exist');

     if (shipment.shipment_status === 'CREATED') {
      await db.collection('shippment').updateOne({ order_id }, {$set:{ shipment_status: 'CANCELED' }});
       return res.status(200).send({ body: await db.collection('shippment').findOne({order_id:order_id}), message: 'Your Shipment has been canceled' });
     }
     return res.status(200).send({ body: shipment.shipment_status, message: 'Cannot cancel this shipments' });   }
      catch (e) {
    console.log('[cancelShipment] e', e)
   }
 });

app.listen(process.env.PORT || 5000, async () => {
  console.log("The server is running on",3000)
  //await connectDB();
});