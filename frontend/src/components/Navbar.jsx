import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Material UI Icons matching your simplified request perfectly
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [username, setUsername] = useState("Admin User");
  const [role, setRole] = useState("IT Administrator");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("all");

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("amsUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const nameToDisplay = parsedUser.full_name || parsedUser.name || parsedUser.username;
        const roleToDisplay = parsedUser.role || parsedUser.designation;
        
        if (nameToDisplay) setUsername(nameToDisplay);
        if (roleToDisplay) setRole(roleToDisplay);
      }
    } catch (error) {
      console.error("Error parsing user context in navbar:", error);
    }

    // Close user dropdown if clicking outside of it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      sessionStorage.removeItem("amsUser");
      sessionStorage.removeItem("amsToken");
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="app-navbar">
      
      {/* Left Side: Hamburger Menu, Welcome Section, and Search Box */}
      <div className="navbar-left">
        <button 
          className="navbar-icon-btn hamburger-btn" 
          type="button" 
          aria-label="Menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <MenuRoundedIcon />
        </button>
        
        <div className="navbar-welcome-section">
          <p className="welcome-text">Welcome,</p>
          <h3 className="welcome-username" title={username}>{username}</h3>
        </div>
        
        <div className="navbar-search-box">
          <FilterListRoundedIcon className="search-icon" />
          <input 
            type="text" 
            className="search-input"
            placeholder="Search by Employee ID, Asset ID, User..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select 
            className="search-filter-select"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="employee">Employee ID</option>
            <option value="asset">Asset ID</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
      
      {/* Right Side: Notification Bell and Login user context details with dynamic dropdown menu */}
      <div className="navbar-right" ref={dropdownRef}>
        <button className="navbar-icon-btn notification-btn" type="button" aria-label="Notifications">
          <NotificationsNoneRoundedIcon />
        </button>
        <div 
          className="navbar-user-profile" 
          onClick={() => setShowDropdown(!showDropdown)}
          role="button"
          tabIndex={0}
        >
          <AccountCircleRoundedIcon className="profile-avatar-icon" />
          
          <div className="user-profile-details">
            <span className="profile-fullname">{username}</span>
            <span className="profile-role-title">{role}</span>
          </div>
          
          <KeyboardArrowDownRoundedIcon 
            className={`profile-dropdown-arrow ${showDropdown ? 'rotated' : ''}`} 
          />
        </div>

        {/* Dropdown Action Card */}
        {showDropdown && (
          <div className="navbar-profile-dropdown-card">
            <button className="dropdown-action-item" type="button" onClick={handleLogout}>
              <LogoutRoundedIcon className="dropdown-action-icon" />
              <span>Logout</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
}