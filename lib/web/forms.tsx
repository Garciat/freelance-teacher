import z from "zod";

export type UIFieldMeta = {
  label: string;
  type: "text" | "number" | "password" | "textarea" | "checkbox";
  placeholder?: string;
};

export const FormRegistry = z.registry<UIFieldMeta>();

interface FormFieldConfig<T> extends UIFieldMeta {
  name: string;
  required: boolean;
}

function generateFormConfig<T>(
  schema: z.ZodObject,
): FormFieldConfig<T>[] {
  return Array.from(function* () {
    for (const [fieldName, fieldSchema] of Object.entries(schema.shape)) {
      const meta = FormRegistry.get(fieldSchema);
      if (!meta) {
        continue;
      }

      const isRequired = !(fieldSchema instanceof z.ZodOptional ||
        fieldSchema instanceof z.ZodNullable);

      yield {
        name: fieldName as Extract<keyof T, string>,
        label: meta.label,
        type: meta.type,
        placeholder: meta.placeholder,
        required: isRequired,
      };
    }
  }());
}

function makeFormDataCodec<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return z.codec(
    z.record(z.string(), z.string()),
    schema,
    {
      decode: (value) => value as z.input<typeof schema>,
      encode: (value) => value as Record<string, string>,
    },
  );
}
export function makePostSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
) {
  return z.discriminatedUnion("action", [
    z.object({ action: z.literal("cancel") }),
    schema.extend({ action: z.literal("save") }),
  ]);
}

type SchemaBasedFormProps<T extends z.ZodRawShape> = {
  schema: z.ZodObject<T>;
  value?: z.output<z.ZodObject<T>>;
};

export const SchemaBasedForm = <T extends z.ZodRawShape>({
  schema,
  value,
}: SchemaBasedFormProps<T>) => {
  const fields = generateFormConfig(schema);

  const codec = makeFormDataCodec(schema);

  const record = value && codec.encode(value);

  return (
    <div className="schema-form">
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name}>
            {field.label}
          </label>

          {field.type === "textarea"
            ? (
              <textarea
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
              />
            )
            : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                defaultChecked={field.type === "checkbox" ? false : undefined}
                defaultValue={record?.[field.name]}
              />
            )}
        </div>
      ))}
      <footer className="actions">
        <button type="submit" name="action" value="save">OK</button>
        <button type="submit" name="action" value="cancel" formNoValidate>
          Cancel
        </button>
      </footer>
    </div>
  );
};
