// src/middlewares/auth.middleware.js

const { verifyAccessToken } = require("../utils/auth");
const { UnauthorizedError } = require("../utils/error");

exports.authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Access token required");
        }

        const accessToken = authHeader.split(" ")[1];

        const decoded = verifyAccessToken(accessToken);

        req.user = {
            id: decoded.id,
        };

        next();
    } catch (error) {
        next(new UnauthorizedError("Invalid or expired access token"));
    }
};