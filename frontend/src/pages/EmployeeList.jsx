import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { employees } from "../data/mockData";

function EmployeeList() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const matchesSearch =
          employee.name.toLowerCase().includes(search.toLowerCase()) ||
          employee.employeeId.toLowerCase().includes(search.toLowerCase()) ||
          employee.department.toLowerCase().includes(search.toLowerCase());
        const matchesDepartment = department === "All" || employee.department === department;
        return matchesSearch && matchesDepartment;
      }),
    [search, department],
  );

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="section-kicker">Employee Details Module</span>
          <h1>Search employees, departments, assigned assets, and history.</h1>
          <p>
            IT managers can filter by employee name, employee ID, or department and open a
            detailed view of assigned assets, onboarding, and offboarding records.
          </p>
        </div>
      </section>

      <section className="table-card">
        <div className="toolbar">
          <input
            className="text-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee name, ID, or department"
          />
          <select className="select-input" value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option>All</option>
            {[...new Set(employees.map((employee) => employee.department))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Mobile</th>
                <th>Assigned Assets</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.employeeId}>
                  <td>
                    <div className="split-value">
                      <strong>{employee.name}</strong>
                      <span className="meta-copy">{employee.employeeId}</span>
                    </div>
                  </td>
                  <td>{employee.department}</td>
                  <td>{employee.designation}</td>
                  <td>{employee.mobile}</td>
                  <td>{employee.assets.length}</td>
                  <td>
                    <Link className="inline-link" to={`/employees/${employee.employeeId}`}>
                      Open profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default EmployeeList;
