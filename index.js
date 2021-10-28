const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.uk5kj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
    try{
        await client.connect();
        const database = client.db('online_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        // get api!
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products = await cursor.toArray();
            }
            
            
            
            res.send({
                count,
                products
            });
        });
         

        // Use POST  to Get data by keys!
        app.post('/products/byKeys', async(req, res)=>{
            const keys = req.body;
            const query = { key:{$in: keys} }
            const products = await productCollection.find(query).toArray();
            console.log(req.body);
            res.json(products);
        });
    
        // Add orders API!
        app.post('/orders', async(req, res)=>{
            const order = req.body;
            console.log('order', order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('Ema Jhon server is running');
});

app.listen(port, ()=>{
    console.log('Server running at port 5000', port);
})


