# Data Access Layer (DAL) for Authorization

## 🗄️ Data Access Layer (DAL) for Authorization

The **Data Access Layer (DAL)** centralizes all data requests and authorization logic, ensuring a clean separation of concerns and maintainable codebase.

---

### 🏗️ Layered Structure

- **Cookies (Stateless Sessions)** and **Database Sessions** should each have their own:
  - **DAL** (Data Access Layer)
  - **DTO** (Data Transfer Object) layers

---

### 🔐 Session Verification

- The DAL must provide a function to **verify the user's session** during application interactions.
  - **Minimum requirement:** Check if the session is valid.
  - **Next steps:** Redirect or return only the user information necessary for further requests.

---

### ✅ Types of Authorization Checks

There are two main types of authorization checks:

1. **Optimistic Authorization**
   - Checks if the user is authorized using session data stored in the **cookie**.
   - **Use cases:** Quick operations, such as:
     - Showing/hiding UI elements
     - Redirecting users based on permissions or roles

2. **Secure Authorization**
   - Checks if the user is authorized using session data stored in the **database**.
   - **Use cases:** Operations requiring access to sensitive data or actions.

---

### 📝 Recommendations

- **Centralize authorization logic** in a dedicated Data Access Layer.
- **Use Data Transfer Objects (DTOs)** to return only the necessary data.
- **Optionally:** Use middleware for optimistic checks.

---

