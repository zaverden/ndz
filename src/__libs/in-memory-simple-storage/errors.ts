import { CustomError } from "@libs/custom-error";

export class ItemNotFoundError extends CustomError {
  entityName: string;
  id: string;

  constructor(entityName: string, id: string) {
    super(`${entityName} [${id}] not found.`);
    this.entityName = entityName;
    this.id = id;
  }
}
