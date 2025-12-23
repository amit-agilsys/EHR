import { Link } from "react-router-dom";
import { Button } from "./ui/button";

function AccessDenied({ redirectUrl = "login" }) {
  return (
    <div
      className="flex-column flex items-center justify-center"
      style={{ height: "100vh" }}
    >
      <div className="row text-center">
        <div className="col">
          <h1 className="text-6xl text-stone-600">Access denied</h1>
          <p className="mt-2">
            You do not have permission to access this page.
          </p>
          <p className="mt-1">Contact your Administrator.</p>
          <Link to={`/${redirectUrl}`}>
            <Button className="mt-4">Go Back</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
