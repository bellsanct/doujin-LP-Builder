export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'color'
  | 'select'
  | 'switch'
  | 'boolean'
  | 'slider'
  | 'image'
  | 'array';

export interface SelectOption {
  value: string;
  label: string;
}

export interface BaseField<T extends FieldType = FieldType> {
  id: string;
  type: T;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
}

export interface TextField extends BaseField<'text' | 'textarea'> {
  rows?: number; // textarea
}

export interface NumberField extends BaseField<'number'> {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ColorField extends BaseField<'color'> {}

export interface SelectField extends BaseField<'select'> {
  options: SelectOption[];
}

export interface BooleanField extends BaseField<'boolean' | 'switch'> {}

export interface SliderField extends BaseField<'slider'> {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ImageField extends BaseField<'image'> {}

export interface ArrayField extends BaseField<'array'> {
  itemTemplate?: Record<string, unknown>;
}

export type FormField =
  | TextField
  | NumberField
  | ColorField
  | SelectField
  | BooleanField
  | SliderField
  | ImageField
  | ArrayField;

export interface FormSection {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  fields: FormField[];
}

export interface FormSchema {
  sections: FormSection[];
}

export interface TemplateSchema {
  formSchema: FormSchema;
}

