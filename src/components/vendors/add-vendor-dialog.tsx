"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Plus, Loader2, AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/context/StateContext";

const vendorSchema = zod.object({
  name: zod.string().min(2, "Vendor name must be at least 2 characters"),
  category: zod.string().min(2, "Category is required"),
  gstNumber: zod
    .string()
    .length(15, "GST number must be exactly 15 characters")
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format (e.g. 27AADCT4291B1Z0)"),
  contactEmail: zod.string().email("Invalid email address"),
  contactPhone: zod.string().min(10, "Phone number must be at least 10 digits"),
  status: zod.enum(["Active", "Pending", "Blacklisted"]),
  riskScore: zod.enum(["Low", "Medium", "High"]),
  address: zod.string().optional(),
});

type VendorFormValues = zod.infer<typeof vendorSchema>;

interface AddVendorDialogProps {
  onSuccess?: () => void;
}

export function AddVendorDialog({ onSuccess }: AddVendorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addVendor } = useAppState();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      status: "Pending",
      riskScore: "Medium",
      address: "",
    },
  });

  const statusVal = watch("status");
  const riskVal = watch("riskScore");

  const onSubmit = async (values: VendorFormValues) => {
    setLoading(true);
    try {
      await addVendor({
        name: values.name,
        email: values.contactEmail,
        category: values.category,
        gstNumber: values.gstNumber,
        phone: values.contactPhone,
        address: values.address,
        status: values.status
      });
      toast.success("Vendor added successfully", {
        description: `${values.name} has been registered as a procurement partner.`,
      });
      reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to add vendor", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) reset(); }}>
      <DialogTrigger asChild>
        <Button className="bg-brand-green text-zinc-950 font-semibold hover:bg-brand-green-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg green-glow-button h-10 px-4">
          <Plus className="mr-2 h-4 w-4" /> Add Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl bg-card border border-border/40 text-foreground overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">Register New Vendor</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Register a supplier partner in the system. Ensure details like GST number match legal records.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Vendor Name */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="name" className="text-xs font-semibold">Vendor Name *</Label>
              <Input
                id="name"
                placeholder="e.g. TechCore Ltd"
                className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                {...register("name")}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-[10px] text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="category" className="text-xs font-semibold">Category *</Label>
              <Input
                id="category"
                placeholder="e.g. IT, Construction, Logistics"
                className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                {...register("category")}
              />
              {errors.category && (
                <p className="flex items-center gap-1 text-[10px] text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.category.message}
                </p>
              )}
            </div>

            {/* GST Number */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="gstNumber" className="text-xs font-semibold">GST Number *</Label>
              <Input
                id="gstNumber"
                placeholder="15-digit code e.g. 27AADCT4291B1Z0"
                className="bg-secondary/40 border-border/60 uppercase text-xs h-9 focus:border-brand-green-border"
                maxLength={15}
                {...register("gstNumber")}
              />
              {errors.gstNumber && (
                <p className="flex items-center gap-1 text-[10px] text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.gstNumber.message}
                </p>
              )}
            </div>

            {/* Status Selection */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs font-semibold">Verification Status</Label>
              <Select
                value={statusVal}
                onValueChange={(val: any) => setValue("status", val)}
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

            {/* Contact Email */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="contactEmail" className="text-xs font-semibold">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="sales@vendor.com"
                className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                {...register("contactEmail")}
              />
              {errors.contactEmail && (
                <p className="flex items-center gap-1 text-[10px] text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.contactEmail.message}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="contactPhone" className="text-xs font-semibold">Contact Phone *</Label>
              <Input
                id="contactPhone"
                placeholder="+91 XXXXX XXXXX"
                className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                {...register("contactPhone")}
              />
              {errors.contactPhone && (
                <p className="flex items-center gap-1 text-[10px] text-destructive font-medium mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.contactPhone.message}
                </p>
              )}
            </div>

            {/* Risk Assessment */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="text-xs font-semibold">Risk Level</Label>
              <Select
                value={riskVal}
                onValueChange={(val: any) => setValue("riskScore", val)}
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

            {/* Office Address */}
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="address" className="text-xs font-semibold">Office Address</Label>
              <Textarea
                id="address"
                placeholder="Full street address, state, postal code..."
                className="bg-secondary/40 border-border/60 text-xs min-h-[60px] focus:border-brand-green-border"
                {...register("address")}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 border-t border-border/40 pt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-xs h-9 cursor-pointer hover:bg-secondary/50 border border-border/30"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-green text-zinc-950 hover:bg-brand-green-hover text-xs font-semibold cursor-pointer h-9 px-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Registering...
                </>
              ) : (
                "Save Supplier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
