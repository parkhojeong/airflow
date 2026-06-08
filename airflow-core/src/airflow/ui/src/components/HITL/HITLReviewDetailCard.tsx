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
import { Button, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { useTaskInstanceServiceGetHitlDetailTryDetail } from "openapi/queries";
import type { HITLDetail } from "openapi/requests/types.gen";
import { getTaskInstanceLink } from "src/utils/links";

import { HITLReviewResponse } from "./HITLReviewResponse";
import { HITLReviewSummary } from "./HITLReviewSummary";

const OPEN_TASK_LABEL = "Open task";

export const HITLReviewDetailCard = ({
  detail,
  onNavigate,
  onResponded,
}: {
  readonly detail: HITLDetail;
  readonly onNavigate?: () => void;
  readonly onResponded?: () => void;
}) => {
  const {
    data: hitlDetail,
    error,
    isError,
    isLoading,
  } = useTaskInstanceServiceGetHitlDetailTryDetail({
    dagId: detail.task_instance.dag_id,
    dagRunId: detail.task_instance.dag_run_id,
    mapIndex: detail.task_instance.map_index,
    taskId: detail.task_instance.task_id,
    tryNumber: detail.task_instance.try_number,
  });

  const ti = detail.task_instance;
  const taskLink = `${getTaskInstanceLink(ti)}/required_actions`;

  return (
    <VStack alignItems="stretch" gap={4} width="100%">
      <HITLReviewSummary detail={detail} />

      <Button alignSelf="flex-end" asChild size="sm" variant="outline">
        <Link onClick={onNavigate} to={taskLink}>
          {OPEN_TASK_LABEL}
        </Link>
      </Button>

      <HITLReviewResponse
        error={error}
        hitlDetail={hitlDetail}
        isError={isError}
        isLoading={isLoading}
        namespace={`hitl:${ti.id}`}
        onResponded={onResponded}
      />
    </VStack>
  );
};
