import styles from "./AddItem.module.css";

interface AddItemTemplateProps {
  title: string;
  canAdd: boolean;
  handleAdd: () => void;
  children?: React.ReactNode;
}

function AddItemTemplate({
  title,
  canAdd,
  handleAdd,
  children,
}: AddItemTemplateProps) {
  return (
    <div className={`flex items-center gap-3 ${styles.addItemAction}`}>
      <h5 className="text-xl font-semibold tracking-wide text-gray-700">
        {title}s
      </h5>
      {canAdd && (
        <>
          <button
            className={`${styles.c_button} border-none`}
            onClick={handleAdd}
          >
            <span className={styles.c_main}>
              <span className={styles.c_ico}>
                <span className={styles.c_blur}></span>{" "}
                <span className={styles.ico_text}>+</span>
              </span>
              Add
            </span>
          </button>
          {children}
        </>
      )}
    </div>
  );
}

export default AddItemTemplate;
