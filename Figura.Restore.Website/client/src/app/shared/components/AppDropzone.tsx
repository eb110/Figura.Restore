import { UploadFile } from "@mui/icons-material";
import { FormControl, FormHelperText, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

//Form input handled by zod

type Props<T extends FieldValues> = {
  name: keyof T;
} & UseControllerProps<T>;

//field values are form fields to work with -> T in this case is a zod schema type
export default function AppDropzone<T extends FieldValues>(props: Props<T>) {
  //these two are coming from mui text field
  //hook to work with controlled component - rerender isolated at hook level
  const { fieldState, field } = useController({ ...props });

  //memo for functions
  //so onDrop is memoized and in case of component rerender -> the function doesn't get recreated
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        //one file per list - in this case -> first file in a list
        const fileWithPreview = Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        });
        //field -> on of the form field -> hooked with onForm component
        //current field is related to File
        field.onChange(fileWithPreview);
      }
    },
    [field],
  );

  //acceptedFiles -> dropped content (files)
  //isDragActive -> hooverig idicator
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  //styling
  const dzStyles = {
    display: "flex",
    border: "dashed 2px #767676",
    borderColor: "#767676",
    borderRadius: "5px",
    paddingTop: "30px",
    alignItems: "center",
    height: 200,
    width: 500,
  };

  const dzActive = {
    borderColor: "green",
  };

  return (
    <div {...getRootProps()}>
      <FormControl
        style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles}
        error={!!fieldState.error}
      >
        <input {...getInputProps()} />
        <UploadFile sx={{ fontSize: "100px" }} />
        <Typography variant="h4">Drop Image Here</Typography>
        <FormHelperText>{fieldState.error?.message}</FormHelperText>
      </FormControl>
    </div>
  );
}
