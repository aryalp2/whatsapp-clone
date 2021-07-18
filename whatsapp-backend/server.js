// import 
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1218824",
    key: "1bdfe6a5acfd384ed06d",
    secret: "db9db6b4c9a10ab41aa8",
    cluster: "ap2",
    useTLS: true
});

// middleware
app.use(express.json());
app.use(cors());

// db config
const connection_uri = "mongodb+srv://adminprashant:c3fZBHbmsjKn0DqH@cluster0.xa0f0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(connection_uri,{
    useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
    console.log('DB connected');

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log("change", change);

        if (change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });
        } else {
            console.log('Error Triggering Pusher');
        }
    })
})

// api routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get("/messages/sync", (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})




// listener
app.listen(port, () => console.log(`listening on port: ${port} `) )