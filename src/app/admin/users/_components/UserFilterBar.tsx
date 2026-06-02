import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/input";

interface UserFilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
}

export function UserFilterBar({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
}: UserFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <Input
        id="user-search"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        className="sm:max-w-xs"
      />
      <Select
        id="role-filter"
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        options={[
          { value: "", label: "All roles" },
          { value: "STUDENT", label: "Students" },
          { value: "OPERATOR", label: "Operators" },
          { value: "ADMIN", label: "Admins" },
        ]}
        className="sm:max-w-40"
      />
    </div>
  );
}
