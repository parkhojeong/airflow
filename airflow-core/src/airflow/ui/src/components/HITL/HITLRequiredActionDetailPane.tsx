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
import { Text, VStack } from "@chakra-ui/react";

import { HITLRequiredActionCard } from "./HITLRequiredActionCard";
import type { SelectedHITLRequiredAction } from "./utils/requiredActionSelection";

const EMPTY_DETAIL_LABEL = "Select a required action to see details";

export const HITLRequiredActionDetailPane = ({
  onNavigate,
  onResponded,
  selected,
}: {
  readonly onNavigate: () => void;
  readonly onResponded: () => void;
  readonly selected?: SelectedHITLRequiredAction;
}) => {
  if (selected === undefined) {
    return (
      <VStack alignItems="center" gap={2} justifyContent="center" minH="240px" width="100%">
        <Text color="fg.muted" fontSize="sm">
          {EMPTY_DETAIL_LABEL}
        </Text>
      </VStack>
    );
  }

  return (
    <HITLRequiredActionCard
      detail={selected.item}
      key={selected.item.task_instance.id}
      onNavigate={onNavigate}
      onResponded={onResponded}
    />
  );
};
