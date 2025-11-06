import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import Modal from './modal';

interface DangerModalProps {
  show: boolean;
  title?: string;
  description?: string;
  label?: string;
  action: () => void;
  close: () => void;
}

const DangerModal: React.FC<DangerModalProps> = ({
  show,
  title,
  description,
  label,
  action,
  close,
}) => {
  return (
    <>
      <Modal show={show} label={label} action={action} close={close}>
        <div className="flex gap-x-4 md:gap-x-7">
          <span className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-full border-4 border-red-50 bg-red-100 text-red-500 dark:border-red-600 dark:bg-red-700 dark:text-red-100 sm:size-[62px]">
            <ExclamationTriangleIcon className="size-5 shrink-0 sm:size-6" />
          </span>
          <div className="grow">
            <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-neutral-200">
              {title || 'Êtes-vous sur de vouloir continuer ?'}
            </h3>
            <p className="text-gray-500 dark:text-neutral-500">
              {description || 'Cette action est irréversible et ne peut pas être annulée.'}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DangerModal;
