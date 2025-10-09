import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth.js";

export default function Layout() {
  const linkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClasses = "bg-gray-900 text-white";
  const inactiveLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold">
                Pokemon Crew
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>Pokédex</NavLink>
                  <NavLink to="/my-team" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>My Team</NavLink>
                  <NavLink to="/battle" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>Battle</NavLink>
                  <NavLink to="/battle-history" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>History</NavLink>
                  <div className="text-gray-300 text-sm">Hi, {currentUser.username}!</div>
                  <button onClick={logout} className={`${linkClasses} ${inactiveLinkClasses}`}>Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>Login</NavLink>
                  <NavLink to="/register" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>Register</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg"><Outlet /></div>
      </main>
    </div>
  );
}