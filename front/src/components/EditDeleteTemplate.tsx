import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md";

interface EditDeleteTemplate<T extends string | number> {
  id: T;
  _edit: boolean;
  _delete: boolean;
  handleEdit: (id: T) => void;
  handleDelete: (id: T) => void;
}

function EditDeleteTemplate<T extends string | number>({
  id,
  _edit,
  _delete,
  handleEdit,
  handleDelete,
}: EditDeleteTemplate<T>) {
  return (
    <div className="flex gap-1 justify-end items-center h-full">
      {_edit && (
        <button
          className="text-semibold me-2 rounded bg-gray-100 px-2 py-1.5 font-medium text-gray-600"
          onClick={() => handleEdit(id)}
        >
          <MdOutlineEdit />
        </button>
      )}
      {_delete && (
        <button
          className="me-2 rounded bg-red-100 px-2 py-1.5 text-sm font-medium text-red-400 dark:bg-red-900 dark:text-red-300"
          onClick={() => handleDelete(id)}
        >
          <MdOutlineDelete />
        </button>
      )}
    </div>
  );
}

export default EditDeleteTemplate;
