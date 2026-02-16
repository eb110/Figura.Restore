import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import Review from "./Review";
import {
  useFetchAddressQuery,
  useUpdateUserAddressMutation,
} from "../account/accountApi";
import type { Address } from "../../app/models/address";
import {
  type ConfirmationToken,
  type StripeAddressElementChangeEvent,
  type StripePaymentElementChangeEvent,
} from "@stripe/stripe-js";
import { useBasket } from "../../lib/hooks/useBasket";
import { currencyFormat } from "../../lib/util";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../orders/orderApi";

const steps = ["Address", "Payment", "Review"];

export default function CheckoutStepper() {
  //stepper stage ('page') positioning
  const [activeStep, setActiveStep] = useState(0);

  //fetch user name and address during the component instantiation
  //spread operation => will give two parameters - name and the rest address is going to be the rest
  //of the object without name parameter
  const { data: address, isLoading } = useFetchAddressQuery();

  //the user have to have the ability to update the address
  const [updateAddress] = useUpdateUserAddressMutation();

  //to control the checkbox to save the address
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);

  //we have to update the data on the backed for just performed order payments
  //the payment itself is triggered by client and performed by stripe
  //we have to update its state on the api - clear cookie, update items quantity
  //check if warehouse quantity can cover the order
  const [createOrder] = useCreateOrderMutation();

  //to get the access to 'stripe' address we have to utilize stripe hook
  const elements = useElements();

  //stepper has its own validation system - we have to obatin stepper properties for
  //current address/cc etc and check if the state for all is as 'complete'
  const [addressComplete, setAddressComplete] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const { total, clearBasket } = useBasket();

  //stripe token component
  const stripe = useStripe();
  //stripe token
  const [confirmationToken, setConfirmationToken] =
    useState<ConfirmationToken | null>(null);

  //confirm payment state
  //to perform after stripe token fetch
  const [submitting, setSubmitting] = useState(false);
  //custom hook
  const { basket } = useBasket();
  const navigate = useNavigate();

  const handleNext = async () => {
    //if we are on the address step and the save checkobx is selected => save address
    if (activeStep === 0 && saveAddressChecked && elements) {
      //get the address from stripe
      const address = await getStripeAddress();
      if (address) await updateAddress(address);
    }

    //confirmation stripe component based on stripe token
    if (activeStep === 1) {
      //stripe hooks
      if (!elements || !stripe) return;
      //required for confirmation token creation
      const result = await elements.submit();
      if (result.error) return toast.error(result.error.message);

      //address and payment deatils
      const stripeResult = await stripe.createConfirmationToken({ elements });
      if (stripeResult.error) return toast.error(stripeResult.error.message);
      //set confirmation token
      setConfirmationToken(stripeResult.confirmationToken);
      //then and only then user can go to the 'review' step of the stepper
      //review will have stripe TOKEN
    }

    //we have token atm - we can perform final stripe confirmation
    if (activeStep === 2) {
      await confirmPayment();
    }
    if (activeStep < 2) setActiveStep((step) => step + 1);
  };

  //stripe token does not equal - confirm payment => this has to be handled
  const confirmPayment = async () => {
    setSubmitting(true);
    try {
      //client stripe token and secrets have to have been at this stage => but just in case
      if (!confirmationToken || !basket?.clientSecret)
        throw new Error("Unable to process payment");

      const orderModel = await createOrderModel();
      //this is the place we have all updated on the API
      //the order status is still 'pending' as the payment still has't been performed
      //on the client
      //business rule -> first sort out order on the API -> THEN payment on the client
      const orderResult = await createOrder(orderModel);

      const paymentResult = await stripe?.confirmPayment({
        clientSecret: basket.clientSecret,
        redirect: "if_required",
        confirmParams: {
          confirmation_token: confirmationToken.id,
        },
      });

      if (paymentResult?.paymentIntent?.status === "succeeded") {
        //payment succeeded - clear basket / basketId cookie
        //order updated on API - order result included
        navigate("/checkout/success", { state: orderResult });
        clearBasket();
      } else if (paymentResult?.error) {
        throw new Error(paymentResult.error.message);
      } else {
        throw new Error("payment process failed - something went wrong");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      setActiveStep((step) => step - 1);
    } finally {
      //the confirmation of payment is at the end here - can be successful or have error
      setSubmitting(false);
    }
  };

  //to perform the api update - we have to prepare dto's
  const createOrderModel = async () => {
    //user have to type the shipping address to stripe
    //its the natural place to obtain it for api
    const shippingAddress = await getStripeAddress();

    const paymentSummary = confirmationToken?.payment_method_preview.card;

    if (!shippingAddress || !paymentSummary)
      throw new Error("problem creating order");

    //its the actual data required for the dto recognizable by api
    //CreateOrderDto
    return { shippingAddress, paymentSummary };
  };

  const getStripeAddress = async () => {
    //custom function from stripe
    const addressElement = elements?.getElement("address");

    if (!addressElement) return null;

    const {
      value: { name, address },
    } = await addressElement.getValue();

    if (name && address) return { ...address, name };

    return null;
  };

  //stepper movement
  const handleBack = () => {
    setActiveStep((step) => step - 1);
  };

  const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    setAddressComplete(event.complete);
  };

  const handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    setPaymentComplete(event.complete);
  };

  if (isLoading)
    return <Typography variant="h6">Loading content...</Typography>;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          return (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: activeStep === 0 ? "block" : "none" }}>
          <AddressElement
            options={{
              mode: "shipping",
              defaultValues: {
                name: address ? address.name : "",
                address: address ? address : ({} as Address),
              },
            }}
            onChange={handleAddressChange}
          />
          <FormControlLabel
            sx={{ display: "flex", justifyContent: "end", paddingTop: 2 }}
            control={
              <Checkbox
                checked={saveAddressChecked}
                onChange={(e) => setSaveAddressChecked(e.target.checked)}
              />
            }
            label="Save as default address"
          />
        </Box>
        <Box sx={{ display: activeStep === 1 ? "block" : "none" }}>
          <PaymentElement
            onChange={handlePaymentChange}
            options={{ wallets: { applePay: "never", googlePay: "never" } }}
          />
        </Box>
        <Box sx={{ display: activeStep === 2 ? "block" : "none" }}>
          <Review confirmationToken={confirmationToken} />
        </Box>
      </Box>

      <Box display="flex" paddingTop={2} justifyContent="space-between">
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        <LoadingButton
          onClick={handleNext}
          disabled={
            (activeStep === 0 && !addressComplete) ||
            (activeStep === 1 && !paymentComplete) ||
            submitting
          }
          loading={submitting}
        >
          {activeStep === steps.length - 1
            ? `Pay ${currencyFormat(total)}`
            : "Next"}
        </LoadingButton>
      </Box>
    </Paper>
  );
}
