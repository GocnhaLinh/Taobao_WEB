import { prisma } from "../../../config/prisma";

export const getAllLabels = async () => {
  return prisma.categoryLabel.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
};

export const getLabelById = async (id: string) => {
  return prisma.categoryLabel.findUnique({
    where: { id },
  });
};

export const getLabelByName = async (name: string) => {
  return prisma.categoryLabel.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      status: "ACTIVE",
    },
  });
};

export const createLabel = async (data: {
  name: string;
  code?: string;
  icon?: string;
}) => {
  const code =
    data.code ||
    data.name
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "D")
      .replace(/[^A-Z0-9]/g, "_");

  return prisma.categoryLabel.create({
    data: {
      name: data.name,
      code,
      icon: data.icon || "🏷️",
      status: "ACTIVE",
    },
  });
};

export const updateLabel = async (
  id: string,
  data: { name?: string; code?: string; icon?: string; status?: string }
) => {
  return prisma.categoryLabel.update({
    where: { id },
    data,
  });
};

export const deleteLabel = async (id: string) => {
  return prisma.categoryLabel.delete({
    where: { id },
  });
};
