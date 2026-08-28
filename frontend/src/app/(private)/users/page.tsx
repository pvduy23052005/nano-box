"use client";

import UserCard from "../../../features/user/components/UserCard";
import { Button } from "../../../components/ui/button";
import { Filter, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";

export default function UsersPage() {
  return (
    <div className="flex h-screen flex-col w-full bg-background text-foreground">
      <main className="flex-1 overflow-auto p-3">
        <div className="flex sm:flex-row sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <InputGroup className="w-full">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder="Tìm kiếm người dùng..." />
            </InputGroup>
          </div>
          <Button
            variant="outline"
            className="bg-transparent whitespace-nowrap"
          >
            <Filter className="mr-2 h-4 w-4" /> Lọc
          </Button>
        </div>

        <UserCard />
      </main>
    </div>
  );
}
