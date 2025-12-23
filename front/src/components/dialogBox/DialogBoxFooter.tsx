import { Button } from "components/ui/button";
import { LuLoader } from "react-icons/lu";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

interface DialogBoxFooter {
  handleClose: () => void;
  handleSubmit: () => void;
}

export default function DialogBoxFooter({
  handleClose,
  handleSubmit,
}: DialogBoxFooter) {
  const isLoading = useSelector((state: RootState) => state.global.isLoading);

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={handleClose}>
        Close
      </Button>
      <Button onClick={handleSubmit} className={isLoading ? "cursor-wait" : ""}>
        {isLoading ? (
          <LuLoader className="mx-auto animate-spin" size={24} />
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  );
}
