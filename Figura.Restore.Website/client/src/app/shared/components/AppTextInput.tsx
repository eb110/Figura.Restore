import { TextField, type TextFieldProps } from "@mui/material";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

//mui text field extended component
//have to utilise its props (TextFieldProps)

type Props<T extends FieldValues> = {
  label: string;
  //not sure why it also have to be the key of 'CreateProductSchema' - name is always a string
  name: keyof T;
} & UseControllerProps<T> &
  TextFieldProps;

//the idea is the TextInput will accept any T of form parameters
//for eample -> CreateProductSchema
//we have to share the control - in textfield - the FieldValues are the key
//this is why we have to extend base 'CreateProductSchema' props with FieldValues

export default function AppTextInput<T extends FieldValues>(props: Props<T>) {
  //these two are coming from mui text field
  //hook to work with controlled component - rerender isolated at hook level
  const { fieldState, field } = useController({ ...props });

  return (
    <TextField
      {...props}
      {...field}
      multiline={props.multiline}
      rows={props.rows}
      type={props.type}
      fullWidth
      value={field.value || ""}
      variant="outlined"
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  );
}
