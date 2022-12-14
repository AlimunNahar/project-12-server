const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rz0ozm8.mongodb.net/?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("pureSnuggle").collection("users");
    const productsCollection = client.db("pureSnuggle").collection("products");
    const categoriesCollection = client
      .db("pureSnuggle")
      .collection("categories");
    const bookingsCollection = client
      .db("pureSnuggle")
      .collection("bookedItems");
    const advertiseCollection = client
      .db("pureSnuggle")
      .collection("advertisedProducts");

    // all categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoriesCollection.find(query).toArray();
      res.send(categories);
    });

    // all products by individual category id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);

      // load all antique products
      if (id === "63825e56ea67f24e07523fde") {
        const query = { category_name: "Antique Furniture" };
        const antique = await productsCollection.find(query).toArray();
        res.send(antique);

        // load all vintage products
      } else if (id === "63825e56ea67f24e07523fdf") {
        const query = { category_name: "Vintage Furniture" };
        const vintage = await productsCollection.find(query).toArray();
        res.send(vintage);

        // load all french products
      } else if (id === "63825e56ea67f24e07523fe0") {
        const query = { category_name: "French Furniture" };
        const french = await productsCollection.find(query).toArray();
        res.send(french);

        // load all industrial products
      } else {
        const query = { category_name: "Industrial Furniture" };
        const industrial = await productsCollection.find(query).toArray();
        res.send(industrial);
      }
    });

    // get users from database
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // post users to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // get all booked items per user
    app.get("/bookedItems", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    // get buyers by email query
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "buyer" });
    });

    // get seller by email query
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "seller" });
    });

    // get admin by email query
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // post booked products info to database
    app.post("/bookedItems", async (req, res) => {
      const bookings = req.body;
      // console.log(bookings);
      const result = await bookingsCollection.insertOne(bookings);
      res.send(result);
    });

    //get booked items for user
    app.get("/bookedItems", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookedItems = await bookingsCollection.find(query).toArray();
      res.send(bookedItems);
    });

    // insertData to products
    app.post("/products", async (req, res) => {
      const product = req.body;
      // console.log(product);
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    // get products by seller email
    app.get("/products", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const query = { seller_email: email };
      const allProducts = await productsCollection.find(query).toArray();
      res.send(allProducts);
    });

    // post advertised items
    app.post("/advertise", async (req, res) => {
      const add = req.body;
      // console.log(bookings);
      const advertise = await advertiseCollection.insertOne(add);
      res.send(advertise);
    });

    // get advertised items
    app.get("/advertisedProducts", async (req, res) => {
      const query = {};
      const result = await advertiseCollection
        .find(query)
        .sort({ _id: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });

    // get all buyers
    app.get("/allBuyers", async (req, res) => {
      const query = { role: "buyer" };
      const buyers = await usersCollection.find(query).toArray();
      res.send(buyers);
    });

    // get all buyers
    app.get("/allSellers", async (req, res) => {
      const query = { role: "seller" };
      const sellers = await usersCollection.find(query).toArray();
      res.send(sellers);
    });

    // seller delete
    app.delete("/seller/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: ObjectId(id) };
      const seller = await usersCollection.deleteOne(filter);
      res.send(seller);
    });

    // Buyer delete
    app.delete("/buyer/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const buyer = await usersCollection.deleteOne(filter);
      res.send(buyer);
    });
  } finally {
  }
}
run().catch(console.log());

app.get("/", async (req, res) => {
  res.send("Pure Snuggle server is running");
});

app.listen(port, () => console.log(`Pure Snuggle running on port: ${port}`));
