const app = require('./app');
const db = require('./config/config');
require('dotenv').config()

db.authenticate()
    .then(() => console.log("Database connected"))
    .catch(err => console.log('Error: ' + err ))

db.sync();



const port = process.env.PORT
app.listen(port, ()=> {
    console.log(`listening to port ${port}, at https://localhost:${port}}`)
})