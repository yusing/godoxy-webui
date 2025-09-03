import { Grid3X3 } from 'lucide-react'

export default function AppCategoryEmpty() {
  return (
    <div className="text-center py-12">
      <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">No apps found</p>
    </div>
  )
}
