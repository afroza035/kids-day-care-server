const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 5055;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x0ej8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productsCollection = client.db("kidsCare").collection("products");
  const allOrdersCollection = client.db("kidsCare").collection("allOrders");
  const reviewDataCollection = client.db("kidsCare").collection("reviewData");
  const adminCollection = client.db("kidsCare").collection("admin");

  app.get("/services", (req, res) => {
    productsCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/services/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    productsCollection.find({ _id: id }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  app.delete("/delete/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    productsCollection.deleteOne({ _id: id }).then((result) => {
      console.log(result.deletedCount > 0);
    });
  });

  app.post("/addService", (req, res) => {
    const addNewService = req.body;
    console.log("new Service", addNewService);
    productsCollection.insertOne(addNewService).then((result) => {
      console.log("Inserted Count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addOrders", (req, res) => {
    const newOrders = req.body;
    allOrdersCollection.insertOne(newOrders).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newOrders);
  });

  app.get("/ordersEmail", (req, res) => {
    allOrdersCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/orders", (req, res) => {
    allOrdersCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.patch("/update/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    allOrdersCollection
      .updateOne(
        { _id: id },
        {
          $set: { status: req.body.updateStatus.status },
        }
      )
      .then((result) => {
        // console.log(result);
      });
  });

  app.post("/reviews", (req, res) => {
    const newReview = req.body;
    reviewDataCollection.insertOne(newReview).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newReview);
  });

  app.get("/review", (req, res) => {
    reviewDataCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.post("/admin", (req, res) => {
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newAdmin);
  });

  app.get("/isAdmin", (req, res) => {
    adminCollection.find({ email: req.query.email }).toArray((err, admin) => {
      res.send(admin);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
