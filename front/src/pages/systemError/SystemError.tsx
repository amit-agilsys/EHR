type Props = {
  message: string;
  statusCode: number;
};

function SystemError({ message, statusCode }: Props) {
  const error: { title: string; description: string } = {
    title: "Sorry - we've run into a problem",
    description: "Server Error",
  };

  switch (statusCode) {
    case 401:
      error.title = "You are not authorized to view this page";
      error.description = "Unauthorized";
      break;
    case 404:
      error.title = "The requested page cannot be found";
      error.description = "Not Found";
      break;
    case 403:
      error.title = "You don't have permission to view this page";
      error.description = "Restricted";
      break;
  }

  return (
    <div
      className="flex-column container flex items-center justify-center"
      style={{ height: "80vh" }}
    >
      <div className="row text-center">
        <div className="col">
          <h1 className="text-6xl text-stone-600">{message}</h1>
          <p className="mt-2 text-stone-600">{error.title}</p>
          <p className="text-stone-600">{error.description}</p>
        </div>
      </div>
    </div>
  );
}

export default SystemError;
