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
import { Box, Button, useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { LuUserRoundPen } from "react-icons/lu";
import { Link } from "react-router-dom";

import { useTaskInstanceServiceGetHitlDetails } from "openapi/queries";
import type { HITLDetailCollection } from "openapi/requests/types.gen";
import { HITLReviewModal } from "src/components/HITLReview/HITLReviewModal.tsx";
import { useHITLReviewRouteModalSync } from "src/components/HITLReview/useHITLReviewModal";
import { useAutoRefresh } from "src/utils/query";

import { StatsCard } from "./StatsCard";

const usePendingHitl = ({
  dagId,
  runId,
  taskId,
}: {
  readonly dagId?: string;
  readonly runId?: string;
  readonly taskId?: string;
}) => {
  const refetchInterval = useAutoRefresh({ checkPendingRuns: true, dagId });

  const { data: pendingHitlData, isLoading } = useTaskInstanceServiceGetHitlDetails(
    {
      dagId: dagId ?? "~",
      dagRunId: runId ?? "~",
      orderBy: ["dag_id", "run_after", "created_at", "task_display_name"],
      responseReceived: false,
      state: ["deferred", "awaiting_input"],
      taskId,
    },
    undefined,
    {
      refetchInterval,
    },
  );

  return {
    isLoading,
    pendingHitlData,
  };
};

const useCompletedHitl = ({
  dagId,
  enabled,
  runId,
}: {
  readonly dagId?: string;
  readonly enabled: boolean;
  readonly runId?: string;
}) => {
  const { data: completedHitlData } = useTaskInstanceServiceGetHitlDetails(
    {
      dagId: dagId ?? "~",
      dagRunId: runId ?? "~",
      orderBy: ["dag_id", "run_after", "created_at", "task_display_name"],
      responseReceived: true,
    },
    undefined,
    {
      enabled,
    },
  );

  return { completedHitlData };
};

const getCombinedHitlData = ({
  completedHitlData,
  pendingHitlData,
}: {
  readonly completedHitlData?: HITLDetailCollection;
  readonly pendingHitlData?: HITLDetailCollection;
}): HITLDetailCollection | undefined =>
  pendingHitlData === undefined && completedHitlData === undefined
    ? undefined
    : {
        hitl_details: [...(pendingHitlData?.hitl_details ?? []), ...(completedHitlData?.hitl_details ?? [])],
        total_entries: (pendingHitlData?.total_entries ?? 0) + (completedHitlData?.total_entries ?? 0),
      };

const NeedsReviewButtonCard = ({
  hitlTIsCount,
  isLoading,
  onClick,
}: {
  readonly hitlTIsCount: number;
  readonly isLoading: boolean;
  readonly onClick?: () => void;
}) => {
  const { i18n, t: translate } = useTranslation("hitl");

  const isRTL = i18n.dir() === "rtl";

  return hitlTIsCount > 0 ? (
    <Box maxW="250px">
      <StatsCard
        colorScheme="deferred"
        count={hitlTIsCount}
        icon={<LuUserRoundPen />}
        isLoading={isLoading}
        isRTL={isRTL}
        label={translate("requiredAction_other")}
        link="required_actions?response_received=false"
        onClick={onClick}
      />
    </Box>
  ) : undefined;
};

const ViewAllHITLReviewsButton = ({ onClick }: { readonly onClick: () => void }) => {
  const { t: translate } = useTranslation("hitl");

  return (
    <Button asChild size="sm" variant="outline">
      <Link onClick={onClick} to="/required_actions?response_received=false">
        {translate("review.viewAll")}
      </Link>
    </Button>
  );
};

export const NeedsReviewButton = ({
  dagId,
  runId,
  taskId,
}: {
  readonly dagId?: string;
  readonly runId?: string;
  readonly taskId?: string;
}) => {
  const { isLoading, pendingHitlData } = usePendingHitl({ dagId, runId, taskId });
  const hitlTIsCount = pendingHitlData?.hitl_details.length ?? 0;

  return <NeedsReviewButtonCard hitlTIsCount={hitlTIsCount} isLoading={isLoading} />;
};

export const NeedsReviewButtonWithModal = ({
  dagId,
  runId,
}: {
  readonly dagId?: string;
  readonly runId?: string;
}) => {
  const { onClose, onOpen, open } = useDisclosure();
  const { onCloseHITLReview } = useHITLReviewRouteModalSync({
    onClose,
    onOpen,
  });
  const shouldFetchCompletedHitl = dagId !== undefined && runId === undefined;
  const { isLoading, pendingHitlData } = usePendingHitl({ dagId, runId });
  const { completedHitlData } = useCompletedHitl({
    dagId,
    enabled: open && shouldFetchCompletedHitl,
    runId,
  });
  const hitlData = getCombinedHitlData({
    completedHitlData: shouldFetchCompletedHitl ? completedHitlData : undefined,
    pendingHitlData,
  });
  const hitlTIsCount = pendingHitlData?.hitl_details.length ?? 0;

  return (
    <>
      <NeedsReviewButtonCard hitlTIsCount={hitlTIsCount} isLoading={isLoading} onClick={onOpen} />
      <HITLReviewModal
        headerAction={
          dagId === undefined ? <ViewAllHITLReviewsButton onClick={onCloseHITLReview} /> : undefined
        }
        hitlData={hitlData}
        onClose={onCloseHITLReview}
        open={open}
      />
    </>
  );
};
