import { useContext } from "react";

import AdminDataContext from "./AdminDataStore";

/**
 * Reads cached admin data.
 *
 * @returns {object} admin data and refresh functions
 */
export default function useAdminData() {
  const context = useContext(AdminDataContext);

  if (!context) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }

  return context;
}
