
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TermsDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the terms
    const hasAcceptedTerms = localStorage.getItem('termsAccepted') === 'true';
    if (!hasAcceptedTerms) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('termsAccepted', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Before using Noteify, please accept our Terms and Conditions.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto text-sm my-4 p-4 border rounded-md bg-secondary/10">
          <p className="mb-2">
            By using Noteify, you agree to our Terms and Conditions relating to web scraping and data collection.
          </p>
          <p className="mb-2">
            You confirm that:
          </p>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li>You are requesting content from websites that you have legal access to</li>
            <li>You acknowledge our service only processes publicly available content</li>
            <li>You are responsible for ensuring your use of the extracted content complies with copyright laws</li>
            <li>Free users are limited to 2 note conversions</li>
          </ul>
          <p>
            <Link to="/terms" className="text-primary hover:underline" onClick={() => setOpen(false)}>
              Read full Terms and Conditions
            </Link>
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleAccept} className="w-full sm:w-auto">
            I Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
