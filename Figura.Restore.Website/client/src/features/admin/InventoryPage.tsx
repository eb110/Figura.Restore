import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import { useFetchProductsQuery } from "../catalog/catalogApi";
import { currencyFormat } from "../../lib/util";
import { Delete, Edit } from "@mui/icons-material";
import AppPagination from "../../app/shared/components/AppPagination";
import { setPageNumber } from "../catalog/catalogSlice";
import { useState } from "react";
import ProductForm from "./ProductForm";

export default function InventoryPage() {
  //product params needed for products
  const productParams = useAppSelector((state) => state.catalog);

  //products and pagination
  const { data } = useFetchProductsQuery(productParams);

  //needed for pagination
  const dispatch = useAppDispatch();

  //form display state
  const [editMode, setEditMode] = useState(false);
  if (editMode) return <ProductForm />;

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Typography sx={{ p: 2 }} variant="h4">
          Inventory
        </Typography>
        <Button
          sx={{ m: 2 }}
          size="large"
          variant="contained"
          onClick={() => setEditMode(true)}
        >
          Create
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell align="left">Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">Brand</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data &&
              data.items.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {product.id}
                  </TableCell>
                  <TableCell align="left">
                    <Box display="flex" alignItems="center">
                      <img
                        src={product.pictureUrl}
                        alt={product.name}
                        style={{ height: 50, marginRight: 20 }}
                      />
                      <span>{product.name}</span>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {currencyFormat(product.price)}
                  </TableCell>
                  <TableCell align="center">{product.type}</TableCell>
                  <TableCell align="center">{product.brand}</TableCell>
                  <TableCell align="center">
                    {product.quantityInStock}
                  </TableCell>
                  <TableCell align="right">
                    <Button startIcon={<Edit />} />
                    <Button startIcon={<Delete />} color="error" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Box sx={{ p: 3 }}>
          {data?.pagination && data.items.length > 0 && (
            <AppPagination
              metadata={data.pagination}
              onPageChange={(page: number) => dispatch(setPageNumber(page))}
            />
          )}
        </Box>
      </TableContainer>
    </>
  );
}
