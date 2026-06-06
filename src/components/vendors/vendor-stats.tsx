"use client";

import { motion } from "framer-motion";
import { Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Vendor } from "@/lib/db";

interface VendorStatsProps {
  vendors: Vendor[];
}

export function VendorStats({ vendors }: VendorStatsProps) {
  const total = vendors.length;
  const active = vendors.filter((v) => v.status === "Active").length;
  const pending = vendors.filter((v) => v.status === "Pending").length;
  const blacklisted = vendors.filter((v) => v.status === "Blacklisted").length;

  const statCards = [
    {
      title: "Total Vendors",
      value: total,
      icon: Users,
      color: "text-zinc-400 bg-zinc-950/20 border-zinc-800/40",
      glow: "hover:border-zinc-700/60",
    },
    {
      title: "Active Vendors",
      value: active,
      icon: CheckCircle,
      color: "text-brand-green bg-brand-green-muted/10 border-brand-green-border/20",
      glow: "hover:border-brand-green-border/60 hover:shadow-[0_0_15px_rgba(74,222,128,0.06)]",
    },
    {
      title: "Pending Vendors",
      value: pending,
      icon: Clock,
      color: "text-amber-400 bg-amber-950/15 border-amber-900/20",
      glow: "hover:border-amber-700/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.06)]",
    },
    {
      title: "Blacklisted Vendors",
      value: blacklisted,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10 border-destructive/20",
      glow: "hover:border-destructive/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.06)]",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
    >
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card
              className={`relative overflow-hidden bg-card/40 border border-border/40 backdrop-blur-md transition-all duration-300 ${stat.glow} cursor-default group`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-foreground font-mono">
                    {stat.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    registered
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
