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
import { useDisclosure } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useRequiredActionsModal = (redirectPath: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    onClose: onCloseRequiredActionsModal,
    onOpen: onOpenRequiredActions,
    open: requiredActionsOpen,
  } = useDisclosure();
  const isRequiredActionsRoute = location.pathname.endsWith("/required_actions");
  const openedFromRouteRef = useRef(false);

  useEffect(() => {
    if (isRequiredActionsRoute) {
      openedFromRouteRef.current = true;
      onOpenRequiredActions();
    } else if (openedFromRouteRef.current) {
      openedFromRouteRef.current = false;
      onCloseRequiredActionsModal();
    }
  }, [isRequiredActionsRoute, onCloseRequiredActionsModal, onOpenRequiredActions]);

  const onCloseRequiredActions = () => {
    openedFromRouteRef.current = false;
    onCloseRequiredActionsModal();

    if (isRequiredActionsRoute) {
      void Promise.resolve(navigate(redirectPath, { replace: true }));
    }
  };

  return {
    onCloseRequiredActions,
    onOpenRequiredActions,
    requiredActionsOpen,
  };
};
