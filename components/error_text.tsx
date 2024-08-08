import { FetchError } from "@/types/endpoints";

function errorText(error: string | Error | FetchError) {
  if (typeof error === "string") {
    return <p>{error}</p>;
  } else if (error instanceof Error) {
    return <p>{error.message}</p>;
  } else {
    return (
      <p>
        Status {error.status} - {error.statusText}
        <br />
        {error.content}
      </p>
    );
  }
}

export function ErrorText(args: {
  error: string | Error | FetchError;
  className?: string;
}) {
  return (
    <div className={"text-red-500 max-w-md px-4" + args.className || ""}>
      {errorText(args.error)}
    </div>
  );
}
