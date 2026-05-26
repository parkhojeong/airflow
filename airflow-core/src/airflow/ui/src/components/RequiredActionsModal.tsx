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
import { Link } from "react-router-dom";

import { useTaskInstanceServiceGetHitlDetails } from "openapi/queries";
import { NotificationsModal } from "src/layouts/Nav/NotificationsModal";
import { useReadHitl } from "src/layouts/Nav/useReadHitl";
import { useAutoRefresh } from "src/utils";

const VIEW_ALL_REQUIRED_ACTIONS_LABEL = "View all required actions";
const REQUIRED_ACTIONS_LINK = "required_actions?response_received=false";

export const RequiredActionsModal = ({
  onClose,
  open,
}: {
  readonly onClose: () => void;
  readonly open: boolean;
}) => {
  const refetchInterval = useAutoRefresh({ checkPendingRuns: true });
  const {
    data: hitlData,
    isError: hitlIsError,
    isLoading: hitlIsLoading,
  } = useTaskInstanceServiceGetHitlDetails(
    {
      dagId: "~",
      dagRunId: "~",
      responseReceived: false,
      state: ["deferred"],
    },
    undefined,
    { enabled: open, refetchInterval },
  );
  const { markAsRead: markHitlAsRead, readIds: hitlReadIds } = useReadHitl();

  return (
    <NotificationsModal
      headerAction={
        <Button asChild size="sm" variant="outline">
          <Link onClick={onClose} to={REQUIRED_ACTIONS_LINK}>
            {VIEW_ALL_REQUIRED_ACTIONS_LABEL}
          </Link>
        </Button>
      }
      hitlData={hitlData}
      hitlIsError={hitlIsError}
      hitlIsLoading={hitlIsLoading}
      hitlReadIds={hitlReadIds}
      onClose={onClose}
      onHitlRead={markHitlAsRead}
      open={open}
    />
  );
};
