import { Box, Button, Grid2, Paper, Typography } from "@mui/material";
import {
  createProductSchema,
  type CreateProductSchema,
} from "../../lib/schemas/createProductSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AppTextInput from "../../app/shared/components/AppTextInput";
import { useFetchFiltersQuery } from "../catalog/catalogApi";
import AppSelectInput from "../../app/shared/components/AppSelectInput";
import AppDropzone from "../../app/shared/components/AppDropzone";

export default function ProductForm() {
  //have to fetch types and brands for dropdown menu
  const { data } = useFetchFiltersQuery();

  //watch is needed for File preview
  const { control, handleSubmit, watch } = useForm<CreateProductSchema>({
    mode: "onTouched",
    //this in fact is the validator
    resolver: zodResolver(createProductSchema),
    //needed as we have 'controled' input
    //defaultValues: {name: "",},
    //can be overulled by default value injected straight to the field controller
  });

  //'file' comes from the zod File parameter 'file'
  //so in face we are informing useForm to 'watch' one of its field
  //that is declared by zod which name is 'file'
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchFile = watch("file");

  const onSubmit = (data: CreateProductSchema) => {
    console.log(data);
  };

  return (
    <Box component={Paper} sx={{ p: 4, maxWidth: "lg", mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Product details
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={3}>
          <Grid2 size={12}>
            <AppTextInput control={control} name="name" label="Product name" />
          </Grid2>
          <Grid2 size={6}>
            {data?.brands && (
              <AppSelectInput
                control={control}
                name="brand"
                label="Brand"
                items={data.brands}
              />
            )}
          </Grid2>
          <Grid2 size={6}>
            {data?.types && (
              <AppSelectInput
                control={control}
                name="type"
                label="Type"
                items={data.types}
              />
            )}
          </Grid2>
          <Grid2 size={6}>
            <AppTextInput
              type="number"
              control={control}
              name="price"
              label="Price in pennies"
            />
          </Grid2>
          <Grid2 size={6}>
            <AppTextInput
              control={control}
              type="number"
              name="quantityInStock"
              label="Quantity"
            />
          </Grid2>
          <Grid2 size={12}>
            <AppTextInput
              control={control}
              name="description"
              label="Description"
              multiline
              rows={4}
            />
          </Grid2>
          <Grid2
            size={12}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <AppDropzone name="file" control={control} />
            {watchFile && (
              <img
                //src={watchFile.preview}
                src={URL.createObjectURL(watchFile)}
                alt="preview of image"
                style={{ maxHeight: 200 }}
              />
            )}
          </Grid2>
        </Grid2>
        <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button variant="contained" color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="success" type="submit">
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
}
