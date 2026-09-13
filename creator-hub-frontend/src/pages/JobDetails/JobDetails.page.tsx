// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
// Organisms
import { JobDetails } from "@/organism/JobDetails";
import { AccessDenied } from "@/organism/AccessDenied";
// Constants
import { ROLES } from "@/constants/access.constant";

const JobDetailsPage = () => (
  <RequireAccess
    role={ROLES.INFLUENCER}
    fallback={
      <AccessDenied
        title="Not available for brand accounts"
        description="Job details are only available to creator accounts."
      />
    }
  >
    <JobDetails />
  </RequireAccess>
);

export default JobDetailsPage;
