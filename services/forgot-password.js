const mongodb = require("../shared/mongo");
const { forgotSchema } = require("../shared/schema");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const send_mail = require("./sendMailer");
const JWT_SECRET = process.env.JWT_SECRET;

const forgotPassword = {
  async forgotPassword(req, res) {
    try {
      // joi validation
      const { value, error } = await forgotSchema.validate(req.body);
      if (error) {
        res.status(400).send(error);
      } else {
        // check weather email is registered
        const data = await mongodb.users.findOne({ email: req.body.email });
        if (!data) {
          res.status(400).send("user is not registered");
        } else {
          const payload = {
            userId: data._id,
          };
          const secret = JWT_SECRET + data.password;
          // generating token
          const token = jwt.sign(payload, secret, { expiresIn: "15m" });

          // updating token in DB
          let data1 = await mongodb.users.findOneAndUpdate(
            { email: data.email },
            { $set: { resetToken: token } },
            { ReturnDocument: "after" }
          );

          // generating link for resetting the password

          const link = `http://localhost:3000/users/forgot-password/${data._id}/${token}`;

          https: await send_mail(
            data.email,
            "Link to reset the password",
            `Click this link to reset the password ${link}`
          );
          res.status(201).send(link);
        }
      }
    } catch (err) {
      res.status(400).send(err);
    }
  },
  async linkVerify(req, res) {
    try {
      //   take userId and token from the URL
      const { userId, token } = req.params;

      // check weather userId exists
      const data = await mongodb.users.findOne({
        _id: ObjectId(userId),
      });
      if (!data) {
        res.status(400).send("check the email id, its wrong");
      } else {
        // check weather token is matching
        const secret = JWT_SECRET + data.password;
        const payload = jwt.verify(token, secret);
        if (payload === data.resetToken) {
          res.status(400).send("link is wrong");
        } else {
          console.log("payload : ", payload);
          res
            .status(201)
            .send(
              "enter 'password' and 'confirm_password' and change to POST method"
            );
          console.log("success");
        }
      }
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },
  async updatePassword(req, res) {
    try {
      // getting data from params and body
      const { userId, token } = req.params;
      const { password, confirm_password } = req.body;

      //   check weather the userId exists
      const data = await mongodb.users.findOne({ _id: ObjectId(userId) });
      if (!data) {
        res.status(400).send("URL is wrong_userId");
      } else {
        // console.log("hi");
        // check weather token matches
        let payload1 = false;
        try {
          const secret = JWT_SECRET + data.password;
          let payload = jwt.verify(token, secret);
          payload1 = true;
        } catch (err) {
          console.log(err);
        }
        if (!payload1) {
          res.status(400).send("URL is wrong_token");
        } else {
          // check password and confirm_password is matching
          if (password === confirm_password) {
            data.password = password;
            data.password = await bcrypt.hash(data.password, 10);

            console.log("password : ", data.password);
            const data1 = await mongodb.users.findOneAndUpdate(
              { _id: ObjectId(userId) },
              {
                $set: { password: data.password },
                $unset: { resetToken: 1, resetExpire: 1 },
              },
              { ReturnDocument: "after" }
            );

            res.status(200).send(data1);
          } else {
            res.status(400).send("password doesnt match");
          }
        }
      }
    } catch (err) {
      res.status(400).send(err);
    }
  },
};

module.exports = forgotPassword;
