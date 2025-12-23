import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LuLoader } from "react-icons/lu";

interface ConfirmDeleteProp {
  open: boolean;
  handleClose: () => void;
  handleDelete: () => void;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  deleteStatus: boolean;
}

const ConfirmDelete: React.FC<ConfirmDeleteProp> = ({
  open,
  openChange,
  handleClose,
  handleDelete,
  deleteStatus = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={openChange}>
      <AlertDialogTrigger asChild>
        <button className="hidden" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {deleteStatus ? (
              <LuLoader className="mx-auto animate-spin" size={24} />
            ) : (
              "Continue"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDelete;
