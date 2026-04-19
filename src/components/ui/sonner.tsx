
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheck, Info, AlertTriangle, OctagonAlert, Loader } from "lucide-react"
import { useTheme } from "../ThemeProvider"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "system" } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheck className="size-4" />
        ),
        info: (
          <Info className="size-4" />
        ),
        warning: (
          <AlertTriangle className="size-4" />
        ),
        error: (
          <OctagonAlert className="size-4" />
        ),
        loading: (
          <Loader className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
