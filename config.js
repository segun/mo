const props = {
    db: {
        // username: "registrar",
        // password: "Bela2u@zests",
        // host: "96.126.125.223",
        // port: "5432",
        // database: "postgres",
        username: "registrar",
        password: "Bela2u@zests",
        host: "45.79.47.77",
        port: "5432",
        database: "postgres",
        // username: "masep",
        // password: "masep",
        // host: "127.0.0.1",
        // port: "5432",
        // database: "masep",        
    },
    email: {
        host: "mail.msussrc.com",
        port: 25,
        secure: false,
        tls: {
            rejectUnauthorized: false
        },
        from: "register@masep.org",        
    },
    env: {
        JWT_SECRET: "ruGraf-8wq6t-fraQgt-Sdfw3r",
    },
}

module.exports = props;