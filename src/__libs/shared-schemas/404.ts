import { Type, Static } from "@sinclair/typebox";

export const R404 = Type.Object({
  entityName: Type.String(),
  id: Type.String(),
  message: Type.String(),
});
export type R404 = Static<typeof R404>;
