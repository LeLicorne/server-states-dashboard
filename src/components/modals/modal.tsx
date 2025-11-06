import { XMarkIcon } from '@heroicons/react/16/solid';

import { cn } from '@/utils/cn';

import Button, { ButtonProps } from '../buttons/button';
import IconButton from '../buttons/icon-button';

export type ModalProps = {
  children: React.ReactNode;
  show: boolean;
  title?: string;
  variant?: ButtonProps['variant'];
  label?: string;
  action: () => void;
  close: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, show, title, variant, label, action, close }) => {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 transition-[opacity] z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-neutral-900/75',
          { 'opacity-0 mt-0 invisible': !show }
        )}
        role="dialog"
        tabIndex={-1}
      >
        <div
          className={cn(
            'relative mt-0 w-full max-w-2xl transform rounded-xl ease-out border bg-white shadow-sm transition-all duration-500 dark:border-neutral-800 dark:bg-neutral-900',
            {
              '-mt-7 opacity-0': !show,
            }
          )}
        >
          {title ? (
            <div className="flex flex-row items-center justify-between border-b px-4 py-2.5 dark:border-neutral-800">
              <h3 className="font-semibold">{title}</h3>
              <IconButton
                onClick={close}
                icon={<XMarkIcon className="size-4 shrink-0" />}
                className="p-1"
              />
            </div>
          ) : (
            <IconButton
              onClick={close}
              icon={<XMarkIcon className="size-4 shrink-0" />}
              className="absolute end-2 top-2"
            />
          )}

          <div className="text-wrap p-4 sm:p-6 md:p-10">{children}</div>

          <div className="flex items-center justify-end gap-x-2 rounded-b-xl border-t bg-gray-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
            <Button onClick={close} variant="transparent">
              Annuler
            </Button>
            <Button onClick={action} variant={variant} type="submit">
              {label || 'Confirmer'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
