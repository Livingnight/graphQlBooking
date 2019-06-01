const express = require('express');
const bodyParser = require('body-parser')
const graphQlServer = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose');

const Event = require('./models/event')
 
const app = express();

const events = [];

const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

app.use('/graphql', graphQlServer({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event
            .find()
            .then( events => {
                return events.map( event => {
                    return { ...event._doc, _id: event.id};
                })
            })
            .catch( err => {
                console.log(err);
            });
        },
        createEvent: args => {
           
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            return event
            .save()
            .then(result => {
                console.log(result);
                return {...result._doc}
            })
            .catch( err => {
                console.log(err);
            });
            
        }
    },
    graphiql: true
}))

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@bookingapp-unysl.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true
    }
)
.then( () => {
    console.log('databse connected!!!')
    app.listen(port, err => {
        if (err) console.log(err)
        else console.log(`server listening on port ${port}!`)
    });
})
.catch( err => {
    if (err) console.log(err)
})


