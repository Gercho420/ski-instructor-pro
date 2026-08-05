import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import { authenticateRequest } from "../auth";

export interface TrpcContext {
  req: Request;
  res: Response;
  user: User | null;
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await authenticateRequest(req);
  } catch {
    user = null;
  }

  return {
    req,
    res,
    user,
  };
}
