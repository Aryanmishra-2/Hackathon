const prisma = require("../config/prisma");

class TimelineService {

  async create(data) {

    return await prisma.timeline.create({
      data,
    });

  }

  async getUserTimeline(userId) {

    return await prisma.timeline.findMany({

      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

    });

  }

}

module.exports = new TimelineService();