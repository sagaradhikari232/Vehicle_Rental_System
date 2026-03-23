import { Router } from "express";
import { registerVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle,} from "../controllers/vehicle.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register-vehicle").post(verifyJWT,
  upload.fields([
    {
      name: "image_url",
      maxCount: 1, 
    }
  ]),
  registerVehicle
);


// Secured routes means the route which need access token to access the resource
router.route("/get-allvehicles").get(verifyJWT, getAllVehicles);

router.route("/get-vehiclebyid/:id").get(verifyJWT,getVehicleById)

router.route("/update-vehicledetail/:id").patch(verifyJWT , upload.fields([{ name: "image_url", maxCount: 1 }]), updateVehicle)

router.route("/delete-vehicle/:id").delete(verifyJWT, deleteVehicle)


export default router;
