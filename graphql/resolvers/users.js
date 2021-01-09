const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { UserInputError } = require("apollo-server");

const { SECRET_KEY } = require("../../config");

const { validateRegisterInput, validateLoginInput } = require("../../util/validator");

const generateToken = (user) => 
{
    return jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email
    },SECRET_KEY,{ expiresIn: "1h" });
}

module.exports = {
    Mutation: {
        async login(_, { username, password })
        {
            const { errors, valid } = validateLoginInput(username, password);

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ username });

            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong crendetials';
                throw new UserInputError('Wrong crendetials', { errors });
            }

            const token = generateToken(user);
            
            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        async register(
            _,
            {
              registerInput: { username, email, password, confirmPassword }
            }
          ) {
                const { errors, valid } = validateRegisterInput(username,email,password,confirmPassword); 

                if(!valid)
                {
                    throw new UserInputError("Errors",{
                        errors
                    })
                }

                const userName = await User.findOne({ username });

                if(userName)
                {
                    throw new UserInputError("Username is already exists",{
                        errors: {
                            username: "This username already taken"
                        }
                    })
                }

                const hashedPassword = await bcrypt.hash(password,10);
                const user = new User({
                    username,
                    email,
                    password: hashedPassword,
                    createdAt: new Date().toISOString(),
                });

                const res = await user.save();
                const token = generateToken(res);

                return {
                    ...res._doc,
                    id: res._id,
                    token
                }

          }
    }
}