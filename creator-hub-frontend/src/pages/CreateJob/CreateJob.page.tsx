// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
// Organisms
import { CreateJob } from "@/organism/CreateJob";
import { AccessDenied } from "@/organism/AccessDenied";
// Constants
import { PRIVILEGES } from "@/constants/access.constant";

const CreateJobPage = () => (
  <RequireAccess
    privilege={PRIVILEGES.CREATE_JOBS}
    fallback={
      <AccessDenied
        title="Brand account required"
        description="Posting a job is only available to brand accounts."
      />
    }
  >
    <CreateJob />
  </RequireAccess>
);

export default CreateJobPage;
