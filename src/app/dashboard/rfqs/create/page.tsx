"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ListTodo,
  Users2,
  Plus,
  Trash2,
  UploadCloud,
  FileCode,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  X,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vendor } from "@/lib/types";
import { useAppState } from "@/context/StateContext";

// Stepper configuration
const STEPS = [
  { number: 1, label: "Basic Info", icon: FileText },
  { number: 2, label: "Line Items", icon: ListTodo },
  { number: 3, label: "Assign Suppliers", icon: Users2 },
];

const CATEGORIES = [
  "IT & Software",
  "Office Infrastructure",
  "Construction & Raw Materials",
  "Logistics & Shipping",
  "Industrial Equipment",
  "Others",
];

// Zod schemas per step
const step1Schema = zod.object({
  title: zod.string().min(3, "Title must be at least 3 characters"),
  category: zod.string().min(2, "Category is required"),
  budget: zod.number().positive("Budget must be positive"),
  deadline: zod.string().min(1, "Deadline date is required"),
  description: zod.string().min(10, "Description must be at least 10 characters"),
});

const rfqSchema = zod.object({
  title: zod.string().min(3, "Title must be at least 3 characters"),
  category: zod.string().min(2, "Category is required"),
  budget: zod.number().positive(),
  deadline: zod.string().min(1),
  description: zod.string().min(10),
  items: zod
    .array(
      zod.object({
        itemName: zod.string().min(2, "Item name required"),
        quantity: zod.number().positive("Qty must be > 0"),
        unit: zod.string().min(1, "Unit required"),
        estimatedCost: zod.number().positive("Cost must be > 0"),
      })
    )
    .min(1, "At least one line item is required"),
  vendorIds: zod.array(zod.string()).min(1, "At least one supplier must be assigned"),
});

type RFQFormValues = zod.infer<typeof rfqSchema>;

export default function CreateRFQPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const { vendors, createRFQ } = useAppState();
  const loadingVendors = false;
  
  // Attachments state
  const [attachments, setAttachments] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm<RFQFormValues>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      category: "",
      items: [{ itemName: "", quantity: 1, unit: "Nos", estimatedCost: 1000 }],
      vendorIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const categoryVal = watch("category");
  const selectedVendorIds = watch("vendorIds") || [];
  const rfqItems = watch("items") || [];

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (files: FileList) => {
    const newAttachments = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file), // mock url
    }));
    setAttachments([...attachments, ...newAttachments]);
    toast.success(`${files.length} file(s) ready to attach`);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  // Navigations
  const handleNext = async () => {
    if (currentStep === 1) {
      const isStep1Valid = await trigger(["title", "category", "budget", "deadline", "description"]);
      if (isStep1Valid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const isStep2Valid = await trigger("items");
      if (isStep2Valid) setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onFormSubmit = async (values: RFQFormValues, publish = true) => {
    const rfqData = {
      title: values.title,
      description: values.description,
      category: values.category,
      budget: Number(values.budget),
      deadline: values.deadline,
      items: values.items.map((it) => ({
        name: it.itemName,
        qty: Number(it.quantity),
        unit: it.unit || "pcs"
      })),
      assignedVendors: values.vendorIds
    };

    try {
      await createRFQ(rfqData);
      toast.success(publish ? "RFQ Published successfully" : "RFQ Draft saved", {
        description: `Tender event "${values.title}" created.`,
      });
      router.push("/rfqs");
    } catch (e) {
      toast.error("Failed to create RFQ");
    }
  };

  const getStepDirectionAnimation = (step: number) => {
    return {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.2 },
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/40 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Create RFQ
        </h2>
        <p className="text-xs text-muted-foreground">
          Publish a request for quotation to suppliers for competitive bidding.
        </p>
      </div>

      {/* Modern Stepper Indicator */}
      <div className="relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-zinc-800 -z-10" />
        <div
          className="absolute top-4 left-6 right-6 h-0.5 bg-brand-green -z-10 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        <div className="flex items-center justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <div key={step.number} className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    // Quick step navigation only if validated
                    if (step.number < currentStep) {
                      setCurrentStep(step.number);
                    } else if (step.number === currentStep + 1) {
                      handleNext();
                    }
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 outline-none cursor-pointer ${
                    isCompleted
                      ? "bg-brand-green text-zinc-950 border-brand-green shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                      : isActive
                      ? "bg-zinc-950 text-brand-green border-brand-green shadow-[0_0_8px_rgba(74,222,128,0.15)]"
                      : "bg-zinc-950 text-muted-foreground border-zinc-800"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="h-4.5 w-4.5" /> : step.number}
                </button>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <form onSubmit={handleSubmit((values) => onFormSubmit(values, true))} className="space-y-6">
        <Card className="bg-card/15 border-border/40 backdrop-blur-md green-glow-card">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step-1" {...getStepDirectionAnimation(1)} className="space-y-4 text-xs">
                  <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-green" /> Step 1: Basic Information
                  </h3>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-semibold text-foreground">RFQ Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Office Furniture Procurement Q2"
                      className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                      {...register("title")}
                    />
                    {errors.title && <p className="text-[10px] text-destructive font-medium mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Category *</Label>
                      <Select
                        value={categoryVal}
                        onValueChange={(val) => setValue("category", val)}
                      >
                        <SelectTrigger className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border/40 text-xs">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-xs cursor-pointer">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-[10px] text-destructive font-medium mt-1">{errors.category.message}</p>}
                    </div>

                    {/* Budget */}
                    <div className="space-y-1.5">
                      <Label htmlFor="budget" className="text-xs font-semibold text-foreground">Estimated Budget (INR) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="₹ Budget"
                        className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                        {...register("budget", { valueAsNumber: true })}
                      />
                      {errors.budget && <p className="text-[10px] text-destructive font-medium mt-1">{errors.budget.message}</p>}
                    </div>

                    {/* Deadline */}
                    <div className="space-y-1.5">
                      <Label htmlFor="deadline" className="text-xs font-semibold text-foreground">Bid Deadline Date *</Label>
                      <Input
                        id="deadline"
                        type="date"
                        className="bg-secondary/40 border-border/60 text-xs h-9 focus:border-brand-green-border"
                        {...register("deadline")}
                      />
                      {errors.deadline && <p className="text-[10px] text-destructive font-medium mt-1">{errors.deadline.message}</p>}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-semibold text-foreground">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Specify requirements, scope of work, technical dimensions, etc..."
                      className="bg-secondary/40 border-border/60 text-xs min-h-[100px] focus:border-brand-green-border"
                      {...register("description")}
                    />
                    {errors.description && <p className="text-[10px] text-destructive font-medium mt-1">{errors.description.message}</p>}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step-2" {...getStepDirectionAnimation(2)} className="space-y-4">
                  <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-brand-green" /> Step 2: Line Items
                  </h3>

                  <div className="border border-border/40 rounded-lg overflow-hidden bg-card/25">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-secondary/25 border-b border-border/40 text-muted-foreground font-semibold">
                          <th className="p-3">Item Name</th>
                          <th className="p-3 w-24">Quantity</th>
                          <th className="p-3 w-28">Unit</th>
                          <th className="p-3 w-36">Est. Cost (per unit)</th>
                          <th className="p-3 w-16 text-center">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, index) => (
                          <tr key={field.id} className="border-b border-border/30 hover:bg-secondary/10">
                            <td className="p-2">
                              <Input
                                placeholder="e.g. Ergonomic Chairs"
                                className="bg-secondary/30 border-border/40 text-xs h-8 focus:border-brand-green-border"
                                {...register(`items.${index}.itemName` as const)}
                              />
                              {errors.items?.[index]?.itemName && (
                                <p className="text-[10px] text-destructive font-medium mt-0.5">{errors.items[index]?.itemName?.message}</p>
                              )}
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                className="bg-secondary/30 border-border/40 text-xs h-8 focus:border-brand-green-border"
                                {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                              />
                            </td>
                            <td className="p-2">
                              <Select
                                value={rfqItems[index]?.unit || "Nos"}
                                onValueChange={(val) => setValue(`items.${index}.unit` as const, val)}
                              >
                                <SelectTrigger className="bg-secondary/30 border-border/40 text-xs h-8 focus:border-brand-green-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border border-border/40 text-xs">
                                  <SelectItem value="Nos" className="text-xs cursor-pointer">Nos</SelectItem>
                                  <SelectItem value="Kg" className="text-xs cursor-pointer">Kg</SelectItem>
                                  <SelectItem value="Liters" className="text-xs cursor-pointer">Liters</SelectItem>
                                  <SelectItem value="Meters" className="text-xs cursor-pointer">Meters</SelectItem>
                                  <SelectItem value="Sets" className="text-xs cursor-pointer">Sets</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                placeholder="₹ Price"
                                className="bg-secondary/30 border-border/40 text-xs h-8 focus:border-brand-green-border"
                                {...register(`items.${index}.estimatedCost` as const, { valueAsNumber: true })}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => fields.length > 1 && remove(index)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                disabled={fields.length === 1}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ itemName: "", quantity: 1, unit: "Nos", estimatedCost: 1000 })}
                    className="border-dashed border-border hover:bg-secondary/40 border-brand-green-border/40 hover:border-brand-green text-xs font-semibold cursor-pointer h-9 px-4 w-full"
                  >
                    <Plus className="mr-2 h-4.5 w-4.5" /> Add Line Item
                  </Button>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step-3" {...getStepDirectionAnimation(3)} className="space-y-6">
                  <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-brand-green" /> Step 3: Vendor Assignment
                  </h3>

                  <div className="space-y-4">
                    <Label className="text-xs font-semibold">Select Suppliers for this Tender *</Label>
                    
                    {loadingVendors ? (
                      <p className="text-xs text-muted-foreground animate-pulse">Loading vendor directory...</p>
                    ) : (
                      <div className="grid gap-3.5 sm:grid-cols-2">
                        {vendors.map((vendor: Vendor) => {
                          const isChecked = selectedVendorIds.includes(vendor.id);
                          return (
                            <button
                              key={vendor.id}
                              type="button"
                              onClick={() => {
                                if (isChecked) {
                                  setValue(
                                    "vendorIds",
                                    selectedVendorIds.filter((id) => id !== vendor.id)
                                  );
                                } else {
                                  setValue("vendorIds", [...selectedVendorIds, vendor.id]);
                                }
                                trigger("vendorIds");
                              }}
                              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 outline-none cursor-pointer select-none ${
                                isChecked
                                  ? "bg-brand-green-muted/20 border-brand-green-border text-foreground shadow-[0_0_10px_rgba(74,222,128,0.04)]"
                                  : "bg-zinc-950/20 border-border/40 text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                              }`}
                            >
                              <div className="space-y-1 pr-4 min-w-0">
                                <span className={`text-xs font-semibold block truncate ${isChecked ? "text-brand-green" : "text-foreground"}`}>
                                  {vendor.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate">{vendor.category} | GST: {vendor.gstNumber}</span>
                              </div>
                              <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                  isChecked
                                    ? "bg-brand-green text-zinc-950 border-brand-green"
                                    : "border-border/60"
                                }`}
                              >
                                {isChecked && <CheckCircle className="h-4 w-4" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {errors.vendorIds && <p className="text-[10px] text-destructive font-medium mt-1">{errors.vendorIds.message}</p>}
                  </div>

                  {/* Selected Vendors tags summary */}
                  <AnimatePresence>
                    {selectedVendorIds.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="space-y-2 border-t border-border/40 pt-4"
                      >
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned Partners</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedVendorIds.map((vid) => {
                            const name = vendors.find((v: Vendor) => v.id === vid)?.name || vid;
                            return (
                              <Badge
                                key={vid}
                                variant="outline"
                                className="bg-secondary/40 text-xs font-medium border-border/60 rounded-full px-2.5 py-0.5 gap-1.5 flex items-center select-none"
                              >
                                <span>{name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setValue(
                                      "vendorIds",
                                      selectedVendorIds.filter((id) => id !== vid)
                                    );
                                    trigger("vendorIds");
                                  }}
                                  className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full outline-none focus:ring-1 focus:ring-ring"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Global Attachment Upload Zone */}
        <Card className="bg-card/15 border-border/40 backdrop-blur-md green-glow-card">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-zinc-400" /> Documents & Attachments
            </h3>

            {/* Drag & drop box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-brand-green bg-brand-green-muted/10 shadow-[0_0_15px_oklch(0.72_0.20_144.2_/_8%)]"
                  : "border-border/45 bg-zinc-950/20 hover:border-zinc-700/60"
              }`}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 shadow-inner">
                  <UploadCloud className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-xs font-semibold text-foreground">Drag & drop files, or <span className="text-brand-green hover:underline">browse locally</span></span>
                <span className="text-[10px] text-muted-foreground">PDF, XLSX, DOCX, ZIP files up to 10MB</span>
              </label>
            </div>

            {/* Files listing */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border/30 pt-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Ready to upload</span>
                  {attachments.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between rounded-lg border border-border/40 bg-zinc-950/40 p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-4">
                        <FileCode className="h-4 w-4 text-brand-green shrink-0" />
                        <span className="truncate font-semibold text-foreground">{file.fileName}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">({(file.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment(file.id)}
                        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-full"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Wizard Action buttons */}
        <div className="flex items-center justify-between border-t border-border/40 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className={`text-xs h-9 cursor-pointer border border-border/30 hover:bg-secondary/40 ${
              currentStep === 1 ? "opacity-30 pointer-events-none" : ""
            }`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Step
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSubmit((values) => onFormSubmit(values, false))}
              className="text-xs h-9 border border-zinc-800 hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Save Draft
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-brand-green text-zinc-950 hover:bg-brand-green-hover text-xs font-semibold cursor-pointer h-9 px-4"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-brand-green text-zinc-950 hover:bg-brand-green-hover text-xs font-semibold cursor-pointer h-9 px-4 shadow-lg green-glow-button"
              >
                Publish Tender RFQ
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
