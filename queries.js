const Pool = require("pg").Pool;
const md5 = require("md5");
const url = require("url");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "qwe456",
    port: 5432,
});

let user = [];

const getUsers = (request, response) => {
    pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const getUserById = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const createUser = async (request, response) => {
    // const { username, email, password } = request.body;
    const username = request.body.username;
    const email = request.body.email;
    const password = await md5(request.body.password);

    // user.push({
    //     username,
    //     email,
    //     password: md5_password,
    // });
    let user_exists = false;
    if (username !== "" && email !== "") {
        pool.query(
            "SELECT * FROM users WHERE username = $1 OR email = $2",
            [username, email],
            (error, results) => {
                if (error) {
                    throw error;
                }
                console.log(results.rows);
                user_exists = results.rows == [] ? false : true;
                if (Object.keys(results.rows).length > 0) {
                    console.log("User exists!");
                    response.redirect(
                        url.format({
                            pathname: "/registration",
                            query: "User exists!",
                        })
                    );
                } else {
                    if (request.body.password == request.body.cpassword) {
                        pool.query(
                            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
                            [username, email, password],
                            (error, results) => {
                                if (error) {
                                    throw error;
                                }
                                console.log("Registered!");
                                response.redirect(
                                    url.format({
                                        pathname: "/registration",
                                        query: "Registered!",
                                    })
                                );
                            }
                        );
                    } else {
                        response.redirect(
                            url.format({
                                pathname: "/registration",
                                query: "Password and confirmation password does not match!",
                            })
                        );
                    }
                }
            }
        );
    }
};

const updateUser = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, email } = request.body;

    pool.query(
        "UPDATE users SET name = $1, email = $2 WHERE id = $3",
        [name, email, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`User modified with ID: ${id}`);
        }
    );
};

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`User deleted with ID: ${id}`);
    });
};

const login = (request, response) => {
    console.log('aaaa')
    // const { username, email, password } = request.body;

    const username = request.body.username;
    const password =  md5(request.body.password);

    // user.push({
    //     username,
    //     email,
    //     password: md5_password,
    // });
    if (username !== "" && password !== "") {
        pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password],
            (error, results) => {
                if (error) {
                    throw error;
                }
                console.log(results.rows);
                if (Object.keys(results.rows).length > 0) {
                    console.log("Success login!");
                    response.redirect(
                        url.format({
                            pathname: "/",
                            query: "Success login!",
                        })
                    );
                } else {
                    response.redirect(
                        url.format({
                            pathname: "/registration",
                            query: "Wrong username or password!",
                        })
                    );
                }
            }
        );
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
};
