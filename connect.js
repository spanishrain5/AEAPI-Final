const mysql = require('mysql');

//Node.js MySQL database connection
const connection = mysql.createConnection({
    host: 'pw2.joaoferreira.eu',
    user: 'teresaterroso_pw2_martynas',
    password: 'EX5zLd[Rbpt_',
    database: 'teresaterroso_pw2_martynas'
});
connection.connect((err) => {
if (err) throw err;
console.log('Connected to MySQL Server!');
});

module.exports = connection;
