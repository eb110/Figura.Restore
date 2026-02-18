import { Box, Button, Grid2, Paper, Typography } from "@mui/material";
import {
  createProductSchema,
  type CreateProductSchema,
} from "../../lib/schemas/createProductSchema";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AppTextInput from "../../app/shared/components/AppTextInput";
import { useFetchFiltersQuery } from "../catalog/catalogApi";
import AppSelectInput from "../../app/shared/components/AppSelectInput";
import AppDropzone from "../../app/shared/components/AppDropzone";
import type { Product } from "../../app/models/product";
import { useEffect } from "react";
import { useCreateProductMutation, useUpdateProductMutation } from "./adminApi";
import { LoadingButton } from "@mui/lab";
import { handleApiError } from "../../lib/util";

type Props = {
  setEditMode: (value: boolean) => void;
  product: Product | null;
  //needed for periodic refresh
  //different approach then on/off rtq_query caching
  refetch: () => void;
  //reset of the product form due to successful product submit
  setSelectedProduct: (value: Product | null) => void;
};

export default function ProductForm({
  setEditMode,
  product,
  refetch,
  setSelectedProduct,
}: Props) {
  //have to fetch types and brands for dropdown menu
  const { data } = useFetchFiltersQuery();

  //watch is needed for File preview
  //reset is for edition in case the component got already a product as a paramter
  //this is why useEffect triggers reset
  //issubmitting just for testing -> triggered by submit button
  //setError needed by the generic react form error handler
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm<CreateProductSchema>({
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

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  //needed for the edition state
  useEffect(() => {
    //update only -> if useEffect triggered it means something has been changed
    //and reset is needed
    if (product) reset(product);

    //file handling always require cleanup
    //during the component disposal =>
    return () => {
      if (watchFile) URL.revokeObjectURL(URL.createObjectURL(watchFile));
    };
  }, [product, reset, watchFile]);

  //the problem is that by default our object (data) is sent content-type application/json
  //it consist a file so it has to be a content-type FormData
  //once again => react form bases on FieldValues!!!
  const createFormData = (items: FieldValues) => {
    //on the be we are expecting a solid parameter from the FE -> CreateProductSchema
    //it strictly relates to UpdateProductDto (all required parameters with proper types and names)
    //content-type FormData requires FormData type
    //the solution is to apply all parameters and values to new FormData
    const formData = new FormData();
    for (const key in items) {
      formData.append(key, items[key]);
    }
    //now we have a formData which in fact is almost a 1 to 1 back end UpdateProductDto
    //the only missing paramter is Id but we will add it in adminApi rtq query file
    return formData;
  };

  const onSubmit = async (data: CreateProductSchema) => {
    try {
      const formData = createFormData(data);

      //in case the file upload issues (timing)
      if (watchFile) formData.append("file", watchFile);

      //unwrap for error handler
      if (product)
        await updateProduct({ id: product.id, data: formData }).unwrap();
      else await createProduct(formData).unwrap();
      //in case of edition -> this is the last resort so:
      setEditMode(false);
      //product submit => reset form to initial default state
      setSelectedProduct(null);
      //new stuff added -> refetch to populate just created / updated product
      refetch();
    } catch (error) {
      console.log(error);
      //zod parameters as array (field names)
      handleApiError<CreateProductSchema>(error, setError, [
        "brand",
        "type",
        "description",
        "file",
        "name",
        "pictureUrl",
        "quantityInStock",
        "price",
      ]);
    }
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
                alt="preview of image dupa"
                style={{ maxHeight: 200 }}
              />
            ) : product?.pictureUrl ? (
              <img
                src={product?.pictureUrl}
                alt="preview of image"
                style={{ maxHeight: 200 }}
              />
            ) : null}
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
          <LoadingButton
            variant="contained"
            color="success"
            type="submit"
            loading={isSubmitting}
          >
            Submit
          </LoadingButton>
        </Box>
      </form>
    </Box>
  );
}
