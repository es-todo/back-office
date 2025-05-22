import { object_type } from "schemata/generated/object_type";

export type fetch = <T extends object_type["type"]>(
  type: T,
  id: string
) => (object_type & { type: T })["data"] | null | undefined;
