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
import { Heading } from "@chakra-ui/react";

import type { DeadlineCollectionResponse, HITLDetailCollection } from "openapi/requests/types.gen";
import { Dialog } from "src/components/ui";

import { NotificationsList } from "./NotificationsList";

const NOTIFICATIONS_LABEL = "Notifications";

type NotificationsModalProps = {
  readonly deadlineData?: DeadlineCollectionResponse;
  readonly hitlData?: HITLDetailCollection;
  readonly onClose: () => void;
  readonly open: boolean;
};

export const NotificationsModal = ({ deadlineData, hitlData, onClose, open }: NotificationsModalProps) => (
  <Dialog.Root onOpenChange={onClose} open={open} scrollBehavior="inside" size="xl">
    <Dialog.Content backdrop maxW="1280px" p={4} width="96vw">
      <Dialog.Header>
        <Heading size="md">{NOTIFICATIONS_LABEL}</Heading>
      </Dialog.Header>
      <Dialog.CloseTrigger />
      <Dialog.Body>
        <NotificationsList deadlineData={deadlineData} hitlData={hitlData} />
      </Dialog.Body>
    </Dialog.Content>
  </Dialog.Root>
);
