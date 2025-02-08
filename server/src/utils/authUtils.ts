import { Response } from "express";
import { prismaClient } from "../server";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
export const generateTokensAndSetCookie = (
  res: Response,
  user: User
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "3h" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 1000, // 3 hours
  });
  return { accessToken, refreshToken };
};

export const generateTokenIDAndSetCookie = (res: Response, id: number) => {
  const idToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "1h",
  });
  res.cookie("token_id", idToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000 * 20, // 20 hour
  });

  return id;
};

export const getValidUsername = async (
  username: string | null,
  email: string
): Promise<string> => {
  let name = username || "";

  if (!/^[a-zA-Z]+$/.test(name)) {
    const atIndex = email.indexOf("@");
    name = email.substring(0, atIndex);
  }

  let count = 1;
  let duplicate = await prismaClient.user.findFirst({
    where: { username: name },
  });

  while (duplicate) {
    name = `${name}${count}`;
    duplicate = await prismaClient.user.findFirst({
      where: { username: name },
    });
    count++;
  }

  return name;
};
