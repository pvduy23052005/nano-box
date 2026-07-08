"use client"

import * as React from "react"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/src/lib/utils"
import { Label } from "@/src/components/ui/label"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field"

// ─── Re-export FormProvider as Form ────────────────────────────────────────────
const Form = FormProvider

// ─── FormField Context ──────────────────────────────────────────────────────────
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

/**
 * FormField – wraps react-hook-form's Controller and provides field context.
 *
 * @example
 * <FormField
 *   control={form.control}
 *   name="email"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>Email</FormLabel>
 *       <FormControl>
 *         <Input placeholder="you@example.com" {...field} />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

// ─── FormItem Context ───────────────────────────────────────────────────────────
type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

// ─── useFormField ───────────────────────────────────────────────────────────────
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField must be used within a <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// ─── FormItem ────────────────────────────────────────────────────────────────────
/**
 * FormItem – wrapper around the base `Field` component that injects an `id`
 * context used to wire up label, description, and message accessibility.
 */
function FormItem({
  className,
  ...props
}: React.ComponentProps<typeof Field>) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <Field
        data-slot="form-item"
        className={cn(className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

// ─── FormLabel ───────────────────────────────────────────────────────────────────
/**
 * FormLabel – label bound to the field input via `htmlFor`.
 * Automatically applies destructive styling when the field has an error.
 */
function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()

  return (
    <FieldLabel
      data-slot="form-label"
      data-error={!!error}
      htmlFor={formItemId}
      className={cn("data-[error=true]:text-destructive", className)}
      {...props}
    />
  )
}

// ─── FormControl ─────────────────────────────────────────────────────────────────
/**
 * FormControl – wraps the actual input element, injecting the correct
 * `id`, `aria-describedby`, and `aria-invalid` props for a11y.
 */
function FormControl({ ...props }: React.ComponentProps<"div">) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <div
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      data-slot="form-control"
      {...props}
    />
  )
}

// ─── FormDescription ─────────────────────────────────────────────────────────────
/**
 * FormDescription – helper text rendered below the input.
 */
function FormDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <FieldDescription
      data-slot="form-description"
      id={formDescriptionId}
      className={className}
      {...props}
    />
  )
}

// ─── FormMessage ─────────────────────────────────────────────────────────────────
/**
 * FormMessage – displays the validation error for the current field.
 * Falls back to `children` when provided, so you can render custom messages.
 */
function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <FieldError
      data-slot="form-message"
      id={formMessageId}
      role="alert"
      className={cn(className)}
      {...props}
    >
      {body}
    </FieldError>
  )
}

// ─── FormGroup – convenience wrapper ─────────────────────────────────────────
/**
 * FormGroup – wraps multiple `FormItem`s in a single column group.
 * Thin wrapper around `FieldGroup`.
 */
function FormGroup({
  className,
  ...props
}: React.ComponentProps<typeof FieldGroup>) {
  return (
    <FieldGroup
      data-slot="form-group"
      className={cn(className)}
      {...props}
    />
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormGroup,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
