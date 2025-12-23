import { Link } from "react-router-dom";
import pageNotFound from "/images/page-not-found.png";
import { useRedirectUrl } from "hooks/useRedirectUrl";
import { Button } from "components/ui/button";

export default function PageNotFound() {
  const url = useRedirectUrl();

  return (
    <div className="PageNotFound flex h-screen w-screen overflow-hidden flex-col items-center justify-center gap-4 bg-white">
      <img
        src={pageNotFound}
        alt="page not found"
        className="max-h-[70vh] object-contain"
      />
      <h2 className="text-4xl">Page not found</h2>
      <div className="LoginButton">
        <Link to={url}>
          <Button>Go Back</Button>
        </Link>
      </div>
    </div>
  );
}
