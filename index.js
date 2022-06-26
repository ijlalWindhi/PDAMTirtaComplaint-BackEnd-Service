//import library
const express = require('express');
const cors = require('cors');
const path = require('path')

//implementasi library
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))

//endpoint
const user = require('./routes/user')
const report = require('./routes/report')

app.use('/user', user);
app.use('/report', report);

//run server
const port = 2004;
app.listen(port, () => {
    console.log('server run on port ' + port);
})