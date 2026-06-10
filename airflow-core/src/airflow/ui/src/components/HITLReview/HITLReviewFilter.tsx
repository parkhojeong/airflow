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
import { useTranslation } from "react-i18next";

import { ButtonGroupToggle } from "src/components/ui/ButtonGroupToggle";

export type HITLReviewFilterMode = "all" | "pending";

const HITL_REVIEW_FILTER_OPTIONS: Array<{ labelKey: string; value: HITLReviewFilterMode }> = [
  { labelKey: "review.filter.pending", value: "pending" },
  { labelKey: "review.filter.all", value: "all" },
];
const HITLReviewFilter = ({
  onChange,
  value,
}: {
  readonly onChange: (value: HITLReviewFilterMode) => void;
  readonly value: HITLReviewFilterMode;
}) => {
  const { t: translate } = useTranslation("hitl");

  return (
    <ButtonGroupToggle<HITLReviewFilterMode>
      onChange={onChange}
      options={HITL_REVIEW_FILTER_OPTIONS.map((option) => ({
        label: translate(option.labelKey),
        value: option.value,
      }))}
      size="xs"
      value={value}
    />
  );
};

export default HITLReviewFilter;
