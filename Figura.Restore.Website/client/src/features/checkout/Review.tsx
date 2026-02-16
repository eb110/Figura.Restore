import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { addressString, currencyFormat, paymentString } from "../../lib/util";
import type { ConfirmationToken } from "@stripe/stripe-js";
import { useBasket } from "../../lib/hooks/useBasket";

type Props = {
  confirmationToken: ConfirmationToken | null;
};

export default function Review({ confirmationToken }: Props) {
  //custom hook
  const { basket } = useBasket();

  //not possible as we have a flag in 'next' functionality on 'checkout stepper' = but always good to check
  const toAddressString = () => {
    if (!confirmationToken?.shipping) return "";
    const { name, address } = confirmationToken.shipping;
    return addressString({
      name: name ?? "",
      line1: address?.line1 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postal_code: address?.postal_code ?? "",
      country: address?.country ?? "",
    });
  };

  const getPaymentString = () => {
    if (!confirmationToken?.payment_method_preview.card) return "";
    const { card } = confirmationToken.payment_method_preview;
    return paymentString({
      last4: card.last4,
      brand: card.brand,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
    });
  };

  return (
    <div>
      <Box mt={4} width="100%">
        <Typography variant="h6" fontWeight="bold">
          Billing and delivery information
        </Typography>
        <dl>
          <Typography component="dt" fontWeight="medium">
            Shipping address
          </Typography>
          <Typography component="dd" mt={1} color="textSecondary">
            {toAddressString()}
          </Typography>

          <Typography component="dt" fontWeight="medium">
            Payment Details
          </Typography>
          <Typography component="dd" mt={1} color="textSecondary">
            {getPaymentString()}
          </Typography>
        </dl>
      </Box>

      <Box mt={6} mx="auto">
        <Divider />
        <TableContainer>
          <Table>
            <TableBody>
              {basket?.items.map((item) => (
                <TableRow
                  key={item.productId}
                  sx={{ borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  <TableCell sx={{ py: 4 }}>
                    <Box display="flex" alignItems="center">
                      <img
                        src={item.pictureUrl}
                        alt={item.name}
                        style={{ width: 40, height: 40 }}
                      />
                      <Typography sx={{ pl: 2 }}>{item.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ p: 4 }}>
                    x {item.quantity}
                  </TableCell>
                  <TableCell align="right" sx={{ p: 4 }}>
                    {currencyFormat(item.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
}
