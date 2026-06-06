"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getUsersAction, createUserAction, deleteUserAction } from "@/lib/actions/auth";
import { getVendorsAction } from "@/lib/actions/vendor";
import { AppUser, Vendor, UserRole } from "@/lib/db";
import { Users, Plus, Trash2, Mail, Shield, ShieldAlert, Star, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Procurement Officer" as UserRole,
    vendorId: "",
  });

  const loadData = async () => {
    try {
      const [u, v] = await Promise.all([getUsersAction(), getVendorsAction()]);
      setUsers(u);
      setVendors(v.filter(vendor => vendor.status === "Active"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "Admin") {
      loadData();
    }
  }, [user]);

  if (!user || user.role !== "Admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4 animate-bounce" />
        <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Only system administrators are authorized to manage user credentials and enterprise roles.
        </p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (id === user.id) {
      toast.error("Cannot delete your own administrator account!");
      return;
    }
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await deleteUserAction(id);
      if (res) {
        toast.success("User deleted successfully");
        loadData();
      } else {
        toast.error("Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createUserAction({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        status: "Active",
        vendorId: form.role === "Vendor" ? form.vendorId : undefined,
      });
      toast.success("User account created successfully");
      setDialogOpen(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", role: "Procurement Officer", vendorId: "" });
      loadData();
    } catch (err: any) {
      toast.error("Failed to create user", { description: err.message });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">User Directory</h2>
          <p className="text-xs text-muted-foreground">Manage organizational accounts, roles, access levels and permissions.</p>
        </div>
        <div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-green text-zinc-950 font-semibold hover:bg-brand-green-hover hover:scale-[1.02] transition-all cursor-pointer shadow-lg green-glow-button h-10 px-4">
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border border-border/40 text-foreground">
              <DialogHeader>
                <DialogTitle>Create Enterprise User</DialogTitle>
                <DialogDescription className="text-xs">Setup details for employees, managers, or external vendor user accounts.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">First Name</Label>
                    <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required className="bg-secondary/40 h-9 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Last Name</Label>
                    <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required className="bg-secondary/40 h-9 text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Email Address</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="bg-secondary/40 h-9 text-xs" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="bg-secondary/40 h-9 text-xs" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Role</Label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                    className="w-full h-9 rounded-md border border-border bg-secondary/40 px-3 text-xs outline-none focus:ring-1 focus:ring-brand-green">
                    <option>Procurement Officer</option>
                    <option>Manager</option>
                    <option>Vendor</option>
                    <option>Admin</option>
                  </select>
                </div>

                {form.role === "Vendor" && (
                  <div>
                    <Label className="text-xs font-semibold">Assign to Supplier Company</Label>
                    <select value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))} required
                      className="w-full h-9 rounded-md border border-border bg-secondary/40 px-3 text-xs outline-none focus:ring-1 focus:ring-brand-green">
                      <option value="">Select a vendor...</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <DialogFooter className="pt-4 gap-2">
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="text-xs h-9">Cancel</Button>
                  <Button type="submit" disabled={creating} className="bg-brand-green text-zinc-950 font-semibold hover:bg-brand-green-hover h-9">
                    {creating ? <><Loader2 className="animate-spin mr-1 h-3 w-3" /> Creating...</> : "Save User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/20 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 overflow-hidden bg-card/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-secondary/35 border-b border-border/40 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Supplier Attachment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/25">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-secondary/15 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-4 text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      u.role === "Admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      u.role === "Manager" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                      u.role === "Procurement Officer" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      <Shield className="h-3 w-3" /> {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {u.role === "Vendor" ? (
                      vendors.find(v => v.id === u.vendorId)?.name || <span className="text-yellow-500/80 font-medium">Unlinked</span>
                    ) : (
                      <span className="text-muted-foreground/45">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px]">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(u.id)} disabled={u.id === user.id}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
