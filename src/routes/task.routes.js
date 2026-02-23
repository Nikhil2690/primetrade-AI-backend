import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createTask, deleteTask, getMyTasks, updateTask } from "../controllers/task.controller.js";


const router = Router()

router.route("/create-task").post(verifyJWT, createTask)
router.route("/get-tasks").get(verifyJWT, getMyTasks)
router.route("/update/:taskId").patch(verifyJWT, updateTask)
router.route("/delete/:id").delete(verifyJWT, deleteTask)

export default router;