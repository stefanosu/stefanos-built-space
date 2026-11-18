import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Legacy admin route - redirects to Tina CMS admin interface
 * This component exists to maintain compatibility with old bookmarks/links
 */
const AdminWrite = () => {
  useEffect(() => {
    // Redirect to Tina CMS admin
    window.location.href = "/admin/index.html";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to admin panel...</p>
      </div>
    </div>
  );
};

export default AdminWrite;
