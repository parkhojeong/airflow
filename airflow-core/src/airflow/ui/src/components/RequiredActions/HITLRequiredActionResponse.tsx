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
import { Skeleton, Text, VStack } from "@chakra-ui/react";

import type { HITLDetailHistory, TaskInstanceHistoryResponse } from "openapi/requests/types.gen";
import { ErrorAlert } from "src/components/ErrorAlert";
import { HITLResponseForm } from "src/pages/HITLTaskInstances/HITLResponseForm";

const LOADING_RESPONSE_LABEL = "Loading response form...";

type HITLResponseFormDetail = {
  readonly task_instance: TaskInstanceHistoryResponse;
} & Omit<HITLDetailHistory, "task_instance">;

export const HITLRequiredActionResponse = ({
  error,
  hitlDetail,
  isError,
  isLoading,
  namespace,
  onResponded,
}: {
  readonly error: unknown;
  readonly hitlDetail?: HITLResponseFormDetail;
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly namespace: string;
  readonly onResponded?: () => void;
}) => {
  if (isError) {
    return <ErrorAlert error={error} />;
  }

  if (isLoading || hitlDetail === undefined) {
    return (
      <VStack alignItems="stretch" gap={2}>
        <Text color="fg.muted" fontSize="sm">
          {LOADING_RESPONSE_LABEL}
        </Text>
        <Skeleton height="80px" />
      </VStack>
    );
  }

  return <HITLResponseForm hitlDetail={hitlDetail} namespace={namespace} onResponded={onResponded} />;
};
