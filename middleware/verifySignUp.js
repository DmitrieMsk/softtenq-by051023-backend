const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    where: {
      username: req.body.username.toLowerCase()
    }
  }).then(user => {
    if (user) {
      res.status(400).send({
        message: "Failed! Username is already in use!"
      });
      return;
    }

    // Email
    User.findOne({
      where: {
        email: req.body.email.toLowerCase()
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

validateEmail = (req, res, next) => {
  reEmail = "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$";
  if (!req.body.email.match(reEmail)){
    res.status(400).send({
      message: "Failed! Invalid email"
    });
    return;
  }
  next();
}
validatePassword = (req, res, next) => {
  rePassword = "(?=^.{8,}$)((?=.*\\d)|(?=.*\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$";
  if (!req.body.password.match(rePassword)){
    res.status(400).send({
      message: "Failed! Invalid password"
    });
    return;
  }
  next();
}
validateUsername = (req, res, next) => {
  reUsername = "^[a-zA-Z][a-zA-Z0-9-_\\.]{3,64}$";
  if (!req.body.username.match(reUsername)){
    res.status(400).send({
      message: "Failed! Invalid username"
    });
    return;
  }
  next();
}

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted,
  validatePassword: validatePassword,
  validateUsername: validateUsername,
  validateEmail: validateEmail
};




module.exports = verifySignUp;