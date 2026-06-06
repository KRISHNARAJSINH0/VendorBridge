"use server";
import { db, AppUser } from "@/lib/db";

export async function loginAction(email: string, password: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const user = db.getUserByEmail(email);
  if (!user) return { success: false, error: "User not found. Please check your email." };
  if (user.password !== password) return { success: false, error: "Invalid password." };
  if (user.status !== "Active") return { success: false, error: "Account is inactive. Contact admin." };
  db.addLog({ userId: user.id, userName: `${user.firstName} ${user.lastName}`, role: user.role, action: "LOGIN", description: `${user.firstName} ${user.lastName} logged in as ${user.role}` });
  return { success: true, user };
}

export async function registerAction(data: {
  firstName: string; lastName: string; email: string; password: string; role: AppUser["role"];
  vendorName?: string; vendorCategory?: string; vendorGst?: string; vendorPhone?: string; vendorAddress?: string;
}): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const existing = db.getUserByEmail(data.email);
  if (existing) return { success: false, error: "Email already registered." };

  let vendorId: string | undefined;
  if (data.role === "Vendor") {
    if (!data.vendorName || !data.vendorGst || !data.vendorPhone || !data.vendorAddress) {
      return { success: false, error: "All vendor company details are required." };
    }
    const vendor = db.createVendor({
      name: data.vendorName,
      category: data.vendorCategory || "General",
      gstNumber: data.vendorGst,
      contactEmail: data.email,
      contactPhone: data.vendorPhone,
      status: "Pending",
      riskScore: "Medium",
      address: data.vendorAddress,
    });
    vendorId = vendor.id;
    db.addLog({ userName: data.vendorName, role: "Vendor", action: "VENDOR_REGISTERED", description: `Vendor ${data.vendorName} self-registered with GST ${data.vendorGst}` });
  }

  const user = db.createUser({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password, role: data.role, status: "Active", vendorId });
  db.addLog({ userId: user.id, userName: `${user.firstName} ${user.lastName}`, role: user.role, action: "REGISTER", description: `${user.firstName} ${user.lastName} registered as ${user.role}` });

  // Notify all admins about new registration
  db.getUsers().filter(u => u.role === "Admin" && u.id !== user.id).forEach(admin => {
    db.addNotification({ userId: admin.id, title: "New User Registered", message: `${user.firstName} ${user.lastName} registered as ${user.role}`, isRead: false });
  });

  return { success: true, user };
}

export async function getUsersAction(): Promise<AppUser[]> { return db.getUsers(); }

export async function createUserAction(data: Omit<AppUser, "id" | "createdAt">): Promise<AppUser> {
  const user = db.createUser(data);
  db.addLog({ userId: user.id, userName: `${user.firstName} ${user.lastName}`, role: user.role, action: "CREATE_USER", description: `Admin created user ${user.firstName} ${user.lastName} as ${user.role}` });
  return user;
}

export async function deleteUserAction(id: string): Promise<boolean> {
  const user = db.getUserById(id);
  if (user) db.addLog({ userName: `${user.firstName} ${user.lastName}`, role: "Admin", action: "DELETE_USER", description: `Deleted user ${user.firstName} ${user.lastName}` });
  return db.deleteUser(id);
}
