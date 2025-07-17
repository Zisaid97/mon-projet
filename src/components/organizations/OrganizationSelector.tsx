
import { useCurrentOrganization } from "@/hooks/useCurrentOrganization";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Building2 } from "lucide-react";

export default function OrganizationSelector() {
  const { organizations, currentOrg, selectOrganization, isLoading } = useCurrentOrganization();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Chargement...</div>;
  }

  if (organizations.length === 0) {
    return null;
  }

  if (organizations.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Building2 className="w-4 h-4" />
        <span>{currentOrg?.name}</span>
      </div>
    );
  }

  return (
    <Select
      value={currentOrg?.id || ""}
      onValueChange={selectOrganization}
    >
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <SelectValue placeholder="Sélectionner une organisation" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            <div className="flex items-center gap-2">
              {org.logo_url && (
                <img
                  src={org.logo_url}
                  alt="Logo"
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span>{org.name}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {org.user_role}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
