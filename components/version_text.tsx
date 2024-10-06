import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Endpoints, { fetchEndpoint } from "@/types/endpoints";

export default function VersionText() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    fetchEndpoint(Endpoints.VERSION)
      .then((response) => response.text())
      .then((text) => setVersion(text))
      .catch((error) => toast.error(error));
  }, []);

  return <p className="text-xs place-self-end px-1">{version}</p>;
}
