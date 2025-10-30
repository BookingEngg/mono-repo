import { Request, Response } from "express";
import webPush from "web-push";

class NotificationController {
  private notificationSubs = [];

  public userSubscribeNotification = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { subscription } = req.body;
    this.notificationSubs.push(subscription);

    console.log("PUSH NOTIFICATION SUBSCRIPTION", subscription);
    return res.send({ status: "success" });
  };

  public publishNotificationSubscription = async (
    _req: Request,
    res: Response
  ): Promise<any> => {
    const publicVapidKey = "BAI4vA3iMD67LXSaYjTfcONDm7nGsTiGtXJ4tLJ-xiwtU1NUTfakjm8_6LKxSTycbvPtjh6sNSEx0RDFwlLJAXI";
    const privateVapidKey = "StwGOfXgdfaRkrEkN_I8FH5N5HkcOVj4ZIB_M24rSZI";
    webPush.setVapidDetails('mailto:tusharepc205@gmail.com', publicVapidKey, privateVapidKey)
    const payload = JSON.stringify({
      title: "New Message!",
      body: "You have a new notification.",
    });

    for (const sub of this.notificationSubs) {
      await webPush.sendNotification(sub, payload).then(res => {console.log("RES>> ", res)}).catch(err => console.error("Push error:", err));
    }

    console.log("PUBLISH COMPLETE");
    return res.send({ status: "success" });
  };
}

export default NotificationController;
