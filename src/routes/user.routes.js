import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser, updateUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)


//protected
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/user-details").get(verifyJWT, getCurrentUser)
router.route("/update").patch(verifyJWT, updateUser)

export default router;