require("dotenv").config();
const express = require("express");
const { v4: uuid } = require("uuid");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");

const morganOption = NODE_ENV === "production";

const app = express();

app.use(morgan(morganOption));
app.use(express.json());
app.use(helmet());
app.use(cors());

const users = [
  {
    id: "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    username: "sallyStudent",
    password: "c00d1ng1sc00l",
    favoriteClub: "Cache Valley Stone Society",
    newsLetter: "true",
  },
  {
    id: "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    username: "johnBlocton",
    password: "veryg00dpassw0rd",
    favoriteClub: "Salt City Curling Club",
    newsLetter: "false",
  },
];

//GET root page
app.get("/", (req, res) => {
  res.send("A GET request");
});

app.get("/user", (req, res) => {
  res.json(users);
});

//POST to root page
app.post("/", (req, res) => {
  console.log(req.body);
  res.send("POST request received");
});

app.post("/user", (req, res) => {
  //GET DATA
  const { username, password, favoriteClub, newsletter = false } = req.body;
  const clubs = [
    "Cache Valley Stone Society",
    "Ogden Curling Club",
    "Park City Curling Club",
    "Salt City Curling Club",
    "Utah Olympic Oval Curling Club",
  ];

  //VALIDATION CODE HERE
  if (!username) {
    return res.status(400).send("Username required");
  }

  if (!password) {
    return res.status(400).send("Password required");
  }

  if (!favoriteClub) {
    return res.status(400).send("Favorite club required");
  }

  if (username.length < 6 || username.length > 20) {
    return res.status(400).send("Username must be between 6 and 20 characters");
  }

  // password length
  if (password.length < 8 || password.length > 36) {
    return res.status(400).send("Password must be between 8 and 36 characters");
  }

  // password contains digit, using a regex here
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res
      .status(400)
      .send(
        "Password must be contain at least one digit and no special characters"
      );
  }

  // make sure the club is valid
  if (!clubs.includes(favoriteClub)) {
    return res.status(400).send("Not a valid club");
  }

  //AT THIS POINT ALL VALIDATION PASSED
  const id = uuid(); //generate a unique id
  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsletter,
  };

  users.push(newUser);

  res.status(201).location(`http://localhost:8000/user/${id}`).json({ id: id });
});

//DELETE USER BY ID
app.delete("/user/userId", (req, res) => {
  const { userId } = req.params;

  const index = users.findIndex((u) => {
    u.id === userId;
  });

  if (index === -1) {
    return res.status(404).send("User not found");
  }

  users.splice(index, 1);

  res.status(204).end();
});

//Hide error message from users and outsiders
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }

  res.status(500).json(response);
});

module.exports = app;
