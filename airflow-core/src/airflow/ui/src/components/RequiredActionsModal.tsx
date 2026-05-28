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
import { Button } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";



import { useTaskInstanceServiceGetHitlDetails } from "openapi/queries";
import { NotificationsModal } from "src/layouts/Nav/NotificationsModal";
import { useAutoRefresh } from "src/utils";


const VIEW_ALL_REQUIRED_ACTIONS_LABEL = "View all required actions";
const REQUIRED_ACTIONS_LINK = "/required_actions?response_received=false";

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
  const refetchInterval = useAutoRefresh({ checkPendingRuns: open, dagId: open ? dagId : undefined });
  const {
    data: hitlData,
    isError: hitlIsError,
    isLoading: hitlIsLoading,
  } = useTaskInstanceServiceGetHitlDetails(
    {
      dagId: dagId ?? "~",
      dagRunId: runId ?? "~",
      responseReceived: false,
      state: ["deferred"],
    },
    undefined,
    { enabled: open, refetchInterval },
  );

  return (
    <NotificationsModal
      headerAction={headerAction}
      hitlData={hitlData}
      hitlIsError={hitlIsError}
      hitlIsLoading={hitlIsLoading}
      onClose={onClose}
      open={open}
    />
  );
};
