/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Button, Group, HStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useTaskInstanceServiceGetHitlDetails } from "openapi/queries";
import { useAutoRefresh } from "src/utils";

import { RequiredActionsDialog } from "./RequiredActionsDialog";
import type { RequiredActionsFilterMode } from "./RequiredActionsList";

const VIEW_ALL_REQUIRED_ACTIONS_LABEL = "View all required actions";
const REQUIRED_ACTIONS_LINK = "/required_actions?response_received=false";
const PENDING_ACTIONS_LABEL = "Pending";
const ALL_ACTIONS_LABEL = "All";
const PENDING_ACTIONS_VALUE = "pending" satisfies RequiredActionsFilterMode;
const ALL_ACTIONS_VALUE = "all" satisfies RequiredActionsFilterMode;

const getRequiredActionsFilterMode = (value?: string): RequiredActionsFilterMode =>
  value === ALL_ACTIONS_VALUE ? ALL_ACTIONS_VALUE : PENDING_ACTIONS_VALUE;

const REQUIRED_ACTION_FILTER_OPTIONS: Array<{ label: string; value: RequiredActionsFilterMode }> = [
  { label: PENDING_ACTIONS_LABEL, value: PENDING_ACTIONS_VALUE },
  { label: ALL_ACTIONS_LABEL, value: ALL_ACTIONS_VALUE },
];

const RequiredActionsFilter = ({
  onChange,
  value,
}: {
  readonly onChange: (value: RequiredActionsFilterMode) => void;
  readonly value: RequiredActionsFilterMode;
}) => (
  <Group backgroundColor="bg.muted" borderColor="border.emphasized" borderRadius={8} borderWidth={1} p={0.5}>
    {REQUIRED_ACTION_FILTER_OPTIONS.map((option) => {
      const selected = value === option.value;

      return (
        <Button
          _hover={{ backgroundColor: "bg.emphasized" }}
          bg={selected ? "bg.panel" : undefined}
          borderColor={selected ? "border.emphasized" : "transparent"}
          borderWidth={selected ? 1 : 0}
          key={option.value}
          minH={6}
          onClick={() => onChange(option.value)}
          px={2}
          size="xs"
          variant="ghost"
        >
          {option.label}
        </Button>
      );
    })}
  </Group>
);

export const ViewAllRequiredActionsButton = ({ onClick }: { readonly onClick: () => void }) => (
  <Button asChild size="sm" variant="outline">
    <Link onClick={onClick} to={REQUIRED_ACTIONS_LINK}>
      {VIEW_ALL_REQUIRED_ACTIONS_LABEL}
    </Link>
  </Button>
);

export const RequiredActionsModal = ({
  dagId,
  headerAction,
  onClose,
  open,
  runId,
}: {
  readonly dagId?: string;
  readonly headerAction?: ReactNode;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly runId?: string;
}) => {
  const [selectedFilter, setSelectedFilter] = useState<RequiredActionsFilterMode>(PENDING_ACTIONS_VALUE);
  const refetchInterval = useAutoRefresh({ checkPendingRuns: open, dagId: open ? dagId : undefined });
  const normalizedSelectedFilter = getRequiredActionsFilterMode(selectedFilter);
  const showAllActions = selectedFilter === ALL_ACTIONS_VALUE;
  const {
    data: hitlData,
    isError: hitlIsError,
    isLoading: hitlIsLoading,
  } = useTaskInstanceServiceGetHitlDetails(
    {
      dagId: dagId ?? "~",
      dagRunId: runId ?? "~",
      orderBy: ["dag_id", "run_after", "created_at", "task_display_name"],
      responseReceived: showAllActions ? undefined : false,
      state: showAllActions ? undefined : ["deferred", "awaiting_input"],
    },
    undefined,
    { enabled: open, refetchInterval },
  );

  return (
    <RequiredActionsDialog
      filterMode={normalizedSelectedFilter}
      headerAction={
        <HStack gap={2}>
          {headerAction}
          <RequiredActionsFilter onChange={setSelectedFilter} value={normalizedSelectedFilter} />
        </HStack>
      }
      hitlData={hitlData}
      hitlIsError={hitlIsError}
      hitlIsLoading={hitlIsLoading}
      onClose={onClose}
      open={open}
    />
  );
};
