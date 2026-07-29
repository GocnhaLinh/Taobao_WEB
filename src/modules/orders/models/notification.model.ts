import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/prisma';

export const createNotification = async (data: Prisma.NotificationUncheckedCreateInput) => {
  return prisma.notification.create({ data });
};

export const getNotificationsByOrderId = async (orderId: string) => {
  return prisma.notification.findMany({
    where: { orderId },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getNotificationsByUserId = async (userId: string) => {
  return prisma.notification.findMany({
    where: {
      order: {
        userId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const markNotificationAsRead = async (id: string) => {
  return prisma.notification.update({
    where: { id },
    data: { status: 'READ' },
  });
};

export const markAllNotificationsAsReadForUser = async (userId: string) => {
  return prisma.notification.updateMany({
    where: {
      order: {
        userId,
      },
      status: 'UNREAD',
    },
    data: {
      status: 'READ',
    },
  });
};
