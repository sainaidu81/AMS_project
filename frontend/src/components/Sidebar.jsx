import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PrecisionManufacturingRoundedIcon from "@mui/icons-material/PrecisionManufacturingRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import KeyboardReturnRoundedIcon from "@mui/icons-material/KeyboardReturnRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import { NavLink } from "react-router-dom";

const menu = [
  { name: "Dashboard", icon: <DashboardRoundedIcon />, path: "/dashboard" },
  { name: "Asset Registration", icon: <PrecisionManufacturingRoundedIcon />, path: "/assets/register" },
  { name: "Stock List", icon: <Inventory2RoundedIcon />, path: "/assets" },
  { name: "Employee Details", icon: <PeopleAltRoundedIcon />, path: "/employees" },
  { name: "Onboarding", icon: <AssignmentTurnedInRoundedIcon />, path: "/onboarding" },
  { name: "Offboarding", icon: <KeyboardReturnRoundedIcon />, path: "/offboarding" },
  { name: "Reports", icon: <AssessmentRoundedIcon />, path: "/reports" },
];

function Sidebar() {
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <span className="section-kicker">AMS Control</span>
        <h1>Infoshare Assets</h1>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <strong>Hyderabad Branch</strong>
        <span>Company - Device - Location - Designation - YOM - ID</span>
      </div>
    </aside>
  );
}

export default Sidebar;
