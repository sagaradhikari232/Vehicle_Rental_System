import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getAllUsers, toggleUserStatus, getUserById} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1, 
    }
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// Secured routes means the route which need access token to access the resource
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").patch(verifyJWT , changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/get-userbyid/:id").get(verifyJWT, isAdmin, getUserById);

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) 

router.route("/all").get(verifyJWT,isAdmin, getAllUsers)

router.route("/:userId/status").patch(verifyJWT, toggleUserStatus);

export default router;
