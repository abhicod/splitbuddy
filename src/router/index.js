import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/AuthStore";

// Auth pages
import AuthPage from "@/pages/UnAuth/AuthPage.vue";

// Authenticated pages
import DashboardPage from "@/pages/Auth/DashboardPage.vue";
import HomePage from "@/pages/Auth/HomePage.vue";
import GroupsPage from "@/pages/Auth/GroupsPage.vue";
import GroupDetailPage from "@/pages/Auth/GroupDetailPage.vue";
import FriendsPage from "@/pages/Auth/FriendsPage.vue";
import ExpensesPage from "@/pages/Auth/ExpensesPage.vue";
import MonthlyExpensesPage from "@/pages/Auth/MonthlyExpensesPage.vue";
import AnalyticsPage from "@/pages/Auth/AnalyticsPage.vue";
import EditProfilePage from "@/pages/Auth/EditProfilePage.vue";

const routes = [
  // Redirect root to dashboard if authenticated, otherwise to auth
  {
    path: "/",
    redirect: () => {
      const authStore = useAuthStore();
      return authStore.isAuthenticated ? "/dashboard" : "/auth";
    }
  },

  // Public routes
  {
    path: "/auth",
    component: AuthPage,
    name: "Auth",
    meta: { requiresGuest: true }
  },

  {
    path: "/login",
    redirect: "/auth"
  },

  {
    path: "/signup",
    redirect: "/auth"
  },

  {
    path: "/register",
    redirect: "/auth"
  },

  // Protected routes
  {
    path: "/dashboard",
    component: DashboardPage,
    name: "Dashboard",
    meta: { requiresAuth: true }
  },
  {
    path: "/home",
    component: HomePage,
    name: "Home",
    meta: { requiresAuth: true }
  },
  {
    path: "/groups",
    component: GroupsPage,
    name: "Groups",
    meta: { requiresAuth: true }
  },
  {
    path: "/groups/:groupId",
    component: GroupDetailPage,
    name: "GroupDetail",
    meta: { requiresAuth: true }
  },
  {
    path: "/friends",
    component: FriendsPage,
    name: "Friends",
    meta: { requiresAuth: true }
  },
  {
    path: "/expenses",
    component: ExpensesPage,
    name: "Expenses",
    meta: { requiresAuth: true }
  },
  {
    path: "/expenses/monthly",
    component: MonthlyExpensesPage,
    name: "MonthlyExpenses",
    meta: { requiresAuth: true }
  },
  {
    path: "/expenses/analytics",
    component: AnalyticsPage,
    name: "Analytics",
    meta: { requiresAuth: true }
  },
  {
    path: "/profile/edit",
    component: EditProfilePage,
    name: "EditProfile",
    meta: { requiresAuth: true }
  },

  // Catch all route
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/auth");
    return;
  }

  // Check if route requires guest (unauthenticated user)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/dashboard");
    return;
  }

  next();
});

export default router;
