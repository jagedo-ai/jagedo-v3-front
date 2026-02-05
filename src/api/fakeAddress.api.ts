const STORAGE_KEY = "user_addresses";

export interface Address {
  country: string;
  county: string;
  subCounty: string;
  estate: string;
}

const getDB = (): Record<number | string, Address> => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
};

const saveDB = (db: Record<number | string, Address>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const getUserAddress = (userId: number | string): Address | null => {
  // First check the user-specific key (used by signup flow)
  const userSpecificKey = `address_${userId}`;
  const userSpecificAddress = localStorage.getItem(userSpecificKey);
  if (userSpecificAddress) {
    try {
      return JSON.parse(userSpecificAddress);
    } catch {
      // Invalid JSON, continue to fallback
    }
  }

  // Fallback to the user_addresses DB
  const db = getDB();
  if (db[userId]) {
    return db[userId];
  }

  // Check if user object has address data
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id == userId && (user.country || user.county)) {
        return {
          country: user.country || "",
          county: user.county || "",
          subCounty: user.subCounty || "",
          estate: user.estate || user.town || user.village || "",
        };
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Return null if no address found (let component handle empty state)
  return null;
};

export const updateUserAddress = (
  userId: number | string,
  address: Address
) => {
  // Save to user-specific key (consistent with signup flow)
  const userSpecificKey = `address_${userId}`;
  localStorage.setItem(userSpecificKey, JSON.stringify(address));

  // Also save to the DB for backwards compatibility
  const db = getDB();
  db[userId] = address;
  saveDB(db);
};
