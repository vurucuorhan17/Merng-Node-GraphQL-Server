const { ApolloServer, PubSub } = require("apollo-server");
const gql = require("graphql-tag");
const mongoose = require("mongoose");

const Post = require("./models/Post");
const User = require("./models/User");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

const { MONGODB_URI } = require("./config");

const pubsub = new PubSub();

const port = process.env.port || 5000;

let devOrProd;


switch(process.env.NODENV)
{
    case "DEV":
        devOrProd = "mongodb://localhost:27017/merng-db";
        break;
    case "PROD":
        devOrProd = MONGODB_URI
    default:
        devOrProd = MONGODB_URI
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
});

mongoose.connect("mongodb://localhost:27017/merng-db", { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => console.error("Failed MongoDB Connection"));

server.listen({ port })
.then((res) => {
    console.log(`Server is starting at ${res.url}`);
});

