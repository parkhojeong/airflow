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
import { useCallback, useState } from "react";

const STORAGE_KEY = "airflow.readHitlIds";

const loadFromStorage = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return new Set(stored ? (JSON.parse(stored) as Array<string>) : []);
  } catch {
    return new Set();
  }
};

const saveToStorage = (ids: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
};

export const useReadHitl = () => {
  const [readIds, setReadIds] = useState<Set<string>>(loadFromStorage);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);

      next.add(id);
      saveToStorage(next);

      return next;
    });
  }, []);

  return { markAsRead, readIds };
};
