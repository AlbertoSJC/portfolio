import { useState, useCallback } from 'react';
import { Quest } from '@/domain/Quest';
import { FinancialCategory, QuestPriority } from '@/enums/finquestEnums';

interface QuestFormData {
  title: string;
  description: string;
  category: FinancialCategory;
  targetAmount: number;
  dueDate: string;
  priority: QuestPriority;
}

interface FormErrors {
  [key: string]: string;
}

export function useQuestForm(initialData?: Quest) {
  const [formData, setFormData] = useState<QuestFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || FinancialCategory.Savings,
    targetAmount: initialData?.targetAmount || 0,
    dueDate: initialData?.dueDate.toISOString().split('T')[0] || '',
    priority: initialData?.priority || QuestPriority.Medium,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    const selectedDate = new Date(formData.dueDate);
    if (selectedDate <= new Date()) {
      newErrors.dueDate = 'Due date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (field: keyof QuestFormData, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      category: FinancialCategory.Savings,
      targetAmount: 0,
      dueDate: '',
      priority: QuestPriority.Medium,
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    validateForm,
    resetForm,
  };
}
