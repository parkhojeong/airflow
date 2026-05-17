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
import { Heading, HStack } from "@chakra-ui/react";
import { useState } from "react";

import type { DeadlineCollectionResponse, HITLDetailCollection } from "openapi/requests/types.gen";
import { ButtonGroupToggle, Dialog, type ButtonGroupOption } from "src/components/ui";

import { type NotificationFilter, NotificationsList } from "./NotificationsList";

const NOTIFICATIONS_LABEL = "Notifications";
const ALL_LABEL = "All";
const HITL_LABEL = "HITL";
const DEADLINES_LABEL = "Deadlines";

type NotificationsModalProps = {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly hitlData?: HITLDetailCollection;
  readonly onClose: () => void;
  readonly open: boolean;
};

export const NotificationsModal = ({ deadlineData, hitlData, onClose, open }: NotificationsModalProps) => {
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>("all");
  const hitlTotal = hitlData?.total_entries ?? 0;
  const deadlineTotal = deadlineData?.total_entries ?? 0;
  const notificationTotal = hitlTotal + deadlineTotal;
  const filterOptions: Array<ButtonGroupOption<NotificationFilter>> = [
    { label: `${ALL_LABEL} (${notificationTotal})`, value: "all" },
    { label: `${HITL_LABEL} (${hitlTotal})`, value: "hitl" },
    { label: `${DEADLINES_LABEL} (${deadlineTotal})`, value: "deadline" },
  ];

  return (
    <Dialog.Root onOpenChange={onClose} open={open} scrollBehavior="inside" size="xl">
      <Dialog.Content backdrop maxW="832px" p={4} width={{ base: "96vw", lg: "57vw" }}>
        <Dialog.Header>
          <HStack flexWrap="wrap" gap={4}>
            <Heading flexShrink={0} size="md">
              {NOTIFICATIONS_LABEL}
            </Heading>
            <ButtonGroupToggle<NotificationFilter>
              onChange={setNotificationFilter}
              options={filterOptions}
              value={notificationFilter}
            />
          </HStack>
        </Dialog.Header>
        <Dialog.CloseTrigger />
        <Dialog.Body>
          <NotificationsList
            deadlineData={deadlineData}
            hitlData={hitlData}
            notificationFilter={notificationFilter}
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  );
};
