
import { useOrganizationMembership } from "@/hooks/useOrganizationMembership";
import { useCurrentOrganization } from "@/hooks/useCurrentOrganization";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { Loader2, UserPlus, UserX, Shield, UserCog } from "lucide-react";
import { useOrganizationPermissions } from "@/hooks/useOrganizationPermissions";

const roleLabels: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Admin",
  manager: "Manager",
  collaborator: "Collaborateur",
};

const roleColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  manager: "bg-green-100 text-green-800",
  collaborator: "bg-gray-100 text-gray-800",
};

export default function OrganizationMembers() {
  const { currentOrg, isAdmin } = useCurrentOrganization();
  const { members, isLoading, inviteUser, updateMemberRole, removeMember } = useOrganizationMembership();
  const { permissionsByUserId } = useOrganizationPermissions();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"collaborator" | "manager" | "admin">("collaborator");
  const [inviting, setInviting] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-4 bg-yellow-50 rounded border text-yellow-700 text-sm">
        Seuls les admins peuvent gérer les membres de l'organisation.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-600" />
        Équipe & membres
      </h2>

      {/* Inviter un membre */}
      <form
        className="flex flex-col md:flex-row gap-2 mb-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setInviting(true);
          try {
            await inviteUser.mutateAsync({ email, role });
            setEmail("");
          } finally {
            setInviting(false);
          }
        }}
      >
        <Input
          type="email"
          placeholder="Email du membre"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Select value={role} onValueChange={(v) => setRole(v as any)}>
          <SelectTrigger className="min-w-[120px]">{roleLabels[role]}</SelectTrigger>
          <SelectContent>
            <SelectItem value="collaborator">{roleLabels.collaborator}</SelectItem>
            <SelectItem value="manager">{roleLabels.manager}</SelectItem>
            <SelectItem value="admin">{roleLabels.admin}</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={inviting || !email}>
          {inviting ? <Loader2 className="animate-spin w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          Inviter
        </Button>
      </form>

      {/* Liste des membres */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rôle</th>
              <th className="p-2 text-left">Statut</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Permissions (read-only)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  <Loader2 className="animate-spin mx-auto w-6 h-6" />
                  Chargement...
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-b text-sm">
                  <td className="p-2">{member.email}</td>
                  <td className="p-2">
                    <span className={`inline-block px-2 py-1 rounded ${roleColors[member.role]}`}>
                      {roleLabels[member.role] || member.role}
                    </span>
                  </td>
                  <td className="p-2">
                    {member.deactivated ? (
                      <Badge variant="destructive">Désactivé</Badge>
                    ) : (
                      <Badge variant="default">Actif</Badge>
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(newRole) =>
                        updateMemberRole.mutate({ memberId: member.id, newRole: newRole as any })
                      }
                      disabled={member.role === "owner"}
                    >
                      <SelectTrigger className="min-w-[100px]">{roleLabels[member.role]}</SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collaborator">{roleLabels.collaborator}</SelectItem>
                        <SelectItem value="manager">{roleLabels.manager}</SelectItem>
                        <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                        <SelectItem value="owner" disabled>
                          {roleLabels.owner}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      title="Désactiver"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMember.mutate(member.id)}
                      disabled={member.deactivated || member.role === "owner"}
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </td>
                  <td className="p-2 text-xs">
                    {permissionsByUserId[member.user_id]
                      ? Object.entries(permissionsByUserId[member.user_id])
                          .map(
                            ([module, perms]: any) =>
                              `${module}: ${
                                perms.can_read
                                  ? perms.can_write
                                    ? "Lecture/Écriture"
                                    : "Lecture seule"
                                  : "Aucun"
                              }`
                          )
                          .join(", ")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
