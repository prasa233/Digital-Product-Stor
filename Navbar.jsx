import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/products">
        <strong>Digital Store</strong>
      </Link>

      <div className="nav-links">
        <Link to="/products">Products</Link>

        {token && (
          <>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
            <button onClick={logout}>
              Logout
            </button>
          </>
        )}

        {!token && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}