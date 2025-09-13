import { Code, Route } from "lucide-react";

export const fileTypeLabels = {
  config: { label: 'GoDoxy Config', icon: Code },
  provider: { label: 'Route Files', icon: Route },
  middleware: { label: 'Middleware Compose', icon: Code },
} as const