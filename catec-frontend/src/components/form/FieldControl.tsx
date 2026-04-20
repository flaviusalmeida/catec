import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import "./FieldControl.css";

type Variant = "compact" | "modal";

type BaseProps = {
  variant?: Variant;
  className?: string;
};

type InputProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type SelectProps = BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
  };

type TextareaProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type FieldControlProps = InputProps | SelectProps | TextareaProps;

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export default function FieldControl(props: FieldControlProps) {
  const variantClass = props.variant ? `field-control--${props.variant}` : undefined;
  const classes = joinClassNames("field-control", variantClass, props.className);

  if (props.as === "select") {
    const { as: _as, variant: _variant, className, ...rest } = props;
    return <select {...rest} className={classes} />;
  }

  if (props.as === "textarea") {
    const { as: _as, variant: _variant, className, ...rest } = props;
    return <textarea {...rest} className={classes} />;
  }

  const { as: _as, variant: _variant, className, ...rest } = props;
  return <input {...rest} className={classes} />;
}
