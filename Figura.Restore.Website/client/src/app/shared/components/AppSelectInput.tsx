import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { SelectInputProps } from "@mui/material/Select/SelectInput";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

//select dropdown component
//fieldValues are the key props
//the generic schema we want to hook it with have to extend these props
type Props<T extends FieldValues> = {
  label: string;
  //not sure why it also have to be the key of 'CreateProductSchema' - name is always a string
  name: keyof T;
  //values to select from the dropdown
  items: string[];
} & UseControllerProps<T> &
  //dropdown -> this time we have to consume MUI dropdown select parameters
  //we don't want to utilise all select props
  //partial changes them all to optional so we dont have to instantiate it
  Partial<SelectInputProps>;

export default function AppSelectInput<T extends FieldValues>(props: Props<T>) {
  //these two are coming from mui text field
  //hook to work with controlled component - rerender isolated at hook level
  const { fieldState, field } = useController({ ...props });

  return (
    <FormControl fullWidth error={!!fieldState.error}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        value={field.value || ""}
        label={props.label}
        onChange={field.onChange}
      >
        {props.items.map((item, index) => (
          <MenuItem value={item} key={index}>
            {item}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{fieldState.error?.message}</FormHelperText>
    </FormControl>
  );
}
