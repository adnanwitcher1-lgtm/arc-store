import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center ${className}`} aria-label="JH home">
      <img src={logo} alt="JH" className="h-12 w-auto sm:h-14" />
    </Link>
  );
}
