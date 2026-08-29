import { FormHTMLAttributes, FunctionComponent } from "preact";
import z from "zod";

export type UIFieldMeta = {
  label: string;
  type: "text" | "number" | "password" | "textarea" | "checkbox";
  placeholder?: string;
};

export const FormRegistry = z.registry<UIFieldMeta>();

interface FormFieldConfig extends UIFieldMeta {
  name: string;
  required: boolean;
}

function generateFormConfig(schema: z.ZodObject): FormFieldConfig[] {
  return Array.from(function* () {
    for (const [fieldName, fieldSchema] of Object.entries(schema.shape)) {
      const meta = FormRegistry.get(fieldSchema);
      if (!meta) {
        continue;
      }

      const isRequired = !(fieldSchema instanceof z.ZodOptional ||
        fieldSchema instanceof z.ZodNullable);

      yield {
        name: fieldName,
        label: meta.label,
        type: meta.type,
        placeholder: meta.placeholder,
        required: isRequired,
      };
    }
  }());
}

export function makePostSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
) {
  return z.discriminatedUnion("action", [
    z.object({ action: z.literal("cancel") }),
    schema.extend({ action: z.literal("save") }),
  ]);
}

export const SchemaBasedForm: FunctionComponent<
  { schema: z.ZodObject } & FormHTMLAttributes
> = (
  { schema, ...propsForm },
) => {
  const fields = generateFormConfig(schema);

  return (
    <div class="schema-form">
      <form {...propsForm}>
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
                />
              )}
          </div>
        ))}
        <footer class="actions">
          <button type="submit" name="action" value="save">Register</button>
          <button type="submit" name="action" value="cancel" formnovalidate>
            Cancel
          </button>
        </footer>
      </form>
    </div>
  );
};
