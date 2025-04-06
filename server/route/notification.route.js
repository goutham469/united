import { Router } from "express";
import { sendDealsNotification } from "../controllers/notification.controller.js";

const notificationRouter = Router();

notificationRouter.post("/send-deals", sendDealsNotification);

export default notificationRouter; 