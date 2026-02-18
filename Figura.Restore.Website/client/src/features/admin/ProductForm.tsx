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
import type { Product } from "../../app/models/product";
import { useEffect } from "react";

type Props = {
  setEditMode: (value: boolean) => void;
  product: Product | null;
};

export default function ProductForm({ setEditMode, product }: Props) {
  //have to fetch types and brands for dropdown menu
  const { data } = useFetchFiltersQuery();

  //watch is needed for File preview
  //reset is for edition in case the component got already a product as a paramter
  //this is why useEffect triggers reset
  const { control, handleSubmit, watch, reset } = useForm<CreateProductSchema>({
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

  //needed for the edition state
  useEffect(() => {
    if (product) reset(product);
  }, [product, reset]);

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
            {watchFile ? (
              <img
                src={URL.createObjectURL(watchFile)}
                alt="preview of image"
                style={{ maxHeight: 200 }}
              />
            ) : (
              <img
                src={product?.pictureUrl}
                alt="preview of image"
                style={{ maxHeight: 200 }}
              />
            )}
          </Grid2>
        </Grid2>
        <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button
            onClick={() => setEditMode(false)}
            variant="contained"
            color="inherit"
          >
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
