// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
// Organisms
import { Checkout } from "@/organism/Checkout";
import { AccessDenied } from "@/organism/AccessDenied";
// Constants
import { ROLES } from "@/constants/access.constant";

const CheckoutPage = () => (
  <RequireAccess
    role={ROLES.INFLUENCER}
    fallback={
      <AccessDenied
        title="Not available for brand accounts"
        description="Applying to a job is only available to creator accounts."
      />
    }
  >
    <Checkout />
  </RequireAccess>
);

export default CheckoutPage;
