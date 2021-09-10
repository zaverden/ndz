import {
  CustomOptions,
  KeyOfKind,
  ObjectOptions,
  TKeyOf,
  TObject,
  TProperties,
  TSchema,
  TypeBuilder,
} from "@sinclair/typebox";

//#region Utility
function isObject(object: unknown): object is Dictionary<unknown> {
  return (
    typeof object === "object" && object !== null && !Array.isArray(object)
  );
}
function isArray(object: unknown): object is Array<unknown> {
  return typeof object === "object" && object !== null && Array.isArray(object);
}
function clone<T>(object: T): T {
  if (isObject(object))
    return Object.keys(object).reduce(
      (acc, key) => ({ ...acc, [key]: clone(object[key]) }),
      {}
    ) as T;
  if (isArray(object)) return object.map((item) => clone(item)) as unknown as T;
  return object;
}
//#endregion Utility

type TAdditionalProperties = undefined | boolean | TSchema;
type TMergedObject<T extends TObject<TProperties>[]> = TObject<
  UnionToIntersection<T[number]["properties"]> & {}
>;

class TypeBuilderExt extends TypeBuilder {
  public StringEnum<T extends string>(
    keys: T[],
    options?: CustomOptions
  ): TStringEnum<T> {
    return { ...options, kind: KeyOfKind, type: "string", enum: keys };
  }

  public Merge<T extends TObject<TProperties>[]>(
    schemas: T,
    options?: ObjectOptions
  ): TMergedObject<T> {
    const required = schemas.flatMap(({ required }) => required ?? []);
    const properties = Object.fromEntries(
      schemas.flatMap(({ properties }) => Object.entries(clone(properties)))
    );
    const mergedSchema = this.Object(
      {},
      {
        ...options,
        // @ts-expect-error additionalProperties has wrong type in typebox
        additionalProperties:
          options?.additionalProperties ??
          this._mergeAdditionalProperties(schemas),
      }
    );
    mergedSchema.properties = properties;
    mergedSchema.required = required;
    return mergedSchema as TMergedObject<T>;
  }

  public EmptyObject(options?: ObjectOptions) {
    return this.Object({}, options);
  }

  _mergeAdditionalProperties(
    schemas: TObject<TProperties>[]
  ): TAdditionalProperties {
    const allProps = schemas.map(
      ({ additionalProperties }) =>
        additionalProperties as TAdditionalProperties
    );

    // if some schemas forbid additionalProperties
    if (allProps.some((p) => p === false)) {
      return false;
    }

    // if all schemas allow additionalProperties
    if (allProps.every((p) => p === true || p == null)) {
      return true;
    }

    const additionalPropertiesSchemas = allProps.filter(
      (props): props is TSchema => typeof props === "object"
    );

    return this.Union(additionalPropertiesSchemas);
  }
}

export * from "@sinclair/typebox";
export type TStringEnum<T extends string> = TKeyOf<T[]>;
export const Type = new TypeBuilderExt();
export { TypeBuilderExt as TypeBuilder };
