import { Router } from "express";
import { UserManagementController } from "./user-management.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { validateBody, validateQuery } from "@/core/middlewares/validation.middleware";
import { CreateUserSchema, UpdateUserSchema, UserQuerySchema } from "./user-management.schema";

const router = Router();
const controller = new UserManagementController();

router.use(requireAuth);

router.get("/", validateQuery(UserQuerySchema), controller.getUsers);
router.get("/:id", controller.getUserById);
router.post("/", validateBody(CreateUserSchema), controller.createUser);
router.put("/:id", validateBody(UpdateUserSchema), controller.updateUser);
router.delete("/:id", controller.deleteUser);

export const userManagementRoutes = router;
