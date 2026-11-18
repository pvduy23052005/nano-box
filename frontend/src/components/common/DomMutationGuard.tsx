"use client";

import { useEffect } from "react";

type DomGuardWindow = Window & {
  __nanoBoxDomGuardInstalled?: boolean;
};

export default function DomMutationGuard() {
  useEffect(() => {
    const guardWindow = window as DomGuardWindow;
    if (guardWindow.__nanoBoxDomGuardInstalled) return;
    guardWindow.__nanoBoxDomGuardInstalled = true;

    const nodePrototype = Node.prototype;
    const originalRemoveChild = nodePrototype.removeChild;
    const originalInsertBefore = nodePrototype.insertBefore;

    nodePrototype.removeChild = function removeChild<T extends Node>(
      this: Node,
      child: T,
    ): T {
      if (!child || child.parentNode !== this) return child;
      return originalRemoveChild.call(this, child) as T;
    };

    nodePrototype.insertBefore = function insertBefore<T extends Node>(
      this: Node,
      newNode: T,
      referenceNode: Node | null,
    ): T {
      if (referenceNode !== null && referenceNode.parentNode !== this) {
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }, []);

  return null;
}
