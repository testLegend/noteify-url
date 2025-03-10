
import { FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full py-6 mb-8">
      <div className="container flex justify-center items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Noteify</h1>
        </div>
      </div>
      <div className="container mt-2 text-center">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform any website into beautiful, readable notes with just a URL.
        </p>
      </div>
    </header>
  );
};

export default Header;
