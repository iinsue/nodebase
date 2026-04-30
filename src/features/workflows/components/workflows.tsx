"use client";

import { useRouter } from "next/navigation";

import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import {
  EntityContainer,
  EntityHeader,
  EntitySearch,
} from "@/components/entity-components";

import {
  useCreateWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useEntitySearch } from "../hooks/use-entity-search";
import { useWorkflowsParams } from "../hooks/use-workflows-params";

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      placeholder="Search workflows"
      onChange={onSearchChange}
      value={searchValue}
    />
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return <p>{JSON.stringify(workflows.data, null, 2)}</p>;
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },

      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};
