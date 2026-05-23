"use client";

import z from "zod";
import Image from "next/image";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CredentialType } from "@/generated/prisma/enums";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and container only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export type GeminiFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GeminiFormValues) => void;
  defaultValues?: Partial<GeminiFormValues>;
}

export const GeminiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.GEMINI);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      variableName: defaultValues.variableName || "",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });

  const watchVariableName = form.watch("variableName") || "myGemini";

  const handleSubmit = (values: GeminiFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  // Reset form values when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        variableName: defaultValues.variableName || "",
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gemini Configuration</DialogTitle>

          <DialogDescription>
            Configure the AI model and prompts for this node.
          </DialogDescription>
        </DialogHeader>

        <form
          id="gemini-dialog"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-4 space-y-8"
        >
          <FieldGroup>
            <Controller
              name="variableName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Variable Name</FieldLabel>

                  <Input
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="myGemini"
                    {...field}
                  />

                  <FieldDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="credentialId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="type-select">
                    Gemini Credential
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="type-select"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoadingCredentials || !credentials?.length}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select a credential" />
                    </SelectTrigger>

                    <SelectContent position="item-aligned">
                      {credentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/logos/gemini.svg"
                              alt="Gemini"
                              width={16}
                              height={16}
                            />
                            {credential.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="systemPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    System Prompt (Optional)
                  </FieldLabel>

                  <Textarea
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="You are a helpful assistant."
                    className="min-h-[80px] font-mono text-sm"
                    {...field}
                  />

                  <FieldDescription>
                    Sets the behavior of the assistant. Use {"{{variables}}"}{" "}
                    for simple values or {"{{json variable}}"} to stringify
                    objects
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="userPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>User Prompt</FieldLabel>

                  <Textarea
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="You are a helpful assistant."
                    className="min-h-[120px] font-mono text-sm"
                    {...field}
                  />

                  <FieldDescription>
                    The prompt to send to the AI. Use {"{{variables}}"} for
                    simple values or {"{{json variables}}"} to stringify objects
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter className="mt-4">
          <Field orientation="responsive">
            <Button type="submit" form="gemini-dialog">
              Save
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
