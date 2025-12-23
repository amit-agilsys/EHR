import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";

import { DialogDescription } from "@/components/ui/dialog";
import DialogBoxFooter from "./DialogBoxFooter";
import { X } from "lucide-react";

interface DialogBoxProps {
  heading: string;
  isDialogVisible: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
  children: ReactNode;
  dialogWidh?: string;
}

function DialogBox({
  heading,
  isDialogVisible,
  handleClose,
  handleSubmit,
  children,
  dialogWidh,
}: DialogBoxProps) {
  return (
    <Dialog
      open={isDialogVisible}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogDescription className="hidden">{heading}</DialogDescription>
      <DialogContent
        className={dialogWidh}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-row justify-between items-center border-b-2 pb-2">
            <DialogTitle className="text-lg font-semibold text-gray-800 p-1 ">
              {heading}
            </DialogTitle>
            <X className="h-4 w-4 cursor-pointer" onClick={handleClose} />
          </DialogHeader>

          <div>{children}</div>

          <DialogFooter>
            <DialogBoxFooter
              handleClose={handleClose}
              handleSubmit={handleSubmit}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DialogBox;
