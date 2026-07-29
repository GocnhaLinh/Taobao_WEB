import { Prisma } from '@prisma/client';
import * as notificationModel from '../models/notification.model';
import * as userModel from '../../users/models/user.model';

export const sendNotification = async (data: Prisma.NotificationUncheckedCreateInput) => {
  return notificationModel.createNotification(data);
};

export const getOrderNotifications = async (orderId: string) => {
  return notificationModel.getNotificationsByOrderId(orderId);
};

export const getUserNotifications = async (userId: string) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }
  return notificationModel.getNotificationsByUserId(userId);
};

export const readNotification = async (id: string) => {
  return notificationModel.markNotificationAsRead(id);
};

export const readAllUserNotifications = async (userId: string) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }
  return notificationModel.markAllNotificationsAsReadForUser(userId);
};
