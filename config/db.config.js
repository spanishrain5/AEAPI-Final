const config = {
    // read DB credencials from environment variables
    HOST: process.env.DB_HOST ,//'pw2.joaoferreira.eu' ,
    USER: process.env.DB_USER ,//'teresaterroso_pw2_martynas' ,
    PASSWORD: process.env.DB_PASSWORD ,//'EX5zLd[Rbpt_' ,
    DB: process.env.DB_NAME ,//'teresaterroso_pw2_martynas',
    dialect: "mysql",

    SECRET: process.env.SECRET
};

module.exports = config;
    