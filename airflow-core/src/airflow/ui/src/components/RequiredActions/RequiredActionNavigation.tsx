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
import { HStack, IconButton } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { Tooltip } from "src/components/ui";

const NEXT_REQUIRED_ACTION_LABEL = "Next";
const PREVIOUS_REQUIRED_ACTION_LABEL = "Prev";

export const RequiredActionNavigation = ({
  canNavigateRequiredActions,
  hasNextRequiredAction,
  hasPreviousRequiredAction,
  onNext,
  onPrevious,
}: {
  readonly canNavigateRequiredActions: boolean;
  readonly hasNextRequiredAction: boolean;
  readonly hasPreviousRequiredAction: boolean;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
}) => (
  <HStack gap={1}>
    <Tooltip content={PREVIOUS_REQUIRED_ACTION_LABEL}>
      <IconButton
        aria-label={PREVIOUS_REQUIRED_ACTION_LABEL}
        disabled={!canNavigateRequiredActions || !hasPreviousRequiredAction}
        onClick={onPrevious}
        size="xs"
        variant="ghost"
      >
        <FiChevronLeft />
      </IconButton>
    </Tooltip>
    <Tooltip content={NEXT_REQUIRED_ACTION_LABEL}>
      <IconButton
        aria-label={NEXT_REQUIRED_ACTION_LABEL}
        disabled={!canNavigateRequiredActions || !hasNextRequiredAction}
        onClick={onNext}
        size="xs"
        variant="ghost"
      >
        <FiChevronRight />
      </IconButton>
    </Tooltip>
  </HStack>
);
