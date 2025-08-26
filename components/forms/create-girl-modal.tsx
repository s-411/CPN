'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, Plus, Edit } from 'lucide-react';
import {
  createGirlSchema,
  updateGirlSchema,
  NATIONALITY_OPTIONS,
  GIRL_FORM_CONFIG,
  type CreateGirlFormData,
  type UpdateGirlFormData,
} from '@/lib/validations/girl';
import type { Girl } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

interface CreateGirlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  girl?: Girl;
}

export function CreateGirlModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  girl,
}: CreateGirlModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nationalityInput, setNationalityInput] = useState('');
  const [showCustomNationality, setShowCustomNationality] = useState(false);

  const isEditMode = mode === 'edit' && girl;
  const schema = isEditMode ? updateGirlSchema : createGirlSchema;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateGirlFormData | UpdateGirlFormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? {
          name: girl.name,
          age: girl.age,
          nationality: girl.nationality,
          rating: girl.rating,
        }
      : {
          name: '',
          age: 18,
          nationality: '',
          rating: 1,
        },
  });

  const selectedNationality = watch('nationality');

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
      setNationalityInput('');
      setShowCustomNationality(false);

      if (isEditMode) {
        reset({
          name: girl.name,
          age: girl.age,
          nationality: girl.nationality,
          rating: girl.rating,
        });
        
        // Check if nationality is custom (not in predefined options)
        const isCustomNationality = !NATIONALITY_OPTIONS.some(
          option => option.value === girl.nationality
        );
        
        if (isCustomNationality) {
          setShowCustomNationality(true);
          setNationalityInput(girl.nationality);
        }
      } else {
        reset({
          name: '',
          age: 18,
          nationality: '',
          rating: 1,
        });
      }
    }
  }, [isOpen, isEditMode, girl, reset]);

  // Handle nationality selection
  const handleNationalityChange = (value: string) => {
    if (value === 'Other') {
      setShowCustomNationality(true);
      setNationalityInput('');
      setValue('nationality', '');
    } else {
      setShowCustomNationality(false);
      setNationalityInput('');
      setValue('nationality', value);
    }
  };

  // Handle custom nationality input
  const handleCustomNationalityChange = (value: string) => {
    setNationalityInput(value);
    setValue('nationality', value);
  };

  const onSubmit = async (data: CreateGirlFormData | UpdateGirlFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode) {
        const response = await fetch(`/api/girls/${girl.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update girl');
        }
      } else {
        const response = await fetch('/api/girls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create girl');
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error submitting girl form:', err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditMode ? 'update' : 'create'} girl. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent onClose={handleClose} className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <Edit className="h-5 w-5 text-cpn-yellow" />
            ) : (
              <Plus className="h-5 w-5 text-cpn-yellow" />
            )}
            <div>
              <DialogTitle>
                {isEditMode ? 'Edit Girl' : 'Create New Girl'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? 'Update girl information'
                  : 'Add a new girl to track'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogClose />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 p-6">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-cpn-white">
                {GIRL_FORM_CONFIG.name.label} *
              </Label>
              <input
                id="name"
                type="text"
                placeholder={GIRL_FORM_CONFIG.name.placeholder}
                maxLength={GIRL_FORM_CONFIG.name.maxLength}
                autoComplete={GIRL_FORM_CONFIG.name.autoComplete}
                className={cn(
                  "w-full px-3 py-2 bg-cpn-dark border rounded-md text-cpn-white placeholder:text-cpn-gray",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-cpn-gray/30 hover:border-cpn-gray/50"
                )}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Age Field */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-cpn-white">
                {GIRL_FORM_CONFIG.age.label} *
              </Label>
              <input
                id="age"
                type="number"
                min={GIRL_FORM_CONFIG.age.min}
                max={GIRL_FORM_CONFIG.age.max}
                placeholder={GIRL_FORM_CONFIG.age.placeholder}
                inputMode={GIRL_FORM_CONFIG.age.inputMode}
                className={cn(
                  "w-full px-3 py-2 bg-cpn-dark border rounded-md text-cpn-white placeholder:text-cpn-gray",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.age
                    ? "border-red-500 focus:ring-red-500"
                    : "border-cpn-gray/30 hover:border-cpn-gray/50"
                )}
                {...register('age', { valueAsNumber: true })}
              />
              {errors.age && (
                <p className="text-sm text-red-400">{errors.age.message}</p>
              )}
            </div>

            {/* Nationality Field */}
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-cpn-white">
                {GIRL_FORM_CONFIG.nationality.label} *
              </Label>
              {!showCustomNationality ? (
                <select
                  id="nationality"
                  className={cn(
                    "w-full px-3 py-2 bg-cpn-dark border rounded-md text-cpn-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.nationality
                      ? "border-red-500 focus:ring-red-500"
                      : "border-cpn-gray/30 hover:border-cpn-gray/50"
                  )}
                  value={selectedNationality || ''}
                  onChange={(e) => handleNationalityChange(e.target.value)}
                >
                  <option value="">{GIRL_FORM_CONFIG.nationality.placeholder}</option>
                  {NATIONALITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter nationality"
                    maxLength={50}
                    value={nationalityInput}
                    onChange={(e) => handleCustomNationalityChange(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 bg-cpn-dark border rounded-md text-cpn-white placeholder:text-cpn-gray",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      errors.nationality
                        ? "border-red-500 focus:ring-red-500"
                        : "border-cpn-gray/30 hover:border-cpn-gray/50"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomNationality(false);
                      setNationalityInput('');
                      setValue('nationality', '');
                    }}
                    className="text-sm text-cpn-yellow hover:text-cpn-yellow/80"
                  >
                    Choose from list instead
                  </button>
                </div>
              )}
              {errors.nationality && (
                <p className="text-sm text-red-400">{errors.nationality.message}</p>
              )}
            </div>

            {/* Rating Field */}
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-cpn-white">
                {GIRL_FORM_CONFIG.rating.label} *
              </Label>
              <input
                id="rating"
                type="number"
                min={GIRL_FORM_CONFIG.rating.min}
                max={GIRL_FORM_CONFIG.rating.max}
                placeholder={GIRL_FORM_CONFIG.rating.placeholder}
                inputMode={GIRL_FORM_CONFIG.rating.inputMode}
                className={cn(
                  "w-full px-3 py-2 bg-cpn-dark border rounded-md text-cpn-white placeholder:text-cpn-gray",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.rating
                    ? "border-red-500 focus:ring-red-500"
                    : "border-cpn-gray/30 hover:border-cpn-gray/50"
                )}
                {...register('rating', { valueAsNumber: true })}
              />
              {errors.rating && (
                <p className="text-sm text-red-400">{errors.rating.message}</p>
              )}
              <p className="text-xs text-cpn-gray">
                Rate from 1 (lowest) to 10 (highest)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-cpn-white border-cpn-gray/30 hover:bg-cpn-gray/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className=""
            >
              {isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Girl'
                : 'Create Girl'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}