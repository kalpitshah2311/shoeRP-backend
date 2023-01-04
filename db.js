const mongoose = require('mongoose')

const url = `mongodb+srv://dcoder:Kalpit2311%40@cluster0.m20z1um.mongodb.net/shoeRP?retryWrites=true&w=majority`;

const connectionParams={
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true 
}
const connectToMongo = ()=>{
    mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })
}
module.exports = connectToMongo;
