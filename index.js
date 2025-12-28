const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// Personal_Portfolio
// mBqptBYO5X0m8OUY

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.bkupc6p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const messageCollects = client
      .db("portfolio_Database")
      .collection("messages");
    const projectCollections = client.db("portfolio_Database").collection("tasks");
    const skillsCollections = client.db("portfolio_Database").collection("skills");

    app.post("/message", async (req, res) => {
      const data = req.body;
      const result = await messageCollects.insertOne(data);
      res.send(result);
    });

    app.get('/message', async(req, res) => {
      const result = await messageCollects.find().sort({_id: -1}).toArray()
      res.send(result)
    })

    app.post("/add_task", async (req, res) => {
      const data = req.body;
      data.features = data.features.split(',' || ' ')
      const result = await projectCollections.insertOne(data);
      res.send(result);
    });

    app.post("/add_skills", async (req, res) => {
      const data = req.body;
      const result = await skillsCollections.insertOne(data);
      res.send(result);
    });

    app.get('/add_skills', async(req, res) => {
      const result = await skillsCollections.find().sort({_id: -1}).toArray()
      res.send(result)
    })



    app.get("/tasks", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const totalTasks = await projectCollections.countDocuments();
        const totalPages = Math.ceil(totalTasks / limit);

        const tasks = await projectCollections.find().sort({_id: 1}).skip(skip).limit(limit).toArray();

        res.status(200).send({
          data: tasks,
          currentPage: page,
          totalPages,
          totalTasks,
        });
      } catch (err) {
        res.status(500).send({ message: "Server Error", error: err.message });
      }
    });

    app.get('/tasks/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)};
      const result = await projectCollections.findOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("this server is running");
});

app.listen(port, () => {
  console.log("this server run on port:", port);
});
