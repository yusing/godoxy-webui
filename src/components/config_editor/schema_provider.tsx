import { toastError } from "@/types/api/endpoints";
import { ConfigFile, ConfigSchemaContext, Schema } from "@/types/file";
import { ajv, fetchSchema } from "@/types/schema";
import log from "loglevel";
import React from "react";

export const ConfigSchemaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [schema, setSchema] = React.useState<Schema>();

  React.useEffect(() => {
    let current: Schema = schema ?? { type: "config" };
    fetchSchema(current.type)
      .then((r) => r.json())
      .then((s) => {
        setSchema({
          type: current.type,
          schema: s,
          validate: ajv.getSchema(current.type) || ajv.compile(s),
        });
        log.debug(`loaded schema for ${current.type}`);
      })
      .catch(toastError);
  }, []);

  const setType = React.useCallback(
    (type: ConfigFile["type"]) => {
      setSchema({
        type: type,
      });
    },
    [setSchema],
  );

  return (
    <ConfigSchemaContext.Provider
      value={React.useMemo(
        () => ({
          schema: schema ?? { type: "config" },
          setType,
        }),
        [schema, setType],
      )}
    >
      {children}
    </ConfigSchemaContext.Provider>
  );
};
