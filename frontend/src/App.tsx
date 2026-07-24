import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/shared/Layout";
import { CreatorDirectory } from "./features/creators/CreatorDirectory";
import { CreatorProfile } from "./features/creators/CreatorProfile";
import { RegisterForm } from "./features/creators/RegisterForm";
import { Dashboard } from "./features/dashboard/Dashboard";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CreatorDirectory />} />
        <Route path="creators/:walletAddress" element={<CreatorProfile />} />
        <Route path="register" element={<RegisterForm />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
