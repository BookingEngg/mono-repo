// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
// Organisms
import { Earnings } from "@/organism/Earnings";
import { AccessDenied } from "@/organism/AccessDenied";
// Constants
import { ROLES } from "@/constants/access.constant";

/**
 * Creator only — a brand pays earnings out rather than accruing them, and the
 * API rejects a brand hitting this endpoint regardless.
 */
const EarningsPage = () => (
  <RequireAccess
    role={ROLES.INFLUENCER}
    fallback={
      <AccessDenied
        title="Not available for brand accounts"
        description="Earnings are only available to creator accounts. Brands can review payouts under Settlement."
      />
    }
  >
    <Earnings />
  </RequireAccess>
);

export default EarningsPage;
