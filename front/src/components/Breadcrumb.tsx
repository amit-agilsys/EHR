import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { RootState } from "store/store";

function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const patientName = useSelector(
    (state: RootState) => state.patient.patient.name
  );

  const filteredPathnames = pathnames.filter((segment, index) => {
    const nextSegment = pathnames[index + 1];
    return !(segment === "add" && !isNaN(Number(nextSegment)));
  });

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {/* Home */}
        <li className="inline-flex items-center">
          <Link
            to="/users"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-500"
          >
            <svg
              className="me-2.5 h-3 w-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
            </svg>
            Home
          </Link>
        </li>

        {filteredPathnames.map((value, index) => {
          const to = `/${filteredPathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === filteredPathnames.length - 1;
          const prevSegment = filteredPathnames[index - 1];
          let label = value.split("-").join(" ");

          if (
            !isNaN(Number(value)) &&
            prevSegment === "patients" &&
            patientName
          ) {
            label = patientName;
          }

          return (
            <li key={to} className="inline-flex items-center">
              <div className="flex items-center">
                <svg
                  className="mx-1 h-3 w-3 text-gray-500 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                {isLast ? (
                  <span className="ms-1 text-sm font-medium capitalize text-gray-700 md:ms-2">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="ms-1 text-sm font-medium capitalize text-gray-700 hover:text-blue-500 md:ms-2"
                  >
                    {label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
