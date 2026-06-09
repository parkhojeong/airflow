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
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { Tooltip } from "src/components/ui";

export const HITLReviewNavigation = ({
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
}: {
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
}) => {
  const { t: translate } = useTranslation("hitl");
  const previousLabel = translate("review.navigation.previous");
  const nextLabel = translate("review.navigation.next");

  return (
    <HStack gap={1}>
      <Tooltip content={previousLabel}>
        <IconButton
          aria-label={previousLabel}
          disabled={!hasPrevious}
          onClick={onPrevious}
          size="xs"
          variant="ghost"
        >
          <FiChevronLeft />
        </IconButton>
      </Tooltip>
      <Tooltip content={nextLabel}>
        <IconButton aria-label={nextLabel} disabled={!hasNext} onClick={onNext} size="xs" variant="ghost">
          <FiChevronRight />
        </IconButton>
      </Tooltip>
    </HStack>
  );
};
