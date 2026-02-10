export const MOCK_USERS = [
  {
    username: "customer01@jagedo.co.ke",
    password: "Customer@123",
    userType: "CUSTOMER",
    profileType: "individual",
    firstName: "Customer",
    lastName: "Doe",
    adminApproved: true,
    userProfile: { complete: true }
  },
  {
    username: "customer02@jagedo.co.ke",
    password: "Customer@123",
    userType: "CUSTOMER",
    profileType: "organization",
    firstName: "Customer",
    lastName: "Smith",
    adminApproved: true,
    userProfile: { complete: true }
  },
  {
    username: "fundi01@jagedo.co.ke",
    password: "Builder@123",
    userType: "FUNDI",
    firstName: "Fundi",
    lastName: "One",
    adminApproved: false,
    userProfile: { complete: false }
  },
  {
    username: "professional01@jagedo.co.ke",
    password: "Builder@123",
    userType: "PROFESSIONAL",
    firstName: "Professional",
    lastName: "One",
    adminApproved: false,
    userProfile: { complete: false }
  },
  {
    username: "contractor01@jagedo.co.ke",
    password: "Builder@123",
    userType: "CONTRACTOR",
    firstName: "Contractor",
    lastName: "One",
    adminApproved: false,
    userProfile: { complete: false }
  },
  {
    username: "hardware01@jagedo.co.ke",
    password: "Builder@123",
    userType: "HARDWARE",
    firstName: "Hardware",
    lastName: "One",
    adminApproved: false,
    userProfile: { complete: false }
  },
  // ✅ Super Admin
  {
    username: "superadmin@jagedo.co.ke",
    password: "Admin@123",
    userType: "ADMIN",
    adminRole: "SUPER_ADMIN",
    firstName: "Super",
    lastName: "Admin",
    adminApproved: true,
    userProfile: { complete: true }
  },
  // ✅ Admin
  {
    username: "admin@jagedo.co.ke",
    password: "Admin@123",
    userType: "ADMIN",
    adminRole: "ADMIN",
    firstName: "Admin",
    lastName: "User",
    adminApproved: true,
    userProfile: { complete: true }
  },
  // ✅ Associate
  {
    username: "associate@jagedo.co.ke",
    password: "Admin@123",
    userType: "ADMIN",
    adminRole: "ASSOCIATE",
    firstName: "Associate",
    lastName: "User",
    adminApproved: true,
    userProfile: { complete: true }
  },
  // ✅ Agent
  {
    username: "agent@jagedo.co.ke",
    password: "Admin@123",
    userType: "ADMIN",
    adminRole: "AGENT",
    firstName: "Agent",
    lastName: "User",
    adminApproved: true,
    userProfile: { complete: true }
  }
];
