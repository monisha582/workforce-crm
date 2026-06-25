import { toast } from 'sonner';

export const showToast = {
  success: (message) => toast.success(message, { duration: 3000 }),
  error: (message) => toast.error(message, { duration: 4000 }),
  info: (message) => toast.info(message, { duration: 3000 }),
  loading: (message) => toast.loading(message),
};

export const showErrorToast = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    'Something went wrong';
  showToast.error(message);
};
