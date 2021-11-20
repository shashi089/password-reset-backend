const mongodb = require("../shared/mongo");
const { registerSchema, loginSchema } = require("../shared/schema");
const bcrypt = require("bcrypt");
const schema = require("../shared/schema");
const jwt = require("jsonwebtoken");
const { users } = require("../shared/mongo");
const JWT_SECRET = "jf843738jcnj$#$df";
// const JWT_SECRET = process.env.JWT_SECRET;

const services = {
  async register(req, res) {
    try {
      // joi validation
      const { value, error } = await registerSchema.validate(req.body);
      if (error) {
        res.status(400).send(error.details[0].message);
      } else {
        // fetching user data from database
        const data = await mongodb.users.findOne({ email: req.body.email });

        // checking weather email already exists in DB
        if (data) {
          res.status(400).send("user already exists. So please login");
        } else {
          // hashing the password
          req.body.password = await bcrypt.hash(req.body.password, 10);

          // inserting the new user details in DB
          const insertData = await mongodb.users.insertOne(req.body);
          console.log(insertData);
          res.status(201).send("user successfully registered");
        }
      }
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  },
  async login(req, res) {
    try {
      //   joi validation
      const { value, error } = await loginSchema.validate(req.body);
      if (error) {
        res.status(400).send(error.details[0].message);
      } else {
        // fetching user data from DB
        const data = await mongodb.users.findOne({ email: req.body.email });
        if (!data) {
          res.status(400).send("user doesnt exists. Please Register");
        } else {
          // checking password
          const isValid = await bcrypt.compare(
            req.body.password,
            data.password
          );
          if (!isValid) {
            res.status(400).send("Password is in correct");
          } else {
            const payload = {
              userId: data._id,
            };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
            res.status(200).send({ email: data.email, token: token });
          }
        }
      }
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },
};

module.exports = services;
