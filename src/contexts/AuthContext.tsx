import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  role: "admin" | "staff";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
};

// Mock users for frontend prototype
const MOCK_USERS = {
  admin: {
    id: "1",
    name: "مدير النظام",
    password: import.meta.env.VITE_ADMIN_PASSWORD,
    role: "admin" as const,
  },
  staff: {
    id: "2",
    name: "موظف المبيعات",
    password: import.meta.env.VITE_STAFF1_PASSWORD,
    role: "staff" as const,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth in localStorage on initial load
    const savedUser = localStorage.getItem("closetOrderUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("closetOrderUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would be an actual API call
      const mockUser = MOCK_USERS[username as keyof typeof MOCK_USERS];

      if (!mockUser || mockUser.password !== password) {
        throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
      }

      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);

      // Save to localStorage
      localStorage.setItem(
        "closetOrderUser",
        JSON.stringify(userWithoutPassword)
      );

      toast.success("تم تسجيل الدخول بنجاح");
    } catch (error) {
      toast.error((error as Error).message || "حدث خطأ أثناء تسجيل الدخول");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("closetOrderUser");
    toast.info("تم تسجيل الخروج");
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
