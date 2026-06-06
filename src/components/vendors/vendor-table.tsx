"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vendor } from "@/lib/db";
import { deleteVendorAction, updateVendorAction } from "@/lib/actions/vendor";

interface VendorTableProps {
  vendors: Vendor[];
  loading?: boolean;
}

export function VendorTable({ vendors, loading }: VendorTableProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status badge style resolver
  const getStatusBadge = (status: Vendor["status"]) => {
    switch (status) {
      case "Active":
        return "bg-brand-green-muted/20 text-brand-green border-brand-green-border/20 shadow-[0_0_8px_rgba(74,222,128,0.05)]";
      case "Pending":
        return "bg-amber-950/20 text-amber-400 border-amber-800/30";
      case "Blacklisted":
        return "bg-destructive/15 text-destructive border-destructive/20";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  // Risk badge style resolver
  const getRiskBadge = (risk: Vendor["riskScore"]) => {
    switch (risk) {
      case "Low":
        return "bg-zinc-900 text-emerald-400 border-emerald-950/50";
      case "Medium":
        return "bg-zinc-900 text-amber-400 border-amber-950/50";
      case "High":
        return "bg-zinc-900 text-rose-400 border-rose-950/50";
      default:
        return "bg-zinc-900 text-zinc-400";
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewVendorId = params.get("viewVendor");
    if (viewVendorId) {
      const vendor = vendors.find((v) => v.id === viewVendorId);
      if (vendor) {
        setSelectedVendor(vendor);
        setViewDialogOpen(true);
      }
    }
  }, [vendors]);

  const handleCloseViewDialog = (open: boolean) => {
    setViewDialogOpen(open);
    if (!open) {
      const params = new URLSearchParams(window.location.search);
      params.delete("viewVendor");
      const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
      window.history.replaceState(null, "", newUrl);
    }
  };

  // Actions
  const handleView = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewDialogOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditVendor({ ...vendor });
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVendor) return;
    setIsUpdating(true);
    try {
      await updateVendorAction(editVendor.id, editVendor);
      toast.success("Vendor updated successfully");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update vendor");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteVendorId) return;
    setIsDeleting(true);
    try {
      await deleteVendorAction(deleteVendorId);
      toast.success("Vendor deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete vendor");
    } finally {
      setIsDeleting(false);
      setDeleteVendorId(null);
    }
  };

  const triggerDelete = (id: string) => {
    setDeleteVendorId(id);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border/40 bg-card/25 p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading vendors...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border/40 bg-card/15 backdrop-blur-md overflow-hidden green-glow-card">
        <Table>
          <TableHeader className="bg-secondary/25">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="w-[220px] text-xs font-semibold py-4 text-muted-foreground">Vendor Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">GST Number</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Contact</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Risk Score</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-semibold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {vendors.length === 0 ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/40 border border-zinc-800/40 text-muted-foreground">
                        <Building className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-sm text-foreground">No vendors found</h3>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Try refining your search terms or filter constraints, or add a new supplier.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <motion.tr
                    key={vendor.id}
                    data-slot="table-row"
                    className="border-b border-border/40 hover:bg-secondary/20 group cursor-default"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TableCell className="py-4 font-semibold text-xs text-foreground group-hover:text-brand-green transition-colors">
                      {vendor.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{vendor.category}</TableCell>
                    <TableCell className="text-xs font-mono tracking-tight text-foreground">{vendor.gstNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground/60" /> {vendor.contactEmail}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground/60" /> {vendor.contactPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold py-0.5 px-2.5 rounded-full ${getStatusBadge(vendor.status)}`}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold py-0.5 px-2 rounded-md ${getRiskBadge(vendor.riskScore)}`}>
                        {vendor.riskScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/60 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-card border border-border/40 text-xs w-36" align="end">
                          <DropdownMenuItem onClick={() => handleView(vendor)} className="focus:bg-secondary/50 focus:text-foreground cursor-pointer gap-2 py-2">
                            <Eye className="h-3.5 w-3.5" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(vendor)} className="focus:bg-secondary/50 focus:text-foreground cursor-pointer gap-2 py-2">
                            <Edit2 className="h-3.5 w-3.5" /> Edit details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => triggerDelete(vendor.id)} className="focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer gap-2 py-2">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* VIEW DIALOG */}
      <Dialog open={viewDialogOpen} onOpenChange={handleCloseViewDialog}>
        <DialogContent className="max-w-md bg-card border border-border/40 text-foreground">
          <DialogHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-muted/20 border border-brand-green-border/20 text-brand-green">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">{selectedVendor?.name}</DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground">ID: {selectedVendor?.id}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Category</span>
                  <span className="font-semibold">{selectedVendor.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">GST Number</span>
                  <span className="font-mono font-semibold">{selectedVendor.gstNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Status</span>
                  <Badge variant="outline" className={`text-[9px] font-bold py-0.5 px-2 rounded-full ${getStatusBadge(selectedVendor.status)}`}>
                    {selectedVendor.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Risk Rating</span>
                  <Badge variant="outline" className={`text-[9px] font-bold py-0.5 px-2 rounded-md ${getRiskBadge(selectedVendor.riskScore)}`}>
                    {selectedVendor.riskScore}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 space-y-2.5">
                <h4 className="font-semibold text-foreground">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-foreground">{selectedVendor.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-foreground">{selectedVendor.contactPhone}</span>
                  </div>
                  {selectedVendor.address && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{selectedVendor.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/40 pt-4">
            <Button variant="ghost" onClick={() => handleCloseViewDialog(false)} className="text-xs h-9 cursor-pointer border border-border/30">
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg bg-card border border-border/40 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit Vendor Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the registered details for this vendor profile.
            </DialogDescription>
          </DialogHeader>

          {editVendor && (
            <form onSubmit={handleUpdate} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="edit-name" className="text-xs font-semibold">Vendor Name</Label>
                  <Input
                    id="edit-name"
                    value={editVendor.name}
                    onChange={(e) => setEditVendor({ ...editVendor, name: e.target.value })}
                    className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="edit-category" className="text-xs font-semibold">Category</Label>
                  <Input
                    id="edit-category"
                    value={editVendor.category}
                    onChange={(e) => setEditVendor({ ...editVendor, category: e.target.value })}
                    className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="edit-gst" className="text-xs font-semibold">GST Number</Label>
                  <Input
                    id="edit-gst"
                    value={editVendor.gstNumber}
                    onChange={(e) => setEditVendor({ ...editVendor, gstNumber: e.target.value.toUpperCase() })}
                    className="bg-secondary/40 border-border/60 uppercase text-xs h-9 focus:border-brand-green-border"
                    maxLength={15}
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select
                    value={editVendor.status}
                    onValueChange={(val: any) => setEditVendor({ ...editVendor, status: val })}
                  >
                    <SelectTrigger className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border/40 text-xs">
                      <SelectItem value="Active" className="text-xs cursor-pointer">Active</SelectItem>
                      <SelectItem value="Pending" className="text-xs cursor-pointer">Pending</SelectItem>
                      <SelectItem value="Blacklisted" className="text-xs cursor-pointer">Blacklisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="edit-email" className="text-xs font-semibold">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editVendor.contactEmail}
                    onChange={(e) => setEditVendor({ ...editVendor, contactEmail: e.target.value })}
                    className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="edit-phone" className="text-xs font-semibold">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editVendor.contactPhone}
                    onChange={(e) => setEditVendor({ ...editVendor, contactPhone: e.target.value })}
                    className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label className="text-xs font-semibold">Risk Rating</Label>
                  <Select
                    value={editVendor.riskScore}
                    onValueChange={(val: any) => setEditVendor({ ...editVendor, riskScore: val })}
                  >
                    <SelectTrigger className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border/40 text-xs">
                      <SelectItem value="Low" className="text-xs cursor-pointer">Low Risk</SelectItem>
                      <SelectItem value="Medium" className="text-xs cursor-pointer">Medium Risk</SelectItem>
                      <SelectItem value="High" className="text-xs cursor-pointer">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="edit-address" className="text-xs font-semibold">Office Address</Label>
                  <Textarea
                    id="edit-address"
                    value={editVendor.address || ""}
                    onChange={(e) => setEditVendor({ ...editVendor, address: e.target.value })}
                    className="bg-secondary/40 border-border/60 text-xs min-h-[60px] focus:border-brand-green-border"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6 border-t border-border/40 pt-4 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs h-9 cursor-pointer border border-border/30"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-brand-green text-zinc-950 hover:bg-brand-green-hover text-xs font-semibold cursor-pointer h-9 px-4"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm bg-card border border-border/40 text-foreground">
          <DialogHeader>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive border border-destructive/20 mb-2">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <DialogTitle className="text-base font-semibold">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this vendor? This action is permanent and will remove them from the active registry database.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-xs h-9 cursor-pointer border border-border/30"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/80 text-xs font-semibold cursor-pointer h-9 px-4"
            >
              {isDeleting ? "Deleting..." : "Delete Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
