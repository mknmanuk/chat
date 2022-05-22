const Pool = require("pg").Pool;
// const session = require("express-session");
const { redirect } = require("express/lib/response");
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
                user_exists = results.rows == [] ? false : true;
                if (Object.keys(results.rows).length > 0) {
                    response.render("registration", { msg: "User exists!" });
                } else {
                    if (request.body.password == request.body.cpassword) {
                        pool.query(
                            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
                            [username, email, password],
                            (error, results) => {
                                if (error) {
                                    throw error;
                                }
                                response.render("registration", {
                                    msg: "Registered!",
                                });
                            }
                        );
                    } else {
                        response.render("registration", {
                            msg: "Password and confirmation password does not match!",
                        });
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

const login = (req, res) => {
    // const { username, email, password } = request.body;

    const username = req.body.username;
    const password = md5(req.body.password);

    if (username !== "" && password !== "") {
        pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password],
            (error, results) => {
                if (error) {
                    throw error;
                }
                if (Object.keys(results.rows).length > 0) {
                    console.log("Success login!");
                    let user_id = results.rows[0].id;
                    console.log(user_id);
                    // session.user = username;
                    res.render("index", { username, user_id });
                } else {
                    res.render("login", {
                        msg: "Wrong username or password!",
                    });
                }
            }
        );
    }
};

const save_data = (req, res) => {
    const data = [];
    const conversation_id = req.body.conversation_id;
    const sender_id = req.body.sender_id;
    const receiver_id = req.body.receiver_id;
    const text = req.body.text;
    data.push({
        conversation_id,
        sender_id,
        receiver_id,
        text,
    });

    if (sender_id !== "" && receiver_id !== "") {
        pool.query(
            "INSERT INTO messages (conversation_id, sender_id, receiver_id, text) VALUES ($1, $2, $3, $4)",
            [conversation_id, sender_id, receiver_id, text],
            (error, results) => {
                if (error) {
                    throw error;
                }
                console.log("success");
            }
        );
    }
};

const load_data = (request, response) => {
    const id = request.params.id;
    pool.query(
        "SELECT messages.text,to_char(messages.sent_at, 'YYYY-MM-DD HH:MI:SS') as sent_at,users.username as \"sender\" FROM messages left join users on messages.sender_id=users.id WHERE conversation_id = $1",
        [id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        }
    );
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
    save_data,
    load_data,
};
