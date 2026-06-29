const prisma = require("../config/prisma");

class NotificationService {

  async create(data) {

    return await prisma.notification.create({
      data,
    });

  }

  async getNotifications(userId) {

    return await prisma.notification.findMany({

      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

    });

  }

  async markAsRead(id) {

    return await prisma.notification.update({

      where: {
        id,
      },

      data: {
        isRead: true,
      },

    });

  }

}

module.exports = new NotificationService();