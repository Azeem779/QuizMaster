// ============ HARDCODED USERS ============
export const USERS = [
  { id: "admin", password: "admin123", name: "Admin User", avatar: "👨‍💻" },
  { id: "Deepali", password: "Test123", name: "Deepali", avatar: "👩‍🎓" },
  { id: "Azeem", password: "123Test", name: "Azeem", avatar: "👩‍🎓" },
  { id: "guest", password: "guest", name: "Guest User", avatar: "👤" },
];

// Find user by credentials
export function findUser(userId, password) {
  return USERS.find(u => u.id === userId && u.password === password);
}

// Find user by ID only
export function findUserById(userId) {
  return USERS.find(u => u.id === userId);
}